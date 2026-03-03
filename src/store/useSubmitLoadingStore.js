import { defineStore } from "pinia";
import { ref } from "vue";

export const useSubmitLoadingStore = defineStore("submitLoadingStore", () => {
  const submitLoading = ref(false);

  const startSubmit = () => (submitLoading.value = true);
  const endSubmit = () => (submitLoading.value = false);

  return {
    submitLoading,
    startSubmit,
    endSubmit
  };
});
