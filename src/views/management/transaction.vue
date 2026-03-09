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
    <template #typeId="{ row }">
      {{ t(getTransactionTypeNameById(row.typeId)) }}
    </template>

    <template #debit="{ row }">
      {{ row.debit ? formatAmount(row.debit) : '-' }}
    </template>

    <template #credit="{ row }">
      {{ row.credit ? formatAmount(row.credit) : '-' }}
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>

    <template #memberName="{ row }">
      {{ row.memberName || '-' }}
    </template>

    <template #counterPartyName="{ row }">
      {{ row.counterPartyName || '-' }}
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
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import TransactionModal from "@/components/modal/TransactionModal.vue";
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage, formatAmount } from "@/utils/common";
import { getTransactionTypeNameById } from "@/enum/transactionType";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canAddTransaction = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.addTransaction)
);

//#region FORM
const { brandOptions, getBrandOptions, transactionTypeOptions, getTransactionTypeOptions } =
  useDropdown();

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
]);

const initialData = reactive({
  brandId: 0,
  typeId: 0,
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
  });
  fetchTransactionList();
};

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
  { label: "brand", key: "brandName", sortable: false },
  { label: "bank", key: "bankProviderName", sortable: false },
  { label: "account_name", key: "bankAccountName", sortable: false },
  { label: "account_number", key: "bankAccountNumber", sortable: false },
  { label: "type", key: "typeId", sortable: false },
  { label: "member", key: "memberName", sortable: false },
  { label: "counterParty", key: "counterPartyName", sortable: false },
  { label: "debit", key: "debit", sortable: false },
  { label: "credit", key: "credit", sortable: false },
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
    counterPartyId: null,
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
//#endregion
</script>

