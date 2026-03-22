<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddTransaction"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable
    title="transaction"
    :headers="tableHeaders"
    :data="tableData"
    :offset="offset"
    :limit="limit"
    :totalRows="totalRows"
    bordered
    striped
    @sort="handleSort"
    @pagination="handlePaginate"
  >
    <template #action="{ row }">
      <div class="flex justify-center items-center gap-2">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              circle
              tertiary
              type="primary"
              size="small"
              class="!w-8 !h-8 flex items-center justify-center"
              @click="openTransactionDetails(row)"
            >
              <template #icon>
                <n-icon class="text-lg">
                  <EyeOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t("transaction_details") }}
        </n-tooltip>
        <n-tooltip v-if="canDeleteTransaction" trigger="hover">
          <template #trigger>
            <n-button
              circle
              tertiary
              type="error"
              size="small"
              class="!w-8 !h-8 flex items-center justify-center"
              @click="openDeleteConfirm(row)"
            >
              <template #icon>
                <n-icon class="text-lg">
                  <TrashOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t("delete") }}
        </n-tooltip>
      </div>
    </template>

    <template #brandName="{ row }">
      {{ row.brandName || "-" }}
    </template>

    <template #typeId="{ row }">
      {{ t(getTransactionTypeNameById(row.typeId)) }}
    </template>

    <template #amount="{ row }">
      {{
        row.amount != null && row.amount !== ""
          ? formatAmount(row.amount)
          : "-"
      }}
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>

    <template #memberName="{ row }">
      {{ row.memberName || '-' }}
    </template>

    <template #rate="{ row }">
      {{ row.rate || '-' }}
    </template>

    <template #referenceCode="{ row }">
      {{ row.referenceCode || '-' }}
    </template>

    <template #remark="{ row }">
      {{ row.remark || '-' }}
    </template>
  </ReusableTable>

  <TransactionModal
    v-if="isModalVisible"
    :isVisible="isModalVisible"
    :formTitle="formTitle"
    :formData="formData"
    :isEdit="isEdit"
    @save="handleSave"
    @close="closeModal"
  />

  <n-modal
    v-model:show="isTransactionDetailsModalVisible"
    preset="dialog"
    :title="$t('transaction_details')"
    style="width: min(920px, 92vw)"
  >
    <n-data-table
      v-if="transactionDetails.length"
      :columns="detailTableColumns"
      :data="transactionDetails"
      :bordered="true"
      :single-line="false"
      size="small"
      class="mt-2"
    />
    <div v-else class="text-sm text-gray-500 py-6 text-center">
      {{ $t("no_data") }}
    </div>
  </n-modal>
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import TransactionModal from "@/components/modal/TransactionModal.vue";
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage, formatAmount } from "@/utils/common";
import { getTransactionTypeNameById } from "@/enum/transactionType";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";
import { EyeOutline, TrashOutline } from "@vicons/ionicons5";
import { NButton, NDataTable, NIcon, NModal, NTooltip } from "naive-ui";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canAddTransaction = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.addTransaction)
);
const canDeleteTransaction = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.deleteTransaction)
);

//#region FORM
const {
  brandOptions,
  getBrandOptions,
  transactionTypeOptions,
  getTransactionTypeOptions,
  bankOptions,
  getBankOptions,
} = useDropdown();

const fields = ref([
  {
    id: "brandId",
    label: "brand",
    type: "select",
    options: brandOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "typeId",
    label: "type",
    type: "select",
    options: transactionTypeOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "bankId",
    label: "bank",
    type: "select",
    options: bankOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({
  brandId: 0,
  typeId: 0,
  bankId: 0,
});

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchTransactionList();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => {
    delete initialData[key];
  });
  Object.assign(initialData, {
    brandId: 0,
    typeId: 0,
    bankId: 0,
  });
  fetchTransactionList();
};

watch(
  () => initialData.brandId,
  async (bid) => {
    if (bid) {
      await getBankOptions(true, { brandId: bid });
    } else {
      await getBankOptions(true, {});
    }
  },
  { immediate: true }
);

onMounted(() => {
  getBrandOptions(true);
  getTransactionTypeOptions(true);
});
//#endregion

//#region TABLE
const offset = ref(0);
const limit = ref(10);
const sortKey = ref("createdAt");
const sortOrder = ref("desc");
const totalRows = ref(0);

const tableHeaders = ref([
  { label: "action", key: "action", sortable: false },
  { label: "brand", key: "brandName", sortable: false },
  { label: "type", key: "typeId", sortable: false },
  { label: "member", key: "memberName", sortable: false },
  { label: "amount", key: "amount", sortable: false },
  { label: "rate", key: "rate", sortable: false },
  { label: "referenceCode", key: "referenceCode", sortable: false },
  { label: "remark", key: "remark", sortable: false },
  { label: "created_at", key: "createdAt", sortable: false },
]);

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchTransactionList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchTransactionList();
};

