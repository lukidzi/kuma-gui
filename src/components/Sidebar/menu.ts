import { RouteLocation } from 'vue-router'

import meshIcon from '@/assets/images/icon-service-mesh.svg?raw'
import { Policy } from '@/types'

type TODO = any
type KIconType = 'gearFilled'

export interface MenuNavItem {
  name: string
  link?: RouteLocation
  subNav?: MenuNavItem[]
  title?: boolean
  nested?: boolean
  parent?: string
  pathFlip?: boolean
  insightsFieldAccessor?: string
  featureFlags?: string[]
}

export interface MenuItem {
  name: string
  icon?: KIconType
  link?: string
  iconCustom?: TODO
  subNav?: {
    items: MenuNavItem[]
  }
}

export interface MenuSection {
  position: string
  items: MenuItem[]
}

export function getTopMenuItems(policies: Policy[]) {
  const policyItems = policies.map((policy) => ({
    name: policy.pluralDisplayName,
    link: policy.path,
    title: false,
    usesMeshParam: true,
    parent: 'policies',
    insightsFieldAccessor: `mesh.policies.${policy.name}`,
  }))

  policyItems.sort((policyItemA, policyItemB) => (policyItemA.name < policyItemB.name ? -1 : 1))

  return [
    {
      name: 'Service Mesh',
      iconCustom: meshIcon,
      link: 'home',
      subNav: {
        items: [
          {
            name: 'Overview',
            link: 'global-overview',
            usesMeshParam: true,
          },
          {
            name: 'Meshes',
            link: 'mesh-child',
            pathFlip: true,
            usesMeshParam: true,
            insightsFieldAccessor: 'global.Mesh',
          },
          {
            name: 'Zones',
            title: true,
          },
          {
            name: 'Zone CPs',
            link: 'zones',
            insightsFieldAccessor: 'global.Zone',
          },
          {
            name: 'Zone Ingresses',
            link: 'zoneingresses',
            insightsFieldAccessor: 'global.ZoneIngress',
          },
          {
            name: 'Zone Egresses',
            link: 'zoneegresses',
            insightsFieldAccessor: 'global.ZoneEgress',
          },
          {
            name: 'Services',
            title: true,
          },
          {
            name: 'Internal',
            link: 'internal-services',
            title: false,
            usesMeshParam: true,
            insightsFieldAccessor: 'mesh.services.internal',
          },
          {
            name: 'External',
            link: 'external-services',
            title: false,
            usesMeshParam: true,
            insightsFieldAccessor: 'mesh.services.external',
          },
          {
            name: 'Data plane proxies',
            title: true,
          },
          {
            name: 'Data planes',
            link: 'data-plane-list-view',
            title: false,
            usesMeshParam: true,
            insightsFieldAccessor: 'mesh.dataplanes.total',
          },
          {
            name: 'Policies',
            title: true,
          },
          ...policyItems,
        ],
      },
    },
  ]
}

export function getBottomMenuItems() {
  return [
    {
      name: 'Diagnostics',
      icon: 'gearFilled',
      link: 'diagnostics',
    },
  ]
}
