<template>
  <ReusableSingleModal
    v-model:isVisible="isVisibleModel"
    :title="formTitle"
    width="520px"
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

      <n-form-item :label="$t('type')" path="typeId" required>
        <n-select
          v-model:value="localFormData.typeId"
          :options="filteredTransactionTypeOptions"
          :placeholder="$t('please_select')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showBankId"
        :label="$t('bank')"
        path="bankId"
        required
      >
        <n-select
          v-model:value="localFormData.bankId"
          :options="bankOptionsLocal"
          :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showFromBank"
        :label="$t('from_bank')"
        path="fromBankId"
        required
      >
        <n-select
          v-model:value="localFormData.fromBankId"
          :options="bankOptionsLocal"
          :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"  
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showToBank"
        :label="$t('to_bank')"
        path="toBankId"
        required
      >
        <n-select
          v-model:value="localFormData.toBankId"
          :options="bankOptionsLocal"
          :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showMemberId"
        :label="$t('member')"
        path="memberId"
        :required="requireMemberId"
      >
        <n-select
          v-model:value="localFormData.memberId"
          :options="memberOptionsLocal"
          :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showCounterPartyId"
        :label="$t('counterParty')"
        path="counterPartyId"
        required
      >
        <n-select
          v-model:value="localFormData.counterPartyId"
          :options="counterPartyOptionsLocal"
          :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"
          searchable
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showAmount"
        :label="$t('amount')"
        path="amount"
        required
      >
        <n-input
          v-model:value="localFormData.amount"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showTransferOutAmount"
        :label="$t('transfer_out_amount')"
        path="transferOutAmount"
        required
      >
        <n-input
          v-model:value="localFormData.transferOutAmount"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showTransferInAmount"
        :label="$t('transfer_in_amount')"
        path="transferInAmount"
        required
      >
        <n-input
          v-model:value="localFormData.transferInAmount"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item
        v-if="showRate"
        :label="$t('rate')"
        path="rate"
        required
      >
        <n-input
          v-model:value="localFormData.rate"
          :placeholder="$t('please_input')"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('remark')" path="remark">
        <n-input
          v-model:value="localFormData.remark"
          :placeholder="$t('please_input')"
          type="textarea"
          clearable
        />
      </n-form-item>
    </n-form>
  </ReusableSingleModal>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useDropdown } from "@/composables/useDropdown";
import { useCallApi } from "@/hooks/useCallApi";
import { useI18n } from "vue-i18n";
import ReusableSingleModal from "@/components/ReusableSingleModal.vue";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";

const { t } = useI18n();
const { callApi } = useCallApi();
const authStore = useAuthStore();
const {
  brandOptions,
  getBrandOptions,
  transactionTypeOptions,
  getTransactionTypeOptions,
} = useDropdown();

const filteredTransactionTypeOptions = computed(() =>
  (transactionTypeOptions.value || []).filter((opt) =>
    authStore.hasFeatureAccess(opt.value)
  )
);

const bankOptionsLocal = ref([]);
const memberOptionsLocal = ref([]);
const counterPartyOptionsLocal = ref([]);

const props = defineProps({
  isVisible: Boolean,
  formTitle: String,
  formData: Object,
  isEdit: Boolean,
});

const emit = defineEmits(["close", "update:formData", "save"]);

onMounted(() => {
  getBrandOptions(false);
  getTransactionTypeOptions(false);
});

const localFormData = reactive({});

watch(
  () => props.formData,
  (v) => {
    Object.assign(localFormData, v || {});
  },
  { immediate: true }
);

watch(
  filteredTransactionTypeOptions,
  (opts) => {
    if (!opts || opts.length === 0) return;
    const allowedIds = opts.map((o) => o.value);
    if (!allowedIds.includes(currentTypeId.value)) {
      localFormData.typeId = allowedIds[0];
    }
  },
  { immediate: true }
);

