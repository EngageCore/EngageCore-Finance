// store/translationOverlayStore.js
import { defineStore } from 'pinia';

export const useTranslationOverlayStore = defineStore('translationOverlay', {
  state: () => ({
    active: false,
    progress: 0,
    message: '',
  }),
  actions: {
    start(message = '') {
      this.active = true;
      this.progress = 0;
      this.message = message;
    },
    updateProgress(current, total, message = '') {
      this.progress = current / total;
      this.message = message;
    },
    finish() {
      this.active = false;
      this.progress = 0;
      this.message = '';
    },
  },
});
