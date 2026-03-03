/* eslint-disable */
/* prettier-ignore */

// =====================
// Layouts
// =====================

import BaseLayout from "@/layouts/base-layout/index.vue";
import BlankLayout from "@/layouts/blank-layout/index.vue";

export const layouts = {
  base: BaseLayout,
  blank: BlankLayout,
};

// =====================
// Default Route Definitions
//
// Built-in routes such as error pages, login, home, iframe.
// These are constant/system routes that rarely change.
// =====================

const defaultRoutes = [
  {
    name: '403',
    path: '/403',
    layout: 'blank',
    view: () => import("@/views/_builtin/403/index.vue"),
    meta: {
      title: '403',
      i18nKey: 'route.403',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '404',
    path: '/404',
    layout: 'blank',
    view: () => import("@/views/_builtin/404/index.vue"),
    meta: {
      title: '404',
      i18nKey: 'route.404',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '500',
    path: '/500',
    layout: 'blank',
    view: () => import("@/views/_builtin/500/index.vue"),
    meta: {
      title: '500',
      i18nKey: 'route.500',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'home',
    path: '/home',
    layout: 'base',
    view: () => import("@/views/home/index.vue"),
    meta: {
      title: 'home',
      i18nKey: 'home',
      icon: 'fa6-solid:gauge-high',
      order: 1
    }
  },
  {
    name: 'iframe-page',
    path: '/iframe-page/:url',
    layout: 'base',
    view: () => import("@/views/_builtin/iframe-page/[url].vue"),
    meta: {
      title: 'iframe-page',
      i18nKey: 'route.iframe-page',
      constant: true,
      hideInMenu: true,
      keepAlive: true
    }
  },
  {
    name: 'login',
    path: '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
    layout: 'blank',
    view: () => import("@/views/_builtin/login/index.vue"),
    meta: {
      title: 'login',
      i18nKey: 'login',
      constant: true,
      hideInMenu: true
    }
  }
];

// =====================
// Custom Module Routes (imported from routes.js)
// To add new modules, edit routes.js
// =====================

import { customModuleRoutes } from './routes';

// =====================
// Combined Generated Routes
// =====================

export const generatedRoutes = [...defaultRoutes, ...customModuleRoutes];

// =====================
// Route Transformation
// =====================

/**
 * transform elegant const routes to vue routes
 * @param routes elegant const routes
 */
export function transformElegantRoutesToVueRoutes(routes) {
  return routes.flatMap(route => transformElegantRouteToVueRoute(route));
}

/**
 * transform elegant route to vue route
 * @param route elegant const route
 */
function transformElegantRouteToVueRoute(route) {
  const ROUTE_DEGREE_SPLITTER = '_';

  function isFirstLevelRoute(item) {
    return !item.name.includes(ROUTE_DEGREE_SPLITTER);
  }

  function isSingleLevelRoute(item) {
    return isFirstLevelRoute(item) && !item.children?.length;
  }

  const vueRoutes = [];

  // add props: true to route
  if (route.path.includes(':') && !route.props) {
    route.props = true;
  }

  const { name, path, layout, view, children, ...rest } = route;
  const vueRoute = { name, path, ...rest };

  try {
    // Single-level route: wrap view inside layout
    if (isSingleLevelRoute(route) && layout && view) {
      if (!layouts[layout]) {
        throw new Error(`Layout "${layout}" not found`);
      }

      return [{
        path,
        component: layouts[layout],
        meta: {
          title: route.meta?.title || ''
        },
        children: [{
          name,
          path: '',
          component: view,
          ...rest
        }]
      }];
    }

    // Parent route with layout
    if (layout) {
      if (!layouts[layout]) {
        throw new Error(`Layout "${layout}" not found`);
      }
      vueRoute.component = layouts[layout];
    }

    // Child route with view (no layout)
    if (view && !layout) {
      vueRoute.component = view;
    }

  } catch (error) {
    console.error(`Error transforming route "${route.name}": ${error.toString()}`);
    return [];
  }

  // add redirect to child
  if (children?.length && !vueRoute.redirect) {
    vueRoute.redirect = {
      name: children[0].name
    };
  }

  if (children?.length) {
    const childRoutes = children.flatMap(child => transformElegantRouteToVueRoute(child));

    if(isFirstLevelRoute(route)) {
      vueRoute.children = childRoutes;
    } else {
      vueRoutes.push(...childRoutes);
    }
  }

  vueRoutes.unshift(vueRoute);

  return vueRoutes;
}

// =====================
// Route Map (auto-generated from generatedRoutes)
// =====================

function buildRouteMap(routes, parentPath = '') {
  const map = {};
  for (const route of routes) {
    const fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`;
    map[route.name] = fullPath;
    if (route.children) {
      Object.assign(map, buildRouteMap(route.children, fullPath));
    }
  }
  return map;
}

const routeMap = {
  root: '/',
  'not-found': '/:pathMatch(.*)*',
  ...buildRouteMap(generatedRoutes)
};

/**
 * get route path by route name
 * @param name route name
 */
export function getRoutePath(name) {
  return routeMap[name];
}

/**
 * get route name by route path
 * @param path route path
 */
export function getRouteName(path) {
  const routeEntries = Object.entries(routeMap);

  const routeName = routeEntries.find(([, routePath]) => routePath === path)?.[0] || null;

  return routeName;
}
