<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddBank"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable
    title="bank"
    :headers="filteredTableHeaders"
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
      <div
        class="flex justify-center items-center gap-2"
        v-if="canEditBank || canDeleteBank"
      >
        <n-tooltip v-if="canEditBank" trigger="hover">
          <template #trigger>
            <n-button
              circle
              tertiary
              type="primary"
              size="small"
              class="!w-8 !h-8 flex items-center justify-center"
              @click="handleEdit(row)"
            >
              <template #icon>
                <n-icon class="text-lg">
                  <PencilOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t("edit") }}
        </n-tooltip>
        <n-tooltip v-if="canDeleteBank" trigger="hover">
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

    <template #balance="{ row }">
      {{ formatAmount(row.balance) }}
    </template>

    <template #isCounterParty="{ row }">
      <n-tag v-if="row.isCounterParty" size="small" type="warning" round>
        {{ $t("yes") }}
      </n-tag>
      <span v-else class="text-gray-500">{{ $t("no") }}</span>
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>
  </ReusableTable>

  <BankModal
    v-if="isModalVisible"
    :isVisible="isModalVisible"
    :formTitle="formTitle"
    :formData="formData"
    :isEdit="isEdit"
    @save="handleSave"
    @close="closeModal"
  />

  <n-modal
    v-model:show="isDeleteConfirmVisible"
    preset="dialog"
    :mask-closable="false"
  >
    <template #header>
      {{ $t("tip") }}
    </template>
    <div>{{ $t("delete_bank_confirm") }}</div>
    <div
      v-if="rowPendingDelete"
      class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ rowPendingDelete.bankProviderName || "" }}
      <span v-if="rowPendingDelete.accountName">
        — {{ rowPendingDelete.accountName }}
      </span>
      <span v-if="rowPendingDelete.accountNumber">
        ({{ rowPendingDelete.accountNumber }})
      </span>
    </div>
    <template #action>
      <n-button @click="closeDeleteConfirm">
        {{ $t("cancel") }}
      </n-button>
      <n-button type="error" :loading="deleteSubmitting" @click="confirmDeleteBank">
        {{ $t("delete") }}
      </n-button>
    </template>
  </n-modal>
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import BankModal from "@/components/modal/BankModal.vue";
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";
import { ref, reactive, onMounted, computed } from "vue";
import { NButton, NIcon, NModal, NTag } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage, formatAmount } from "@/utils/common";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();

const authStore = useAuthStore();
const canListBank = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.listBank)
);
const canAddBank = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.addBank)
);
const canEditBank = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.updateBank)
);
const canDeleteBank = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.deleteBank)
);

//#region FORM
const { bankProviderOptions, getBankProviderOptions } = useDropdown();

const isCounterPartyFilterOptions = computed(() => [
  { label: t("all"), value: 0 },
  { label: t("yes"), value: 1 },
  { label: t("no"), value: 2 },
]);

const fields = computed(() => [
  {
    id: "bankProviderId",
    label: "bankProvider",
    type: "select",
    options: bankProviderOptions.value,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "isCounterParty",
    label: "thirdParty",
    type: "select",
    options: isCounterPartyFilterOptions.value,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "accountName",
    label: "account_name",
    type: "text",
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "accountNumber",
    label: "account_number",
    type: "text",
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({
  bankProviderId: 0,
  isCounterParty: 0,
  accountName: "",
  accountNumber: "",
  currency: "",
});

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchBankList();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => {
    delete initialData[key];
  });
  Object.assign(initialData, {
    brandId: 0,
    bankProviderId: 0,
    isCounterParty: 0,
    accountName: "",
    accountNumber: "",
    currency: "",
  });
  fetchBankList();
};

onMounted(() => {
  getBankProviderOptions(true);
});
//#endregion

//#region TABLE
const offset = ref(0);
const limit = ref(10);
const sortKey = ref("createdAt");
const sortOrder = ref("desc");
const totalRows = ref(0);

const filteredTableHeaders = computed(() => {
  return tableHeaders.value.filter((header) => {
    if (header.key === "action") {
      return canEditBank.value || canDeleteBank.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: "action", key: "action", sortable: false },
  { label: "bankProvider", key: "bankProviderName", sortable: false },
  { label: "thirdParty", key: "isCounterParty", sortable: false },
  { label: "account_name", key: "accountName", sortable: false },
  { label: "account_number", key: "accountNumber", sortable: false },
  { label: "balance", key: "balance", sortable: false },
  { label: "currency", key: "currency", sortable: false },
  { label: "created_at", key: "createdAt", sortable: false },
]);

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchBankList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchBankList();
};

const fetchBankList = async () => {
  try {
    const params = {
      offset: offset.value,
      limit: limit.value,
      sort: sortKey.value,
      order: sortOrder.value,
    };

    Object.keys(initialData).forEach((key) => {
      if (key === "isCounterParty") return;
      if (initialData[key]) {
        params[key] = initialData[key];
      }
    });

    if (initialData.isCounterParty === 1) {
      params.isCounterParty = true;
    } else if (initialData.isCounterParty === 2) {
      params.isCounterParty = false;
    }

    if (!canListBank.value) {
      tableData.value = [];
      totalRows.value = 0;
      return;
    }

    const resp = await callApi("/bank", "GET", null, params);
    if (resp) {
      tableData.value = resp.bankList || [];
      totalRows.value = resp.count || 0;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchBankList();
});
//#endregion

//#region MODAL
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref("add_bank");
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, {
    bankProviderId: null,
    accountName: "",
    accountNumber: "",
    balance: "",
    currency: "",
    isCounterParty: false,
  });
};

const handleAdd = () => {
  formTitle.value = "add_bank";
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
};

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/bank/${row.id}`, "GET", null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = "edit_bank";
    isEdit.value = true;
    isModalVisible.value = true;
  } catch (error) {
    handleApiError(error);
  }
};

const closeModal = () => {
  isModalVisible.value = false;
  formTitle.value = "";
  resetFormData();
};

const handleSave = async (submitData) => {
  try {
    if (isEdit.value) {
      await callApi(`/bank/${submitData.id}`, "PATCH", submitData, null);
    } else {
      await callApi("/bank", "POST", submitData, null);
    }
    handleMessage(
      t(isEdit.value ? "bank_updated" : "bank_created"),
      "success"
    );
    closeModal();
    fetchBankList();
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

const confirmDeleteBank = async () => {
  const row = rowPendingDelete.value;
  if (!row?.id) return;
  deleteSubmitting.value = true;
  try {
    await callApi(`/banks/${row.id}`, "DELETE", null, null, false);
    handleMessage(t("bank_deleted"), "success");
    closeDeleteConfirm();
    fetchBankList();
  } catch (error) {
    handleApiError(error);
  } finally {
    deleteSubmitting.value = false;
  }
};
//#endregion
</script>
