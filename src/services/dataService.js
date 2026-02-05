import { useCallApi } from '@/hooks/useCallApi';
import { useAuthStore } from '@/store/authStore'; 
import { sessionManager } from '@/utils/sessionManager';

export const fetchSession = async () => {
  try {
    if (localStorage.getItem('token')) {

    
      const { callApi } = useCallApi();
      const authStore = useAuthStore();
      const resp = await callApi(`/checksession`, 'GET', null, null, false);
       authStore.updateUser(resp, resp.loginToken)
    }else{

      sessionManager.clearAuthToken();
    }

  } catch (err) {
    sessionManager.clearAuthToken();
    console.error('Error fetching data:', err);
  }
}
