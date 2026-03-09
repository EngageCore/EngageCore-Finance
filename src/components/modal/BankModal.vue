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
      <n-form-item :label="$t('brand')" path="brandId" required>
        <n-select
          v-model:value="localFormData.brandId"
          :options="brandOptions"
          :placeholder="$t('please_select')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('bankProvider')" path="bankProviderId" required>
        <n-select
          v-model:value="localFormData.bankProviderId"
          :options="bankProviderOptions"
          :placeholder="$t('please_select')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('account_name')" path="accountName" required>
        <n-input
          v-model:value="localFormData.accountName"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('account_number')" path="accountNumber" required>
        <n-input
          v-model:value="localFormData.accountNumber"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="!isEdit"
        :label="$t('balance')"
        path="balance"
        required
      >
        <n-input
          v-model:value="localFormData.balance"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('currency')" path="currency" required>
        <n-input
          v-model:value="localFormData.currency"
          :placeholder="$t('please_input')"
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
const { brandOptions, getBrandOptions, bankProviderOptions, getBankProviderOptions } = useDropdown();

const props = defineProps({
  isVisible: Boolean,
  formTitle: String,
  formData: Object,
  isEdit: Boolean,
});

const emit = defineEmits(["close", "update:formData", "save"]);

onMounted(() => {
  getBrandOptions(false, true);
  getBankProviderOptions(false, true);
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
  if (
    !localFormData.brandId ||
    !localFormData.bankProviderId ||
    !localFormData.accountName ||
    !localFormData.accountNumber ||
    !localFormData.currency
  ) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }

  if (!props.isEdit && (localFormData.balance === "" || localFormData.balance == null)) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }

  loadingStore.startSubmit();
  const payload = { ...localFormData };

  if (props.isEdit) {
    delete payload.balance;
  }

  emit("save", payload);
};

const handleClose = () => emit("close");
</script>
