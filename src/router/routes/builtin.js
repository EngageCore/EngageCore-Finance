import { getRoutePath, transformElegantRoutesToVueRoutes } from '../elegant';

export const ROOT_ROUTE = {
  name: 'root',
  path: '/',
  redirect: getRoutePath(import.meta.env.VITE_ROUTE_HOME) || '/home',
  meta: {
    title: 'root',
    constant: true
  }
};

const NOT_FOUND_ROUTE = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  layout: 'blank',
  view: () => import("@/views/_builtin/404/index.vue"),
  meta: {
    title: 'not-found',
    constant: true
  }
};

/** builtin routes, it must be constant and setup in vue-router */
const builtinRoutes = [ROOT_ROUTE, NOT_FOUND_ROUTE];

/** create builtin vue routes */
export function createBuiltinVueRoutes() {
  return transformElegantRoutesToVueRoutes(builtinRoutes);
}
