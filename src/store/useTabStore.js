import { computed, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { defineStore } from 'pinia';
import { router } from '@/router';
import { useRouteStore } from '@/store/useRouteStore';
import { useRouterPush } from '@/hooks/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { useThemeStore } from '@/store/useThemeStore';
import { $t } from '@/locales';
import { getRoutePath } from '@/router/elegant';

function getTabIdByRoute(route) {
  const { path, query = {}, meta } = route;
  let id = path;
  if (meta.multiTab) {
    const queryKeys = Object.keys(query).sort();
    const qs = queryKeys.map(key => `${key}=${query[key]}`).join('&');
    id = `${path}?${qs}`;
  }
  return id;
}

function getRouteIcons(route) {
  let icon = route?.meta?.icon || import.meta.env.VITE_MENU_ICON;
  let localIcon = route?.meta?.localIcon;
  if (route.matched) {
    const currentRoute = route.matched.find(r => r.name === route.name);
    icon = currentRoute?.meta?.icon || icon;
    localIcon = currentRoute?.meta?.localIcon;
  }
  return { icon, localIcon };
}

function getTabByRoute(route) {
  const { name, path, fullPath = path, meta } = route;
  const { title, i18nKey, fixedIndexInTab } = meta;
  const { icon, localIcon } = getRouteIcons(route);
  const label = i18nKey ? $t(i18nKey) : title;
  const tab = {
    id: getTabIdByRoute(route),
    label,
    routeKey: name,
    routePath: path,
    fullPath,
    fixedIndex: fixedIndexInTab,
    icon,
    localIcon,
    i18nKey
  };
  return tab;
}

function getDefaultHomeTab(routerInst, homeRouteName) {
  const homeRoutePath = getRoutePath(homeRouteName);
  const i18nLabel = $t(`${homeRouteName}`);
  let homeTab = {
    id: getRoutePath(homeRouteName),
    label: i18nLabel || homeRouteName,
    routeKey: homeRouteName,
    routePath: homeRoutePath,
    fullPath: homeRoutePath
  };
  const routes = routerInst.getRoutes();
  const homeRoute = routes.find(route => route.name === homeRouteName);
  if (homeRoute) {
    homeTab = getTabByRoute(homeRoute);
  }
  return homeTab;
}

function isTabInTabs(tabId, tabs) {
  return tabs.some(tab => tab.id === tabId);
}

function filterTabsByIds(tabIds, tabs) {
  return tabs.filter(tab => !tabIds.includes(tab.id));
}

function extractTabsByAllRoutes(routerInst, tabs) {
  const routes = routerInst.getRoutes();
  const routeNames = routes.map(route => route.name);
  return tabs.filter(tab => routeNames.includes(tab.routeKey));
}

function getFixedTabs(tabs) {
  return tabs.filter(tab => tab.fixedIndex !== undefined && tab.fixedIndex !== null);
}

function getFixedTabIds(tabs) {
  const fixedTabs = getFixedTabs(tabs);
  return fixedTabs.map(tab => tab.id);
}

function updateTabByI18nKey(tab) {
  const { i18nKey, label } = tab;
  return { ...tab, label: i18nKey ? $t(i18nKey) : label };
}

function updateTabsByI18nKey(tabs) {
  return tabs.map(tab => updateTabByI18nKey(tab));
}

function updateTabsLabel(tabs) {
  const updated = tabs.map(tab => ({
    ...tab,
    label: tab.newLabel || tab.oldLabel || tab.label
  }));
  return updated;
}

function getAllTabs(tabs, homeTab) {
  if (!homeTab) return [];
  const filterHomeTabs = tabs.filter(tab => tab.id !== homeTab.id);
  const fixedTabs = filterHomeTabs
    .filter(tab => tab.fixedIndex !== undefined && tab.fixedIndex !== null)
    .sort((a, b) => a.fixedIndex - b.fixedIndex);
  const remainTabs = filterHomeTabs.filter(tab => !(tab.fixedIndex !== undefined && tab.fixedIndex !== null));
  const allTabs = [homeTab, ...fixedTabs, ...remainTabs];
  return updateTabsLabel(allTabs);
}

export const useTabStore = defineStore(SetupStoreId.Tab, () => {
  const routeStore = useRouteStore();
  const themeStore = useThemeStore();
  const { routerPush } = useRouterPush(false);

  const tabs = ref([]);
  const homeTab = ref();

  function initHomeTab() {
    homeTab.value = getDefaultHomeTab(router, routeStore.routeHome);
  }

  const allTabs = computed(() => getAllTabs(tabs.value, homeTab.value));
  const activeTabId = ref('');

  function setActiveTabId(id) {
    activeTabId.value = id;
  }

  function initTabStore(currentRoute) {
    const storageTabs = localStg.get('globalTabs');
    if (themeStore.tab.cache && storageTabs) {
      const extractedTabs = extractTabsByAllRoutes(router, storageTabs);
      tabs.value = updateTabsByI18nKey(extractedTabs);
    }
    addTab(currentRoute);
  }

  function addTab(route, active = true) {
    const tab = getTabByRoute(route);
    const isHomeTab = tab.id === homeTab.value?.id;
    if (!isHomeTab && !isTabInTabs(tab.id, tabs.value)) {
      tabs.value.push(tab);
    }
    if (active) {
      setActiveTabId(tab.id);
    }
  }

  async function removeTab(tabId) {
    const removeTabIndex = tabs.value.findIndex(tab => tab.id === tabId);
    if (removeTabIndex === -1) return;
    const removedTabRouteKey = tabs.value[removeTabIndex].routeKey;
    const isRemoveActiveTab = activeTabId.value === tabId;
    const nextTab = tabs.value[removeTabIndex + 1] || tabs.value[removeTabIndex - 1] || homeTab.value;
    tabs.value.splice(removeTabIndex, 1);
    if (isRemoveActiveTab && nextTab) {
      await switchRouteByTab(nextTab);
    }
    if (themeStore.resetCacheStrategy === 'close') {
      routeStore.resetRouteCache(removedTabRouteKey);
    }
  }

  async function removeActiveTab() {
    await removeTab(activeTabId.value);
  }

  async function removeTabByRouteName(routeName) {
    const routePath = getRoutePath(routeName);
    const tabId = routePath;
    const multiTabId = `${routePath}?`;
    const tab = tabs.value.find(tab => tab.id === tabId || tab.id.startsWith(multiTabId));
    if (!tab) return;
    await removeTab(tab.id);
  }

  const { routerPushByKey } = useRouterPush();
  async function replaceTab(key, options) {
    const oldTabId = activeTabId.value;
    await routerPushByKey(key, options);
    if (!isTabRetain(oldTabId)) {
      await removeTab(oldTabId);
    }
  }

  async function switchRouteByTab(tab) {
    const fail = await routerPush(tab.fullPath);
    if (!fail) {
      setActiveTabId(tab.id);
    }
  }

  async function clearLeftTabs(tabId) {
    const tabIds = tabs.value.map(tab => tab.id);
    const index = tabIds.indexOf(tabId);
    if (index === -1) return;
    const excludes = tabIds.slice(index);
    await clearTabs(excludes);
  }

  async function clearRightTabs(tabId) {
    const isHomeTab = tabId === homeTab.value?.id;
    if (isHomeTab) {
      clearTabs();
      return;
    }
    const tabIds = tabs.value.map(tab => tab.id);
    const index = tabIds.indexOf(tabId);
    if (index === -1) return;
    const excludes = tabIds.slice(0, index + 1);
    await clearTabs(excludes);
  }

  function setTabLabel(label, tabId) {
    const id = tabId || activeTabId.value;
    const tab = tabs.value.find(item => item.id === id);
    if (!tab) return;
    tab.oldLabel = tab.label;
    tab.newLabel = label;
  }

  function resetTabLabel(tabId) {
    const id = tabId || activeTabId.value;
    const tab = tabs.value.find(item => item.id === id);
    if (!tab) return;
    tab.newLabel = undefined;
  }

  function isTabRetain(tabId) {
    if (tabId === homeTab.value?.id) return true;
    const fixedTabIds = getFixedTabIds(tabs.value);
    return fixedTabIds.includes(tabId);
  }

  function updateTabsByLocale() {
    tabs.value = updateTabsByI18nKey(tabs.value);
    if (homeTab.value) {
      homeTab.value = updateTabByI18nKey(homeTab.value);
    }
  }

  function cacheTabs() {
    if (!themeStore.tab.cache) return;
    localStg.set('globalTabs', tabs.value);
  }

  useEventListener(window, 'beforeunload', () => {
    cacheTabs();
  });

  async function clearTabs(excludes = []) {
    const remainTabIds = [...getFixedTabIds(tabs.value), ...excludes];
    const tabsToRemove = tabs.value.filter(tab => !remainTabIds.includes(tab.id));
    const routeKeysToReset = [];
    if (themeStore.resetCacheStrategy === 'close') {
      for (const tab of tabsToRemove) {
        routeKeysToReset.push(tab.routeKey);
      }
    }
    const removedTabsIds = tabsToRemove.map(tab => tab.id);
    if (removedTabsIds.length === 0) {
      return;
    }
    const isRemoveActiveTab = removedTabsIds.includes(activeTabId.value);
    const updatedTabs = filterTabsByIds(removedTabsIds, tabs.value);
    function update() {
      tabs.value = updatedTabs;
    }
    if (!isRemoveActiveTab) {
      update();
    } else {
      const activeTabCandidate = updatedTabs[updatedTabs.length - 1] || homeTab.value;
      if (activeTabCandidate) {
        await switchRouteByTab(activeTabCandidate);
      }
      update();
    }
    for (const routeKey of routeKeysToReset) {
      routeStore.resetRouteCache(routeKey);
    }
  }

  function resetTabStore() {
    tabs.value = [];
    activeTabId.value = '';
    localStg.remove('globalTabs');
  }

  return {
    tabs: allTabs,
    activeTabId,
    initHomeTab,
    initTabStore,
    addTab,
    removeTab,
    removeActiveTab,
    removeTabByRouteName,
    replaceTab,
    clearTabs,
    clearLeftTabs,
    clearRightTabs,
    switchRouteByTab,
    setTabLabel,
    resetTabLabel,
    isTabRetain,
    updateTabsByLocale,
    getTabIdByRoute,
    cacheTabs,
    resetTabStore
  };
});