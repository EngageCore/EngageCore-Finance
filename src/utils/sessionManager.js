
import { useCallApi } from '@/hooks/useCallApi'; 
import { fetchSession } from '../services/dataService';
import { useAuthStore } from '@/store/authStore';
let idleTimeout;
let heartbeatInterval; // Interval for periodic reconnect calls
const idleTimeLimit = 60 * 60 * 1000; // 60 minutes
const heartbeatTimeLimit = 10000; // 5 seconds for heartbeat interval

export const sessionManager = {
  async initializeSession(router) {
    if(localStorage.getItem('token')){
        await fetchSession();
        this.router = router;
        this.rehydrateSession();
        this.setEventListeners();
        this.resetIdleTimer();
        this.startHeartbeat();
    }
  },

  startHandling(){
    this.rehydrateSession();
    this.setEventListeners();
    this.resetIdleTimer();
    this.startHeartbeat();
  },

  rehydrateSession() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
      // this.callReconnectApi(); // Call the reconnect API after page refresh
    }
  },

  setEventListeners() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
      window.addEventListener(event, this.resetIdleTimer.bind(this));
    });

    window.addEventListener('beforeunload', this.handleTabClose.bind(this));
  },

  handleTabClose() {
    this.callDisconnectApi();
  },


  resetIdleTimer() {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      this.clearAuthToken();
    }, idleTimeLimit);
  },

  startHeartbeat() {
    // this.stopHeartbeat(); 
    // heartbeatInterval = setInterval(() => {
    //   this.callReconnectApi();
    // }, heartbeatTimeLimit);
  },

  stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  },

  async callDisconnectApi() {
    const { callApi } = useCallApi();

    try {
      await callApi(`/disconnect`, 'post', {}, null, false);
     
      console.log('Disconnected successfully');
    } catch (error) {
      console.error('Error during disconnect:', error);
    } finally {
      this.stopHeartbeat();
    }
  },

  async callReconnectApi() {
    const { callApi } = useCallApi();

    try {
      
      await callApi(`/reconnect`, 'post', {}, null, false);
     
      console.log('Reconnected successfully');
    } catch (error) {
      console.error('Error during reconnect:', error);
    }
  },

  setAuthToken(token) {
    localStorage.setItem('token', token);
  },

  getAuthToken() {
    return localStorage.getItem('token');
  },

  clearAuthToken() {
    const authStore = useAuthStore();
    this.stopHeartbeat();
    authStore.logout()
  },



  redirectToLogin() {
    if (this.router) {
      this.router.push('/login');
    } else {
      window.location.href = '/login';
    }
  },
};
