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
          filterable
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('type')" path="typeId" required>
        <n-select
          v-model:value="localFormData.typeId"
          :options="filteredTransactionTypeOptions"
          :placeholder="$t('please_select')"
          filterable
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
          filterable
          clearable
        />
      </n-form-item>

      <!-- Deposit / Withdrawal: multiple bank + amount rows (2+ rows → bankDetails; 1 row → bankId + amount) -->
      <div v-if="showDepositWithdrawBankDetails" class="flex flex-col gap-2">
        <div
          v-for="(detail, idx) in localFormData.bankDetails"
          :key="idx"
          class="grid grid-cols-12 gap-2 items-end"
        >
          <n-form-item class="col-span-7" :label="idx === 0 ? $t('bank') : ''" path="bankDetails">
            <n-select
              v-model:value="detail.bankId"
              :options="bankOptionsLocal"
              :placeholder="localFormData.brandId ? $t('please_select') : $t('please_select_brand_first')"
              filterable
              clearable
            />
          </n-form-item>
          <n-form-item class="col-span-4" :label="idx === 0 ? $t('amount') : ''" path="bankDetails">
            <n-input
              v-model:value="detail.amount"
              :placeholder="$t('please_input')"
              clearable
            />
          </n-form-item>
          <div class="col-span-1 flex justify-end pb-1">
            <n-button
              size="small"
              quaternary
              type="error"
              :disabled="(localFormData.bankDetails || []).length <= 1"
              @click="removeBankDetailRow(idx)"
            >
              -
            </n-button>
          </div>
        </div>
        <div class="flex justify-end">
          <n-button size="small" tertiary type="primary" @click="addBankDetailRow">
            {{ $t('add') }}
          </n-button>
        </div>
      </div>

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
          filterable
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
          filterable
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
          filterable
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

      <n-form-item :label="$t('referenceCode')" path="referenceCode">
        <n-input
          v-model:value="localFormData.referenceCode"
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
import { transactionTypeEnum } from "@/enum/transactionType";

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
  (transactionTypeOptions.value || []).filter(
    (opt) =>
      opt.value &&
      opt.value !== 9 &&
      opt.value !== transactionTypeEnum.claim.id &&
      authStore.hasFeatureAccess(opt.value)
  )
);

