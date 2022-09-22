import { createStore } from 'vuex'
import { createRouter, createWebHashHistory } from 'vue-router'
import { RouterLinkStub } from '@vue/test-utils'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/vue'
import { KAlert, KBadge, KButton, KEmptyState, KIcon, KModal, KPop } from '@kong/kongponents'

import App from './App.vue'
import TestComponent from '@/testUtils/TestComponent.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TestComponent,
    },
  ],
})

function renderComponent({ status = 'OK', tagline = 'Kuma' }: { status?: string, tagline?: string }) {
  const store = createStore({
    modules: {
      config: {
        namespaced: true,
        state: {
          status: null,
          tagline: 'Kuma',
          version: null,
          clientConfig: {
            mode: 'global',
            environment: 'universal',
          },
        },
        getters: {
          getStatus: (state) => {
            state.status = status

            return state.status
          },
          getTagline: (state) => {
            state.tagline = tagline

            return state.tagline
          },
          getVersion: (state) => state.version,
          getEnvironment: (state) => state.clientConfig?.environment,
          getMulticlusterStatus: () => true,
        },
      },
      onboarding: {
        namespaced: true,
        getters: {
          showOnboarding: () => false,
        },
      },
      sidebar: {
        namespaced: true,
        state: {
          insights: {},
        },
      },
      notifications: {
        namespaced: true,
        getters: {
          amountOfActions: () => undefined,
        },
      },
    },
    state: {
      policies: [],
      meshes: [{}],
      globalLoading: true,
    },
    actions: {
      bootstrap: ({ state }) => {
        state.globalLoading = false
      },
    },
  })

  return render(App, {
    global: {
      plugins: [router, store],
      stubs: {
        'router-link': RouterLinkStub,
      },
      components: {
        KAlert,
        KBadge,
        KButton,
        KEmptyState,
        KIcon,
        KModal,
        KPop,
      },
    },
  })
}

describe('App.vue', () => {
  it('renders main view when succesful', async () => {
    renderComponent({ status: 'OK' })

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

    expect(screen.getByText('TestComponent')).toBeInTheDocument()
  })

  it('fails to renders basic view', async () => {
    const { container } = renderComponent({ status: 'ERROR' })

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

    expect(container).toMatchSnapshot()
  })
})
