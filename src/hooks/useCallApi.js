import axios from 'axios';
import { ref, computed } from 'vue';
import { useLoadingStore } from '@/store/loadingStore'; 
import { useAuthStore } from '@/store/authStore'; 

export const useCallApi = () => {
  const loadingStore = useLoadingStore();
  const authStore = useAuthStore();
  const error = ref(null);

  const callApi = async (url, method = 'GET', data = null, params = null, isLoading = true) => {
    if(isLoading){

      loadingStore.startLoading();
    }
    error.value = null;

    
    try {
      const headers = {
        'x-api-key': import.meta.env.VITE_API_KEY,
      };

      // Only set Content-Type for non-FormData requests
      // FormData needs the browser to set Content-Type automatically with boundary
      if (!(data instanceof FormData) && data !== null) {
        headers['Content-Type'] = 'application/json';
      }

      if (authStore.isAuthenticated) {
        headers['Authorization'] = 'Bearer ' + localStorage.getItem("token");
      }

      // Build request config - only include data if it's not null
      const requestConfig = {
        url: `${import.meta.env.VITE_API_URL}${url}`,
        method,
        params, // Pass the query parameters here
        headers,
      };

      // Only include data in request if it's not null
      // This prevents sending "null" as a string in the body
      if (data !== null) {
        requestConfig.data = data;
      }

      const response = await axios(requestConfig);

      return response?.data?.message?.data;
    } catch (err) {
      if (url != '/auth/login' && err.response?.status === 401) {
        authStore.logout();
      }
      error.value = err.response ? err.response.data : err.message;
      throw err;
    } finally {
      if(isLoading){
        loadingStore.stopLoading();
      }
    }
  };

  return {
    loading: computed(() => loadingStore.isLoading),
    error,
    callApi,
  };
};
