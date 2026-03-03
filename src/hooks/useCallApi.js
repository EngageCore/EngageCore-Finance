import axios from 'axios';
import { ref, computed } from 'vue';
import { useLoading } from '@sa/hooks';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";

export const useCallApi = () => {
  const { loading, startLoading, endLoading } = useLoading();
  const submitStore = useSubmitLoadingStore();
  const authStore = useAuthStore();
  const error = ref(null);

  const callApi = async (url, method = 'GET', data = null, params = null, isLoading = true) => {
    const isSubmitMethod = ["POST", "PATCH", "PUT", "DELETE"].includes(method.toUpperCase());
    const shouldShowSubmitLoading = isLoading && isSubmitMethod;

    if (isLoading) {
      startLoading();
    }
    if (shouldShowSubmitLoading) {
      submitStore.startSubmit()
    };
    error.value = null;

    
    try {
      const headers = {
        'x-api-key': import.meta.env.VITE_API_KEY,
      };

      // Only set Content-Type for non-FormData requests
      // FormData needs the browser to set Content-Type automatically with boundary
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Attach user token when available
      const token = authStore.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}${url}`,
        method,
        data,
        params, // Pass the query parameters here
        headers,
      });

      return response.data;
    } catch (err) {
      if (url != '/login' && err.response?.status === 401) {
        authStore.logout();
        return;
      }
      error.value = err.response ? err.response.data : err.message;
      throw err;
    } finally {
      if (isLoading) {
        endLoading();
      }
      if (shouldShowSubmitLoading) {
        submitStore.endSubmit()
      };
    }
  };

  return {
    loading: computed(() => loading.value),
    error,
    callApi,
  };
};