watch(
  () => localFormData.brandId,
  async (brandId) => {
    localFormData.bankId = null;
    localFormData.fromBankId = null;
    localFormData.toBankId = null;
    localFormData.memberId = null;
    localFormData.counterPartyId = null;

    if (!brandId) {
      bankOptionsLocal.value = [];
      memberOptionsLocal.value = [];
      counterPartyOptionsLocal.value = [];
      return;
    }

    try {
      const params = { brandId };
      const [bankResp, memberResp, counterPartyResp] = await Promise.all([
        callApi("/bank", "GET", null, params),
        callApi("/member", "GET", null, params),
        callApi("/counterParty", "GET", null, params),
      ]);

      bankOptionsLocal.value = (bankResp?.bankList || []).map((item) => ({
        label: item.bankProviderName && item.accountName
          ? `${item.bankProviderName} - ${item.accountName} (${item.accountNumber || ""})`
          : item.accountName || item.accountNumber || String(item.id),
        value: item.id,
      }));

      memberOptionsLocal.value = (memberResp?.memberList || []).map((item) => ({
        label: item.name,
        value: item.id,
      }));

      counterPartyOptionsLocal.value = (counterPartyResp?.counterPartyList || []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
    } catch (_) {
      bankOptionsLocal.value = [];
      memberOptionsLocal.value = [];
      counterPartyOptionsLocal.value = [];
    }
  }
);

const isVisibleModel = computed({
  get: () => props.isVisible,
  set: (v) => emit("update:isVisible", v),
});

const currentTypeId = computed(() =>
  typeof localFormData.typeId === "number"
    ? localFormData.typeId
    : Number(localFormData.typeId || 0)
);

// bankId: required for deposit, withdrawal, borrow, repay, paymentGatewayCharge, adjustmentIn, adjustmentOut, openingBalance, wrongTransfer, unclaim, other
const showBankId = computed(() =>
  [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12].includes(currentTypeId.value)
);
// fromBankId, toBankId: required for transfer only
const showFromBank = computed(() => currentTypeId.value === 5);
const showToBank = computed(() => currentTypeId.value === 5);
// memberId: required deposit, withdrawal; optional adjustmentIn, adjustmentOut
const showMemberId = computed(() =>
  [1, 2, 7, 8].includes(currentTypeId.value)
);
const requireMemberId = computed(() =>
  [1, 2].includes(currentTypeId.value)
);
// counterPartyId: required borrow, repay
const showCounterPartyId = computed(() =>
  [3, 4].includes(currentTypeId.value)
);
// amount: required for all except transfer (which uses transferOutAmount/transferInAmount)
const showAmount = computed(() =>
  [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12].includes(currentTypeId.value)
);
const showTransferOutAmount = computed(() => currentTypeId.value === 5);
const showTransferInAmount = computed(() => currentTypeId.value === 5);
// rate: required for transfer
const showRate = computed(() => currentTypeId.value === 5);

const loadingStore = useSubmitLoadingStore();

const requiredFieldsByType = {
  1: ["brandId", "typeId", "bankId", "memberId", "amount"], // deposit
  2: ["brandId", "typeId", "bankId", "memberId", "amount"], // withdrawal
  3: ["brandId", "typeId", "bankId", "counterPartyId", "amount"], // borrow
  4: ["brandId", "typeId", "bankId", "counterPartyId", "amount"], // repay
  5: [
    "brandId",
    "typeId",
    "fromBankId",
    "toBankId",
    "transferOutAmount",
    "transferInAmount",
    "rate",
  ], // transfer
  6: ["brandId", "typeId", "bankId", "amount"], // paymentGatewayCharge
  7: ["brandId", "typeId", "bankId", "amount"], // adjustmentIn (memberId optional)
  8: ["brandId", "typeId", "bankId", "amount"], // adjustmentOut (memberId optional)
  9: ["brandId", "typeId", "bankId", "amount"], // openingBalance
  10: ["brandId", "typeId", "bankId", "amount"], // wrongTransfer
  11: ["brandId", "typeId", "bankId", "amount"], // unclaim
  12: ["brandId", "typeId", "bankId", "amount"], // other
};

const handleSave = () => {
  const typeId = currentTypeId.value;
  const requiredFields = requiredFieldsByType[typeId] || [];

  if (!typeId || !localFormData.brandId) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }

  const missing = requiredFields.filter((field) => {
    const value = localFormData[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }

  loadingStore.startSubmit();
  const payload = {
    ...localFormData,
    typeId,
  };

  emit("save", payload);
};

const handleClose = () => emit("close");
</script>

