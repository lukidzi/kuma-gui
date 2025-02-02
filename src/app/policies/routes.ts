import { getLastNumberParameter } from '@/router/getLastParameter'
import type { State } from '@/store/storeConfig'
import type { RouteRecordRaw } from 'vue-router'
import type { Store } from 'vuex'

export const routes = (store: Store<State>) => {
  const item = (prefix: string = 'policy'): RouteRecordRaw[] => {
    return [
      {
        path: `${prefix}`,
        name: `${prefix}-abstract-view`,
        meta: {
          title: 'Policies',
          isBreadcrumb: true,
        },
        redirect: () => ({ name: 'policies-list-view' }),
        children: [
          {
            path: `${prefix === 'policy' ? ':policyPath/' : ''}:policy`,
            name: `${prefix}-detail-view`,
            props: (route) => ({
              mesh: route.params.mesh,
              policyPath: route.params.policyPath,
              policyName: route.params.policy,
            }),
            component: () => import('@/app/policies/views/PolicyDetailView.vue'),
          },
        ],
      },
    ]
  }

  return {
    items: (prefix: string = 'policies'): RouteRecordRaw[] => {
      return [
        {
          path: `${prefix}`,
          children: [
            {
              path: '',
              children: [
                {
                  path: '',
                  name: `${prefix}`,
                  meta: {
                    title: 'Policies',
                  },
                  redirect: (to) => {
                    let item = store.state.policyTypes.find((item) => {
                      if (!(item.name in store.state.sidebar.insights.mesh.policies)) {
                        return false
                      }

                      return store.state.sidebar.insights.mesh.policies[item.name] !== 0
                    })

                    if (item === undefined) {
                      item = store.state.policyTypes[0]
                    }

                    if (item === undefined) {
                      return { name: 'home' }
                    }

                    return {
                      ...to,
                      params: {
                        ...to.params,
                        policyPath: item.path,
                      },
                      name: 'policies-list-view',
                    }
                  },
                  children: [
                    {
                      path: ':policyPath',

                      name: `${prefix}-list-view`,
                      component: () => import('@/app/policies/views/PolicyListView.vue'),
                      props: (route) => ({
                        policyPath: route.params.policyPath,
                        selectedPolicyName: route.query.policy,
                        offset: getLastNumberParameter(route.query.offset),
                      }),
                      // children: [
                      //   ...(item(prefix)[0]).children ?? [],
                      // ],
                    },
                  ],
                },

              ],
            },
          ],
        },
      ]
    },
    item,
  }
}
