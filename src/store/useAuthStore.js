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
    statusId: 1
  });

  const isSuper = computed(() => {
    return userInfo.roles.includes('super');
  });

  const isLogin = computed(() => Boolean(token.value));

  function resetStore() {
    authStore.$reset();
    clearAuthStorage();
    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  async function getUserInfo() {
    const resp = await callApi('/checksession', 'GET');
    if(resp) {
      userInfo.userName = resp.username;
      userInfo.id = resp.id;
      userInfo.roleId = resp.roleId;
      userInfo.statusId = resp.statusId;
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
    if(userData && Object.keys(userData).length > 0) {
      userInfo.name = userData.name;
      userInfo.id = userData.id;
      userInfo.roleId = userData.roleId;
      userInfo.statusId = userData.statusId;
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
      tabStore.clearTabs();
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
    initUserInfo
  };
});