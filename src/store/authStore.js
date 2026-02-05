import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { sessionManager } from '@/utils/sessionManager';
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // State
  const user = ref(null); 
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  const idleTimeout = ref(null);
  const idleInterval = ref(null);


  // Actions
  const login = (userData, authToken) => {
    user.value = { ...userData, accessPageIds: userData.accessPageIds || [] };
    token.value = authToken;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('active_tabs', 0);
    sessionManager.startHandling();
  };

  const updateUser = (userData, authToken) => {
    user.value = { ...userData, accessPageIds: userData.accessPageIds || [] };
    token.value = authToken;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('active_tabs', 0);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_tabs'); 
    localStorage.removeItem('logout_flag'); 
    clearIdleTimer();

    if (typeof router !== 'undefined' && router.push) {
        router.push('/login');
    } else {
        window.location.href = '/login';
    }
};


  const restoreSession = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
    resetIdleTimer();
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimeout.value);
    idleTimeout.value = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000); // 30 minutes
  };

  const clearIdleTimer = () => {
    clearTimeout(idleTimeout.value);
    clearInterval(idleInterval.value);
  };


// Helper function to get user data from localStorage if user.value is not defined
const getUserData = () => {
  return user.value || JSON.parse(localStorage.getItem('user'));
};

// Check if the user has permission for a specific page or action
const hasPermission = (pageId) => {
  const userData = getUserData();
  return userData?.accessPageIds?.includes(pageId);
};

const hasActionPermission = (actionId) => {
  const userData = getUserData();
  return userData?.accessPageActionIds?.includes(actionId);
};

const hasFeaturePermission = (featureId) => {
  const userData = getUserData();
  return userData?.accessPageFeatureIds?.includes(featureId);
};


  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    restoreSession,
    resetIdleTimer,
    clearIdleTimer,
    hasPermission,
    hasActionPermission,
    hasFeaturePermission,
    updateUser,
  };
});
