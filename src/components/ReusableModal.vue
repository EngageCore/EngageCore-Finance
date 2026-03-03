<template>
  <n-modal v-model:show="showModel" :mask-closable="false" :style="modalStyle" @close="emitClose">
    <n-card bordered size="small" class="rounded-lg shadow-lg">
      
      <div class="flex justify-between items-center pb-3 border-b mb-3">
        <div class="font-bold text-lg">
          {{ $t(formTitle) }}
        </div>

        <n-button quaternary circle size="small" @click="emitClose">
          <template #icon>
            <n-icon>
              <CloseOutline />
            </n-icon>
          </template>
        </n-button>
      </div>

      <div class="flex flex-col md:flex-row gap-2 max-h-[100dvh] md:max-h-[70vh] overflow-hidden">
        <div class="flex flex-col gap-2 border-b md:border-b-0 md:border-r px-2 pb-2 md:pb-0 md:w-48 shrink-0">
          <n-button v-for="tab in tabs" :key="tab.content" size="small" :type="activeTabModel === tab.content ? 'primary' : 'default'"
            @click="activeTabModel = tab.content" class="w-full whitespace-nowrap" :disabled="submitLoading">
            {{ $t(tab.name) }}
          </n-button>
        </div>

        <div class="flex-1 flex flex-col overflow-y-auto md:overflow-hidden px-1 relative">
          <div v-if="submitLoading" class="absolute inset-0 bg-white bg-opacity-50 z-20 cursor-not-allowed"></div>
          <div class="border-b mb-3">
            <div class="font-semibold text-base pb-2 px-1">
              {{ currentTab ? $t(currentTab?.name) : '-' }}
            </div>
          </div>

          <div class="overflow-y-auto pr-1 pb-2 flex-1">
            <slot name="content" :activeTab="activeTabModel">
              <div></div>
            </slot>
          </div>
        </div>
      </div>

      <div class="pt-3 mt-3 border-t flex justify-end gap-2">
        <n-button @click="emitClose" :disabled="submitLoading">{{ $t('close') }}</n-button>
        <n-button
          v-if="!props.hideSubmit"
          type="primary"
          @click="emitSave"
          :loading="submitLoading"
          :disabled="submitLoading"
        >{{ $t('submit') }}</n-button>
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
  formTitle: String,
  formData: Object,
  tabs: Array,
  activeTab: String,
  width: { type: String, default: "1000px" },
  hideSubmit: { type: Boolean, default: false }
});

const emit = defineEmits(["update:isVisible", "update:activeTab", "save", "close"]);

//#region Computed Models
const showModel = computed({
  get: () => props.isVisible,
  set: (v) => emit("update:isVisible", v)
});

const activeTabModel = computed({
  get: () => props.activeTab || props.tabs?.[0]?.content,
  set: (v) => emit("update:activeTab", v)
});

const currentTab = computed(() =>
  props.tabs.find((tab) => tab.content === activeTabModel.value)
);
//#endregion

//#region 自适应宽度
const isMobile = ref(false);

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

const modalStyle = computed(() => ({
  width: isMobile.value ? "95vw" : props.width, // ✅ 手机端 95% 屏幕宽
  maxWidth: "100%", // ✅ 防止超出
}));
//#endregion

//#region 事件
const loadingStore = useSubmitLoadingStore();
const submitLoading = computed(() => loadingStore.submitLoading);
const emitClose = () => {
  if (submitLoading.value) return;
  emit("close");
};
const emitSave = async () => {
  if (submitLoading.value) return;
  emit("save");
};
//#endregion
</script>

<style scoped>
/* 让 n-card 的内容区域在手机上有合适的内边距 */
.n-card {
  max-width: 100%;
}
</style>
