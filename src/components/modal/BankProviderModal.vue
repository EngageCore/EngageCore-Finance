<template>
  <ReusableSingleModal
    v-model:isVisible="isVisibleModel"
    :title="formTitle"
    width="480px"
    @save="handleSave"
    @close="handleClose"
  >
    <n-form
      :model="localFormData"
      label-placement="top"
      class="grid grid-cols-1 gap-3 mt-2"
    >
      <n-form-item :label="$t('code')" path="code" required>
        <n-input
          v-model:value="localFormData.code"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>
      
      <n-form-item :label="$t('name')" path="name" required>
        <n-input
          v-model:value="localFormData.name"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('status')" path="statusId" v-if="isEdit">
        <n-select
          v-model:value="localFormData.statusId"
          :options="roleStatusOptions"
          :placeholder="$t('please_select')"
          clearable
        />
      </n-form-item>
    </n-form>
  </ReusableSingleModal>
</template>

<script setup>
import { computed, reactive, watch, onMounted } from "vue";
import { useDropdown } from "@/composables/useDropdown";
import { useI18n } from "vue-i18n";
import ReusableSingleModal from "@/components/ReusableSingleModal.vue";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";

const { t } = useI18n();
const { roleStatusOptions, getRoleStatusOptions } = useDropdown();

const props = defineProps({
  isVisible: Boolean,
  formTitle: String,
  formData: Object,
  isEdit: Boolean,
});

const emit = defineEmits(["close", "update:formData", "save"]);

onMounted(() => {
  getRoleStatusOptions(false);
});

const localFormData = reactive({});

watch(
  () => props.formData,
  (v) => Object.assign(localFormData, v || {}),
  { immediate: true }
);

const isVisibleModel = computed({
  get: () => props.isVisible,
  set: (v) => emit("update:isVisible", v),
});

const loadingStore = useSubmitLoadingStore();

const handleSave = () => {
  if (!localFormData.name || !localFormData.code) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }

  loadingStore.startSubmit();
  const payload = {
    ...localFormData,
  };

  emit("save", payload);
};

const handleClose = () => emit("close");
</script>

