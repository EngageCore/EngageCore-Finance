import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBadgeCountStore = defineStore('badgeCount', () => {
  const counts = ref({
    kycApproval: 0,
    unreadCount: 0,
  });

  function updateCount(type, count) {
    if (type in counts.value) {
      counts.value[type] = count;
    }
  }

  function resetCounts() {
    Object.keys(counts.value).forEach(key => {
      counts.value[key] = 0;
    });
  }

  return {
    counts,
    updateCount,
    resetCounts
  };
});