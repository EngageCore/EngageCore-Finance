
import {
  fetchSession
} from './dataService';
import { useAuthStore } from '@/store/authStore'; 
const INTERVAL_TIME = 15000;

let intervalId = null;

export const startBackgroundService = () => {
  const store = useAuthStore();

  if (intervalId) {
    clearInterval(intervalId);
  }

  const initialRun = async () => {
    if (store.token && localStorage.getItem('token')) {

      await fetchSession();
    }
  };

  initialRun();

  intervalId = setInterval(async () => {
    if (store.token && localStorage.getItem('token')) {

      await fetchSession();
    }
  }, INTERVAL_TIME);
}

export const stopBackgroundService = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
