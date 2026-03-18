<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="false"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable
    title="winlose"
    :headers="tableHeaders"
    :data="tableData"
    :loading="loading"
    :showExport="canListWinlose"
    :exportLoading="exportLoading"
    bordered
    striped
    :pagination="false"
    @export="handleExport"
  >
    <template #date="{ row }">
      {{ row.date ? formatDate(row.date) : "-" }}
    </template>
    <template #totalDeposit="{ row }">
      {{ formatAmount(row.totalDeposit) }}
    </template>
    <template #totalWithdrawal="{ row }">
      {{ formatAmount(row.totalWithdrawal) }}
    </template>
    <template #totalWinlose="{ row }">
      {{ formatAmount(row.totalWinlose) }}
    </template>
  </ReusableTable>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { formatAmount, formatDate } from "@/utils/common";
import { useApiError } from "@/composables/useApiError";
import { exportService } from "@/services/exportService";
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const { brandOptions, getBrandOptions } = useDropdown();
const authStore = useAuthStore();
const canListWinlose = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.listWinlose)
);

//#region FORM
const fields = ref([
  {
    id: ['dateFrom', 'dateTo'],
    label: "date_range",
    type: "daterange",
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "brandId",
    label: "brand",
    type: "select",
    options: brandOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({
  dateFrom: null,
  dateTo: null,
  brandId: 0,
});

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  fetchWinlose();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => delete initialData[key]);
  Object.assign(initialData, {
    dateFrom: null,
    dateTo: null,
    brandId: 0,
  });
  fetchWinlose();
};

//#endregion

//#region TABLE
const loading = ref(true);
const exportLoading = ref(false);
const tableData = ref([]);
const totalRows = ref(0);
const tableHeaders = ref([
  { label: "date", key: "date", sortable: false },
  { label: "total_deposit_count", key: "totalDepositCount", sortable: false },
  { label: "total_withdrawal_count", key: "totalWithdrawalCount", sortable: false },
  { label: "total_deposit", key: "totalDeposit", sortable: false },
  { label: "total_withdrawal", key: "totalWithdrawal", sortable: false },
  { label: "total_winlose", key: "totalWinlose", sortable: false },
]);

const buildParams = () => {
  const rawParams = {};

  Object.keys(initialData).forEach((key) => {
    if (initialData[key]) {
      rawParams[key] = initialData[key];
    }
  });

  const { limit, offset, ...params } = rawParams;
  void limit;
  void offset;
  return params;
};

const fetchWinlose = async ({ isExport = false } = {}) => {
  try {
    if (!isExport) {
      loading.value = true;
    }

    const params = buildParams();

    if (!canListWinlose.value) {
      if (!isExport) {
        tableData.value = [];
        totalRows.value = 0;
      }
      return [];
    }

    const resp = await callApi("/report/winlose", "GET", null, params);
    if (resp) {
      if (isExport) {
        return resp.list || [];
      }

      tableData.value = resp.list || [];
      totalRows.value = resp.count || 0;
    }
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  } finally {
    if (!isExport) {
      loading.value = false;
    }
  }
};

const handleExport = async () => {
  try {
    exportLoading.value = true;
    const exportData = await fetchWinlose({ isExport: true });
    await exportService.export(exportData, tableHeaders.value, {
      filename: "winlose",
      type: "xlsx",
      labelResolver: (label) => t(label),
      valueResolver: (value, row, header) => {
        if (header.key === "date") return row.date ? formatDate(row.date) : "-";
        if (["totalDeposit", "totalWithdrawal", "totalWinlose"].includes(header.key)) return formatAmount(value);
        return value;
      }
    });
  } catch (error) {
    handleApiError(error);
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  getBrandOptions(true);
  fetchWinlose();
});
//#endregion
</script>
