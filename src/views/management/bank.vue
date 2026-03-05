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
      <div class="flex justify-center items-center gap-2" v-if="canEditBank">
        <n-tooltip trigger="hover">
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
      </div>
    </template>

    <template #balance="{ row }">
      {{ formatAmount(row.balance) }}
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
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import BankModal from "@/components/modal/BankModal.vue";
import { PencilOutline } from "@vicons/ionicons5";
import { ref, reactive, onMounted, computed } from "vue";
import { NButton, NIcon } from "naive-ui";
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
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.listBank)
);
const canAddBank = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.addBank)
);
const canEditBank = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.updateBank)
);

//#region FORM
const { brandOptions, getBrandOptions, bankProviderOptions, getBankProviderOptions } = useDropdown();

const fields = ref([
  {
    id: "brandId",
    label: "brand",
    type: "select",
    options: brandOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "bankProviderId",
    label: "bankProvider",
    type: "select",
    options: bankProviderOptions,
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
  brandId: 0,
  bankProviderId: 0,
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
    accountName: "",
    accountNumber: "",
    currency: "",
  });
  fetchBankList();
};

onMounted(() => {
  getBrandOptions(true);
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
      return canEditBank.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: "action", key: "action", sortable: false },
  { label: "brand", key: "brandName", sortable: false },
  { label: "bankProvider", key: "bankProviderName", sortable: false },
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
      if (initialData[key]) {
        params[key] = initialData[key];
      }
    });

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
    brandId: null,
    bankProviderId: null,
    accountName: "",
    accountNumber: "",
    balance: "",
    currency: "",
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
//#endregion
</script>
