<template>
  <n-modal
    v-model:show="showModel"
    :mask-closable="false"
    :style="modalStyle"
    @close="emitClose"
  >
    <n-card bordered size="small" class="rounded-lg shadow-lg">

      <!-- Header -->
      <div class="flex justify-between items-center pb-3 border-b mb-3">
        <div class="font-bold text-lg">
          <slot name="title">{{ $t(title) }}</slot>
        </div>

        <n-button quaternary circle size="small" @click="emitClose">
          <template #icon>
            <n-icon>
              <CloseOutline />
            </n-icon>
          </template>
        </n-button>
      </div>

      <!-- Body -->
      <div class="relative max-h-[70vh] overflow-y-auto px-1">
        <div
          v-if="submitLoading"
          class="absolute inset-0 bg-white bg-opacity-50 z-20 cursor-not-allowed"
        ></div>

        <slot />
      </div>

      <!-- Footer -->
      <div class="pt-3 mt-3 border-t flex justify-end gap-2">
        <n-button @click="emitClose" :disabled="submitLoading">
          {{ $t('close') }}
        </n-button>
        <n-button
          v-if="!props.hideSubmit"
          type="primary"
          @click="emitSave"
          :loading="submitLoading"
          :disabled="submitLoading"
        >
          {{ $t('submit') }}
        </n-button>
      </div>

    </n-card>
  </n-modal>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { CloseOutline } from "@vicons/ionicons5";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";

const { t } = useI18n();

const props = defineProps({
  isVisible: Boolean,
  title: String,
  width: { type: String, default: "720px" },
  hideSubmit: { type: Boolean, default: false }
});

const emit = defineEmits(["update:isVisible", "save", "close"]);

// v-model
const showModel = computed({
  get: () => props.isVisible,
  set: (v) => emit("update:isVisible", v)
});

// loading
const loadingStore = useSubmitLoadingStore();
const submitLoading = computed(() => loadingStore.submitLoading);

// mobile responsive
const isMobile = ref(false);
onMounted(() => {
  const check = () => (isMobile.value = window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
});

const modalStyle = computed(() => ({
  width: isMobile.value ? "95vw" : props.width,
  maxWidth: "100%"
}));

// events
const emitClose = () => {
  if (submitLoading.value) return;
  emit("close");
};

const emitSave = () => {
  if (submitLoading.value) return;
  emit("save");
};
</script>

<style scoped>
.n-card {
  max-width: 100%;
}
</style>
