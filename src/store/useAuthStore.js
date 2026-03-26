import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { fetchGetUserInfo, fetchLogin } from '@/service/api';
import { useRouterPush } from '@/hooks/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '@/store/useRouteStore';
import { useTabStore } from '@/store/useTabStore';
import { useCallApi } from '@/hooks/useCallApi';

function getToken() {
  return localStg.get('token') || '';
}

function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
}

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();
  const { callApi } = useCallApi();

  const token = ref(getToken());

  const userInfo = reactive({
    id: '',
    name: '',
    roleId: 2,
    statusId: 1,
    accessPageIds: [],
    accessActionIds: [],
    accessFeatureIds: []
  });

  const isSuper = computed(() => {
    return userInfo.roleId == 1;
  });

  const isLogin = computed(() => Boolean(token.value));

  function resetStore() {
    authStore.$reset();
    clearAuthStorage();
    tabStore.resetTabStore();
    routeStore.resetStore();
  }

  async function getUserInfo() {
    const resp = await callApi('/checksession', 'GET');
    if (resp) {
      const user = resp.user || resp;

      userInfo.userName = user.username || user.name || '';
      userInfo.id = user.id;
      userInfo.roleId = user.roleId;
      userInfo.statusId = user.statusId;
      userInfo.accessPageIds = Array.isArray(user.accessPageIds) ? user.accessPageIds.map(id => Number(id)) : [];
      userInfo.accessActionIds = Array.isArray(user.accessActionIds) ? user.accessActionIds.map(id => Number(id)) : [];
      userInfo.accessFeatureIds = Array.isArray(user.accessFeatureIds) ? user.accessFeatureIds.map(id => Number(id)) : [];
    }
    return true
  }

  // async function login(userName, password, redirect = true) {
  //   startLoading();
  //   const { data: loginToken, error } = await fetchLogin(userName, password);
  //   if (!error) {
  //     const pass = await loginByToken(loginToken);
  //     if (pass) {
  //       const isClear = checkTabClear();
  //       let needRedirect = redirect;
  //       if (isClear) needRedirect = false;
  //       await routeStore.initAuthRoute();
  //       if (needRedirect) await redirectFromLogin();
  //       if (route.meta?.requiresAuth) {
  //         window.$notification?.success({
  //           title: $t('page.login.common.loginSuccess'),
  //           content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
  //           duration: 4500
  //         });
  //       }
  //     }
  //   } else {
  //     resetStore();
  //   }
  //   endLoading();
  // }

  async function login(userData, loginToken, redirect = true) {
    if(userData) {
      const user = userData;

      userInfo.userName = user.name;
      userInfo.id = user.id;
      userInfo.roleId = user.roleId;
      userInfo.statusId = user.statusId;
      userInfo.accessPageIds = Array.isArray(user.accessPageIds) ? user.accessPageIds.map(id => Number(id)) : [];
      userInfo.accessActionIds = Array.isArray(user.accessActionIds) ? user.accessActionIds.map(id => Number(id)) : [];
      userInfo.accessFeatureIds = Array.isArray(user.accessFeatureIds) ? user.accessFeatureIds.map(id => Number(id)) : [];
    }
    const pass = await loginByToken(loginToken);
    // await updateUserRole(userData.roleId);
    if (pass) {
      const isClear = checkTabClear();
      let needRedirect = redirect;
      if (isClear) needRedirect = false;  
      await routeStore.initAuthRoute();
      if (needRedirect) await redirectFromLogin();
    }
  }

  async function loginByToken(loginToken) {
    localStg.set('token', loginToken);
    // localStg.set('refreshToken', loginToken.refreshToken);
    // const fetchUserInfo = await getUserInfo();
    // if (pass) {
      token.value = loginToken;
      return true;
    // }
    // return false;
  }

  async function updateUserType(typeId) {
    userInfo.typeId = typeId;
  }

  async function logout() {
    resetStore();
    // Redirect to home/dashboard after re-login instead of the current route
    await toLogin(undefined, '/home');
  }

  function updateUserInfo(info) {
    Object.assign(userInfo, info);
  }

  function checkTabClear() {
    const { resetCacheStrategy } = routeStore;
    if (resetCacheStrategy === 'login') {
      tabStore.resetTabStore();
      return true;
    }
    return false;
  }

  async function initUserInfo() {
    try {
      await getUserInfo();
      if (!token.value) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error initializing user info:', error);
      return false;
    }
  }

  function hasPageAccess(pageId) {
    return userInfo.accessPageIds.includes(pageId) || isSuper.value;
  }

  function hasActionAccess(actionId) {
    return userInfo.accessActionIds.includes(actionId) || isSuper.value;
  }

  function hasFeatureAccess(featureId) {
    return userInfo.accessFeatureIds.includes(featureId) || isSuper.value;
  }

  return {
    token,
    userInfo,
    isSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    logout,
    getUserInfo,
    updateUserInfo,
    initUserInfo,
    hasPageAccess,
    hasActionAccess,
    hasFeatureAccess
  };
});