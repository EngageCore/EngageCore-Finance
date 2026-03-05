import { computed, nextTick, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { useBoolean } from '@sa/hooks';
import { router } from '@/router';
import { fetchGetConstantRoutes, fetchGetUserRoutes, fetchIsRouteExist } from '@/service/api';
import { SetupStoreId } from '@/enum';
import { createStaticRoutes, getAuthVueRoutes } from '@/router/routes';
import { ROOT_ROUTE } from '@/router/routes/builtin';
import { getRouteName, getRoutePath } from '@/router/elegant';
import { useAuthStore } from '@/store/useAuthStore';
import { useTabStore } from '@/store/useTabStore';
import { useSvgIcon } from '@/hooks/icon';
import { $t } from '@/locales';

function filterAuthRoutesByRoles(routes, roles) {
  return routes.flatMap(route => filterAuthRouteByRoles(route, roles));
}
function filterAuthRouteByRoles(route, roles) {
  const filterRoute = { ...route };
  if (filterRoute.meta && filterRoute.meta.roles?.length) {
    if (!roles.some(role => filterRoute.meta.roles.includes(role))) {
      return [];
    }
  }
  if (filterRoute.children?.length) {
    filterRoute.children = filterRoute.children.flatMap(item => filterAuthRouteByRoles(item, roles));
    if (filterRoute.children.length === 0) {
      return [];
    }
  }
  return [filterRoute];
}
function sortRouteByOrder(route) {
  if (route.children?.length) {
    route.children.sort((next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0));
    route.children.forEach(sortRouteByOrder);
  }
}
function sortRoutesByOrder(routes) {
  routes.sort((next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0));
  routes.forEach(sortRouteByOrder);
  return routes;
}
function getGlobalMenuByBaseRoute(route) {
  const { name, path } = route;
  const { title, i18nKey, icon = 'fa6-solid:bars', localIcon, order = 0 } = route.meta || {};
  const label = i18nKey ? $t(i18nKey) : title;
  const menu = { key: name, label, i18nKey, routeName: name, routePath: path, order };
  if (icon) {
    const { SvgIconVNode } = useSvgIcon();
    menu.icon = () => SvgIconVNode({ icon, localIcon });
  }
  return menu;
}
function getGlobalMenusByAuthRoutes(routes, authStore) {
  const menus = [];
  const hasPagePermission = route => {
    const pageId = route.meta?.pageId;
    // 没有配置 pageId 的路由不做页面权限控制
    if (!pageId) return true;

    const accessPageIds = authStore?.userInfo?.accessPageIds || [];
    if (!Array.isArray(accessPageIds)) return false;

    return accessPageIds.includes(pageId);
  };
  const typeId = authStore?.userInfo?.typeId || 0;
  // typeId === 2 => super admin (host turnover only)
  // typeId === 1 => brand user (all modules, but no host turnover)
  const isSuperAdmin = typeId === 2;
  
  routes.forEach(route => {
    // Page-level permission check for top-level routes (single-level pages)
    if (!hasPagePermission(route)) {
      return;
    }
    // Route-level filtering by type
    if (isSuperAdmin) {
      // Super admin: only show host turnover leaderboard module (and keep home)
      if (route.name && route.name !== 'turnover-leaderboard' && route.name !== 'home') {
        return;
      }
    }
    // Brand user (typeId === 1): show all modules, filtering is handled on children level

    if (!route.meta?.hideInMenu) {
      const menu = getGlobalMenuByBaseRoute(route);
      
      // Filter children routes based on typeId and hideInMenu
      if (route.children?.length) {
        menu.children = route.children
          .filter(child => {
            // Page-level permission check for child routes
            if (!hasPagePermission(child)) return false;

            // Filter out hidden menu items
            if (child.meta?.hideInMenu) return false;
            
            // Filter turnover leaderboard children based on typeId
            // Host turnover leaderboard (child route):
            // - For host/super admin (typeId === 2): show
            // - For brand user (typeId === 1): hide
            if (child.name === 'turnover-leaderboard_turnover-leaderboard-host') {
              return typeId === 2;
            }
            // Brand turnover leaderboard (child route):
            // - For brand user (typeId === 1): show
            // - For super admin (typeId === 2): hide
            if (child.name === 'turnover-leaderboard_turnover-leaderboard-brand') {
              return typeId === 1;
            }
            
            return true;
          })
          .map(child => getGlobalMenuByBaseRoute(child));
      }
      
      // Only add menu if:
      // 1. It's a single-level route (no children), OR
      // 2. It has visible children after filtering
      if (!route.children?.length || (menu.children && menu.children.length > 0)) {
        menus.push(menu);
      }
    }
  });
  return menus;
}
function updateLocaleOfGlobalMenus(menus) {
  const result = [];
  menus.forEach(menu => {
    const { i18nKey, label } = menu;
    const newLabel = i18nKey ? $t(i18nKey) : label;
    const newMenu = { ...menu, label: newLabel };
    if (menu.children?.length) {
      newMenu.children = updateLocaleOfGlobalMenus(menu.children);
    }
    result.push(newMenu);
  });
  return result;
}
function getCacheRouteNames(routes) {
  const cacheNames = [];
  routes.forEach(route => {
    route.children?.forEach(child => {
      if (child.component && child.meta?.keepAlive) {
        cacheNames.push(child.name);
      }
    });
  });
  return cacheNames;
}
function recursiveGetIsRouteExistByRouteName(route, routeName) {
  let isExist = route.name === routeName;
  if (isExist) return true;
  if (route.children?.length) {
    isExist = route.children.some(item => recursiveGetIsRouteExistByRouteName(item, routeName));
  }
  return isExist;
}
function isRouteExistByRouteName(routeName, routes) {
  return routes.some(route => recursiveGetIsRouteExistByRouteName(route, routeName));
}
function getSelectedMenuKeyPathByKey(selectedKey, menus) {
  const keyPath = [];
  menus.some(menu => {
    const path = findMenuPath(selectedKey, menu);
    const isFound = Boolean(path?.length);
    if (isFound) keyPath.push(...path);
    return isFound;
  });
  return keyPath;
}
function findMenuPath(targetKey, menu) {
  const path = [];
  function dfs(item) {
    path.push(item.key);
    if (item.key === targetKey) return true;
    if (item.children) {
      for (const child of item.children) {
        if (dfs(child)) return true;
      }
    }
    path.pop();
    return false;
  }
  if (dfs(menu)) return path;
  return [];
}
function transformMenuToBreadcrumb(menu) {
  const result = { ...menu };
  if (menu.children?.length) {
    result.children = menu.children.map(transformMenuToBreadcrumb);
  }
  return result;
}
function getBreadcrumbsByRoute(route, menus) {
  const matched = route.matched || [];
  const keyPath = getSelectedMenuKeyPathByKey(route.name, menus);
  const breadcrumbs = [];
  keyPath.forEach(key => {
    const matchedRoute = matched.find(item => item.name === key);
    if (matchedRoute) {
      const { name, path } = matchedRoute;
      const { title, i18nKey } = matchedRoute.meta || {};
      const label = i18nKey ? $t(i18nKey) : title;
      breadcrumbs.push({ key: name, label, routeName: name, routePath: path });
    }
  });
  return breadcrumbs;
}

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitConstantRoute, setBool: setIsInitConstantRoute } = useBoolean();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  const authRouteMode = ref(import.meta.env.VITE_AUTH_ROUTE_MODE);
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);
  function setRouteHome(routeKey) {
    routeHome.value = routeKey;
  }

  const constantRoutes = shallowRef([]);
  function addConstantRoutes(routes) {
    const constantRoutesMap = new Map([]);
    routes.forEach(route => {
      constantRoutesMap.set(route.name, route);
    });
    constantRoutes.value = Array.from(constantRoutesMap.values());
  }

  const authRoutes = shallowRef([]);
  function addAuthRoutes(routes) {
    const authRoutesMap = new Map([]);
    routes.forEach(route => {
      authRoutesMap.set(route.name, route);
    });
    authRoutes.value = Array.from(authRoutesMap.values());
  }

  const removeRouteFns = [];

  const menus = ref([]);
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value));
  function getGlobalMenus(routes) {
    menus.value = getGlobalMenusByAuthRoutes(routes, authStore);
  }
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  const cacheRoutes = ref([]);
  const excludeCacheRoutes = ref([]);
  function getCacheRoutes(routes) {
    cacheRoutes.value = getCacheRouteNames(routes);
  }
  async function resetRouteCache(routeKey) {
    const routeName = routeKey || router.currentRoute.value.name;
    excludeCacheRoutes.value.push(routeName);
    await nextTick();
    excludeCacheRoutes.value = [];
  }

  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  async function resetStore() {
    const routeStore = useRouteStore();
    routeStore.$reset();
    resetVueRoutes();
    await initConstantRoute();
  }
  function resetVueRoutes() {
    removeRouteFns.forEach(fn => fn());
    removeRouteFns.length = 0;
  }

  async function initConstantRoute() {
    if (isInitConstantRoute.value) return;
    const staticRoute = createStaticRoutes();
    if (authRouteMode.value === 'static') {
      addConstantRoutes(staticRoute.constantRoutes);
    } else {
      const { data, error } = await fetchGetConstantRoutes();
      if (!error) {
        addConstantRoutes(data);
      } else {
        addConstantRoutes(staticRoute.constantRoutes);
      }
    }
    handleConstantAndAuthRoutes();
    setIsInitConstantRoute(true);
    tabStore.initHomeTab();
  }

  async function initAuthRoute() {
    // 如果还没有 userInfo（比如刷新页面只剩下 token），才去调用 /checksession
    if (!authStore.userInfo.id) {
      await authStore.initUserInfo();
    }
    if (authRouteMode.value === 'static') {
      initStaticAuthRoute();
    } else {
      await initDynamicAuthRoute();
    }
    tabStore.initHomeTab();
  }
  function initStaticAuthRoute() {
    const { authRoutes: staticAuthRoutes } = createStaticRoutes();
    if (authStore.isStaticSuper) {
      addAuthRoutes(staticAuthRoutes);
    } else {
      const filteredAuthRoutes = filterAuthRoutesByRoles(staticAuthRoutes, authStore.userInfo.roles);
      addAuthRoutes(filteredAuthRoutes);
    }
    handleConstantAndAuthRoutes();
    setIsInitAuthRoute(true);
  }
  async function initDynamicAuthRoute() {
    const { data, error } = await fetchGetUserRoutes();
    if (!error) {
      const { routes, home } = data;
      addAuthRoutes(routes);
      handleConstantAndAuthRoutes();
      setRouteHome(home);
      handleUpdateRootRouteRedirect(home);
      setIsInitAuthRoute(true);
    } else {
      authStore.resetStore();
    }
  }
  function handleConstantAndAuthRoutes() {
    const allRoutes = [...constantRoutes.value, ...authRoutes.value];
    const sortRoutes = sortRoutesByOrder(allRoutes);
    const vueRoutes = getAuthVueRoutes(sortRoutes);
    resetVueRoutes();
    addRoutesToVueRouter(vueRoutes);
    getGlobalMenus(sortRoutes);
    getCacheRoutes(vueRoutes);
  }
  function addRoutesToVueRouter(routes) {
    routes.forEach(route => {
      const removeFn = router.addRoute(route);
      addRemoveRouteFn(removeFn);
    });
  }
  function addRemoveRouteFn(fn) {
    removeRouteFns.push(fn);
  }
  function handleUpdateRootRouteRedirect(redirectKey) {
    const redirect = getRoutePath(redirectKey);
    if (redirect) {
      const rootRoute = { ...ROOT_ROUTE, redirect };
      router.removeRoute(rootRoute.name);
      const [rootVueRoute] = getAuthVueRoutes([rootRoute]);
      router.addRoute(rootVueRoute);
    }
  }
  async function getIsAuthRouteExist(routePath) {
    const routeName = getRouteName(routePath);
    if (!routeName) {
      return false;
    }
    if (authRouteMode.value === 'static') {
      const { authRoutes: staticAuthRoutes } = createStaticRoutes();
      return isRouteExistByRouteName(routeName, staticAuthRoutes);
    }
    const { data } = await fetchIsRouteExist(routeName);
    return data;
  }
  function getSelectedMenuKeyPath(selectedKey) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }
  async function onRouteSwitchWhenLoggedIn() {
    // await authStore.initUserInfo();
  }
  async function onRouteSwitchWhenNotLoggedIn() {
  }

  return {
    resetStore,
    routeHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initConstantRoute,
    isInitConstantRoute,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getIsAuthRouteExist,
    getSelectedMenuKeyPath,
    onRouteSwitchWhenLoggedIn,
    onRouteSwitchWhenNotLoggedIn
  };
});