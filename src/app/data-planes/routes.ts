import { getLastNumberParameter } from '@/router/getLastParameter'
import type { RouteRecordRaw } from 'vue-router'
export const routes = () => {
  const item = (prefix: string = 'data-plane'): RouteRecordRaw[] => {
    return [
      {
        path: `${prefix}`,
        name: `${prefix}-abstract-view`,
        meta: {
          title: 'Data Plane Proxies',
          isBreadcrumb: true,
        },
        redirect: () => ({ name: 'data-planes-list-view' }),
        children: [
          {
            path: ':dataPlane',
            name: `${prefix}-detail-view`,
            meta: {
              title: 'Data plane proxy',
            },
            component: () => import('@/app/data-planes/views/DataPlaneDetailView.vue'),
          },
        ],
      },
    ]
  }

  return {
    items: (prefix: string = 'data-planes'): RouteRecordRaw[] => {
      return [
        {
          path: `${prefix}`,
          children: [
            {
              path: '',
              children: [
                {
                  path: '',
                  name: `${prefix}-list-view`,
                  meta: {
                    title: 'Data plane proxies',
                  },
                  props: (route) => ({
                    selectedDppName: route.query.dpp,
                    offset: getLastNumberParameter(route.query.offset),
                  }),
                  component: () => import('@/app/data-planes/views/DataPlaneListView.vue'),
                  // children: [
                  //   ...(item(prefix)[0]).children ?? [],
                  // ],
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
