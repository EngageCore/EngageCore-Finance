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
    bordered
    striped
    :pagination="false"
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
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { formatAmount, formatDate, convertToUTC } from "@/utils/common";
import { useApiError } from "@/composables/useApiError";
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const { brandOptions, getBrandOptions } = useDropdown();

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
const tableData = ref([]);

const tableHeaders = ref([
  { label: "date", key: "date", sortable: false },
  { label: "brand", key: "brandName", sortable: false },
  { label: "total_deposit", key: "totalDeposit", sortable: false },
  { label: "total_withdrawal", key: "totalWithdrawal", sortable: false },
  { label: "total_winlose", key: "totalWinlose", sortable: false },
]);

const fetchWinlose = async () => {
  try {
    loading.value = true;
    
    const params = {
    }

    Object.keys(initialData).forEach(key => {
      if (initialData[key]) {
        params[key] = initialData[key];
      }
    });
    
    const resp = await callApi("/report/winlose", "GET", null, params);
    if (resp) {
      tableData.value = resp.list;
    } else {
      tableData.value = [];
    }
  } catch (error) {
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getBrandOptions(true);
  fetchWinlose();
});
//#endregion
</script>
