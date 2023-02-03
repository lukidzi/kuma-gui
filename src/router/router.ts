import {
  createRouter as createVueRouter,
  createWebHistory,
  NavigationGuard,
  Router,
  RouteRecordRaw,
} from 'vue-router'

import { store } from '@/store/store'
import { ClientStorage } from '@/utilities/ClientStorage'

export function createRouter(routes: readonly RouteRecordRaw[], baseGuiPath: string = '/'): Router {
  const router = createVueRouter({
    history: createWebHistory(baseGuiPath),
    routes,
  })

  router.beforeEach(redirectOldHashHistoryUrlPaths)
  router.beforeEach(updateSelectedMeshGuard)
  router.beforeEach(onboardingRouteGuard)

  return router
}

/**
 * Redirects navigations to old hash history-style URL paths.
 */
const redirectOldHashHistoryUrlPaths: NavigationGuard = function (to, _from, next) {
  if (to.fullPath.startsWith('/#/')) {
    next(to.fullPath.substring(2))
  } else {
    next()
  }
}

/**
 * Updates `state.selectedMesh` when navigating to a page associated to a different mesh.
 */
const updateSelectedMeshGuard: NavigationGuard = function (to, _from, next) {
  if (to.params.mesh && to.params.mesh !== store.state.selectedMesh) {
    store.dispatch('updateSelectedMesh', to.params.mesh)
  }

  next()
}

/**
 * Redirects the user to the appropriate onboarding view if they haven’t completed it, yet.
 *
 * Redirects the user to the home view if they’re navigating to an onboarding route while having already completed onboarding. An exception is made when we suggest onboarding for users who don’t have data plane proxies, yet (we show an alert suggesting it and allow going to the onboarding again).
 */
const onboardingRouteGuard: NavigationGuard = function (to, _from, next) {
  const isOnboardingCompleted = store.state.onboarding.isCompleted
  const isOnboardingRoute = to.meta.onboardingProcess
  const shouldSuggestOnboarding = store.getters.shouldSuggestOnboarding

  if (isOnboardingCompleted && isOnboardingRoute && !shouldSuggestOnboarding) {
    next({ name: 'home' })
  } else if (!isOnboardingCompleted && !isOnboardingRoute && shouldSuggestOnboarding) {
    next({ name: ClientStorage.get('onboardingStep') ?? 'onboarding-welcome' })
  } else {
    next()
  }
}
