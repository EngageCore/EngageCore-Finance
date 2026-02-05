// /store/notificationStore.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notificationData: null,
  }),
  actions: {
    triggerNotification(data) {
      this.notificationData = data;
    },
    clearNotification() {
      this.notificationData = null;
    },
  },
});
