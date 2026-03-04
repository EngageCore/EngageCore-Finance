/* eslint-disable */
/* prettier-ignore */

// =====================
// Custom Module Routes
//
// Add new feature modules here.
// Each module follows the same pattern:
// - Parent route with `layout: 'base'` and `children`
// - Child routes with `view` pointing to the page component
// =====================

export const customModuleRoutes = [
  {
    name: 'management',
    path: '/management',
    layout: 'base',
    meta: {
      title: 'management',
      i18nKey: 'management',
      icon: 'fa6-solid:users-gear',
      order: 6
    },
    children: [
      {
        name: 'management_role',
        path: 'role',
        view: () => import("@/views/management/role.vue"),
        meta: {
          title: 'role',
          i18nKey: 'role',
          icon: 'fa6-solid:user-shield',
          order: 1,
          keepAlive: true
        }
      },
      {
        name: 'management_user',
        path: 'user',
        view: () => import("@/views/management/user.vue"),
        meta: {
          title: 'user',
          i18nKey: 'user',
          icon: 'fa6-solid:user',
          order: 2,
          keepAlive: true
        }
      },
      {
        name: 'management_brand',
        path: 'brand',
        view: () => import("@/views/management/brand.vue"),
        meta: {
          title: 'brand',
          i18nKey: 'brand',
          icon: 'fa6-solid:tags',
          order: 3,
          keepAlive: true
        }
      },
      {
        name: 'management_bankProvider',
        path: 'bank-provider',
        view: () => import("@/views/management/bankProvider.vue"),
        meta: {
          title: 'bankProvider',
          i18nKey: 'bankProvider',
          icon: 'fa6-solid:building-columns',
          order: 4,
          keepAlive: true
        }
      }
    ]
  }
];