const fetchTransactionList = async () => {
  try {
    const params = {
      offset: offset.value,
      limit: limit.value,
      sort: sortKey.value,
      order: sortOrder.value,
    };

    Object.keys(initialData).forEach((key) => {
      if (initialData[key]) {
        params[key] = initialData[key];
      }
    });

    const resp = await callApi("/transaction", "GET", null, params);
    if (resp) {
      tableData.value = resp.transactionList || [];
      totalRows.value = resp.count || 0;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchTransactionList();
});
//#endregion

//#region MODAL
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref("add_transaction");
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, {
    brandId: null,
    typeId: null,
    bankId: null,
    fromBankId: null,
    toBankId: null,
    memberId: null,
    amount: "",
    transferOutAmount: "",
    transferInAmount: "",
    rate: "",
    remark: "",
  });
};

const handleAdd = () => {
  formTitle.value = "add_transaction";
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  formTitle.value = "";
  resetFormData();
};

const handleSave = async (submitData) => {
  try {
    await callApi("/transaction", "POST", submitData, null);
    handleMessage(t("transaction_created"), "success");
    closeModal();
    fetchTransactionList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
};

const isDeleteConfirmVisible = ref(false);
const rowPendingDelete = ref(null);
const deleteSubmitting = ref(false);

const openDeleteConfirm = (row) => {
  rowPendingDelete.value = row;
  isDeleteConfirmVisible.value = true;
};

const closeDeleteConfirm = () => {
  isDeleteConfirmVisible.value = false;
  rowPendingDelete.value = null;
};

const confirmDeleteTransaction = async () => {
  const row = rowPendingDelete.value;
  if (!row?.id) return;
  deleteSubmitting.value = true;
  try {
    await callApi(`/transaction/${row.id}`, "DELETE", null, null, false);
    handleMessage(t("transaction_deleted"), "success");
    closeDeleteConfirm();
    fetchTransactionList();
  } catch (error) {
    handleApiError(error);
  } finally {
    deleteSubmitting.value = false;
  }
};
//#endregion

//#region Transaction Details Modal (multi-bank)
const isTransactionDetailsModalVisible = ref(false);
const transactionDetails = ref([]);

const formatDetailDebit = (row) =>
  row.debitAmount && Number(row.debitAmount) > 0
    ? formatAmount(row.debitAmount)
    : "-";

const formatDetailCredit = (row) =>
  row.creditAmount && Number(row.creditAmount) > 0
    ? formatAmount(row.creditAmount)
    : "-";

const detailTableColumns = computed(() => [
  {
    title: t("bankProvider"),
    key: "bankProviderName",
    render: (row) => row.bankProviderName || "-",
  },
  {
    title: t("account_name"),
    key: "bankAccountName",
    render: (row) => row.bankAccountName || "-",
  },
  {
    title: t("account_number"),
    key: "bankAccountNumber",
    render: (row) => row.bankAccountNumber || "-",
  },
  {
    title: t("thirdParty"),
    key: "isCounterParty",
    width: 100,
    render: (row) => (row.isCounterParty ? t("yes") : t("no")),
  },
  {
    title: t("debit"),
    key: "debitAmount",
    render: (row) => formatDetailDebit(row),
  },
  {
    title: t("credit"),
    key: "creditAmount",
    render: (row) => formatDetailCredit(row),
  },
]);

const openTransactionDetails = (row) => {
  transactionDetails.value = row?.transactionDetails || [];
  isTransactionDetailsModalVisible.value = true;
};
//#endregion
</script>

