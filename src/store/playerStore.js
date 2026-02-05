// stores/playerStore.js
import { defineStore } from "pinia";

export const usePlayerStore = defineStore("playerStore", {
  state: () => ({
    selectedPlayerId: null,
    isSidebarOpen: false,
  }),
  actions: {
    setSelectedPlayerId(playerId) {
      this.selectedPlayerId = playerId;
    },
    toggleSidebar(open = true) {
      this.isSidebarOpen = open;
    },
  },
});