const bankOptionsLocal = ref([]);
const memberOptionsLocal = ref([]);

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
    if (!Array.isArray(localFormData.bankDetails)) {
      localFormData.bankDetails = [{ bankId: null, amount: "" }];
    }
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
    localFormData.bankDetails = [{ bankId: null, amount: "" }];

    if (!brandId) {
      bankOptionsLocal.value = [];
      memberOptionsLocal.value = [];
      return;
    }

    try {
      const params = { brandId };
      const [bankResp, memberResp] = await Promise.all([
        callApi("/bank", "GET", null, params),
        callApi("/member", "GET", null, params),
      ]);

      bankOptionsLocal.value = (bankResp?.bankList || []).map((item) => ({
        label: item.bankProviderName && item.accountName
          ? `${item.bankProviderName} - ${item.accountName} (${item.accountNumber || ""})`
          : item.accountName || item.accountNumber || String(item.id),
        value: item.id,
      }));

      memberOptionsLocal.value = (memberResp?.memberList || []).map((item) => ({
        label: `(${item.code}) ${item.name}`,
        value: item.id,
      }));

    } catch (_) {
      bankOptionsLocal.value = [];
      memberOptionsLocal.value = [];
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

// Single bank + amount (not deposit/withdrawal — those use bankDetails or one row UI)
const showBankId = computed(() =>
  [6, 7, 8, 10, 11, 12, 13].includes(currentTypeId.value)
);

const showDepositWithdrawBankDetails = computed(() =>
  [1, 2].includes(currentTypeId.value)
);
// fromBankId, toBankId: borrow, repay, transfer, balanceWithdraw
const showFromBank = computed(() => [3, 4, 5, 14].includes(currentTypeId.value));
const showToBank = computed(() => [3, 4, 5, 14].includes(currentTypeId.value));
// memberId: required deposit, withdrawal; optional adjustmentIn, adjustmentOut, claim, balanceWithdraw
const showMemberId = computed(() =>
  [1, 2, 7, 8, 13, 14].includes(currentTypeId.value)
);
const requireMemberId = computed(() =>
  [1, 2].includes(currentTypeId.value)
);
// amount: single field (not deposit/withdrawal; borrow/repay use transfer out/in like transfer)
const showAmount = computed(() =>
  [6, 7, 8, 10, 11, 12, 13, 14].includes(currentTypeId.value)
);
const showTransferOutAmount = computed(() => [3, 4, 5].includes(currentTypeId.value));
const showTransferInAmount = computed(() => [3, 4, 5].includes(currentTypeId.value));
// rate: required for transfer only
const showRate = computed(() => currentTypeId.value === 5);

const loadingStore = useSubmitLoadingStore();

const requiredFieldsByType = {
  1: ["brandId", "typeId", "memberId"], // deposit (banks validated separately)
  2: ["brandId", "typeId", "memberId"], // withdrawal
  3: [
    "brandId",
    "typeId",
    "fromBankId",
    "toBankId",
    "transferOutAmount",
    "transferInAmount",
  ], // borrow (dual bank, no rate)
  4: [
    "brandId",
    "typeId",
    "fromBankId",
    "toBankId",
    "transferOutAmount",
    "transferInAmount",
  ], // repay (dual bank, no rate)
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
  10: ["brandId", "typeId", "bankId", "amount"], // wrongTransfer
  11: ["brandId", "typeId", "bankId", "amount"], // unclaim
  12: ["brandId", "typeId", "bankId", "amount"], // other
  13: ["brandId", "typeId", "bankId", "amount"], // claim
  14: ["brandId", "typeId", "fromBankId", "toBankId", "amount"], // balanceWithdraw (memberId optional)
};

function addBankDetailRow() {
  if (!Array.isArray(localFormData.bankDetails)) {
    localFormData.bankDetails = [];
  }
  localFormData.bankDetails.push({ bankId: null, amount: "" });
}

function removeBankDetailRow(index) {
  if (!Array.isArray(localFormData.bankDetails)) return;
  if (localFormData.bankDetails.length <= 1) return;
  localFormData.bankDetails.splice(index, 1);
}

function getCleanedBankDetailsRows() {
  const details = Array.isArray(localFormData.bankDetails) ? localFormData.bankDetails : [];
  return details
    .map((d) => ({
      bankId: d?.bankId ?? null,
      amount: d?.amount ?? "",
    }))
    .filter((d) => d.bankId && d.amount !== "");
}

function validateDepositWithdrawBankLines() {
  const cleaned = getCleanedBankDetailsRows();
  const invalid =
    cleaned.length === 0 ||
    cleaned.some((d) => d.bankId === null || d.amount === "" || Number.isNaN(Number(d.amount)));
  return { cleaned, invalid };
}

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

  if (typeId === 1 || typeId === 2) {
    const { invalid } = validateDepositWithdrawBankLines();
    if (invalid) {
      window.$message?.error(t("please_fill_in_all_required_fields"));
      return;
    }
  }

  if (typeId === 5) {
    const r = Number(localFormData.rate);
    if (!Number.isFinite(r) || r <= 0) {
      window.$message?.error(t("please_fill_in_all_required_fields"));
      return;
    }
  }

  if ([3, 4, 5].includes(typeId)) {
    const fromId = Number(localFormData.fromBankId);
    const toId = Number(localFormData.toBankId);
    if (!Number.isFinite(fromId) || !Number.isFinite(toId) || fromId === toId) {
      window.$message?.error(t("please_fill_in_all_required_fields"));
      return;
    }
    const out = Number(localFormData.transferOutAmount);
    const inn = Number(localFormData.transferInAmount);
    if (!Number.isFinite(out) || out <= 0 || !Number.isFinite(inn) || inn <= 0) {
      window.$message?.error(t("please_fill_in_all_required_fields"));
      return;
    }
  }

  loadingStore.startSubmit();
  const payload = {
    ...localFormData,
    typeId,
  };

  delete payload.counterPartyId;
  delete payload.transferDirection;

  if ([3, 4, 5].includes(typeId)) {
    payload.fromBankId = Number(payload.fromBankId);
    payload.toBankId = Number(payload.toBankId);
    payload.transferOutAmount = Number(payload.transferOutAmount);
    payload.transferInAmount = Number(payload.transferInAmount);
    delete payload.amount;
    delete payload.bankId;
    delete payload.bankDetails;
  }
  if ([3, 4].includes(typeId)) {
    delete payload.rate;
  }
  if (typeId === 5) {
    payload.rate = Number(payload.rate);
  }

  if (typeId === 1 || typeId === 2) {
    const { cleaned } = validateDepositWithdrawBankLines();
    if (cleaned.length >= 2) {
      payload.bankDetails = cleaned.map((d) => ({
        bankId: Number(d.bankId),
        amount: Number(d.amount),
      }));
      delete payload.bankId;
      delete payload.amount;
    } else {
      payload.bankId = Number(cleaned[0].bankId);
      payload.amount = Number(cleaned[0].amount);
      delete payload.bankDetails;
    }
  }

  if (![3, 4, 5, 14].includes(typeId)) {
    delete payload.fromBankId;
    delete payload.toBankId;
  }
  if (![3, 4, 5].includes(typeId)) {
    delete payload.transferOutAmount;
    delete payload.transferInAmount;
  }
  if (typeId !== 5) {
    delete payload.rate;
  }

  emit("save", payload);
};

const handleClose = () => emit("close");
</script>

