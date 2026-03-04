<template>
  <DynamicSearchForm :fields="fields" :initialData="initialData" :showAddButton="true" @add="handleAdd" @submit="handleSearch" @reset="handleReset" />

  <ReusableTable title="brand" :headers="tableHeaders" :data="tableData" :offset="offset" :limit="limit" :totalRows="totalRows" bordered striped @sort="handleSort" @pagination="handlePaginate">
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
              @click="handleEdit(row)"
            >
              <template #icon>
                <n-icon class="text-lg">
                  <PencilOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('edit') }}
        </n-tooltip>
      </div>
    </template>

    <template #statusId="{ row }">
      <n-tag :type="getBrandStatusTagTypeById(row.statusId)" size="small" round>
        {{ t(getBrandStatusNameById(row.statusId)) }}
      </n-tag>
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>
  </ReusableTable>

  <BrandModal v-if="isModalVisible" :isVisible="isModalVisible" :formTitle="formTitle" :formData="formData" :isEdit="isEdit" @save="handleSave" @close="closeModal" />
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import BrandModal from "@/components/modal/BrandModal.vue";
import { PencilOutline } from "@vicons/ionicons5";
import { ref, reactive, onMounted } from "vue";
import { NButton, NIcon } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage } from "@/utils/common";
import {
  getBrandStatusNameById,
  getBrandStatusTagTypeById,
} from "@/enum/brandStatus";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();

//#region FORM
const { roleStatusOptions, getRoleStatusOptions } = useDropdown();

const fields = ref([
  {
    id: "name",
    label: "name",
    type: "text",
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "code",
    label: "code",
    type: "text",
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "statusId",
    label: "status",
    type: "select",
    options: roleStatusOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({ statusId: 0, name: "", code: "" });

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchBrandList();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => {
    delete initialData[key];
  });
  Object.assign(initialData, { statusId: 0, name: "", code: "" });
  fetchBrandList();
};

onMounted(() => {
  getBrandStatusOptions(true);
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
  { label: "code", key: "code", sortable: false },
  { label: "name", key: "name", sortable: false },
  { label: "status", key: "statusId", sortable: false },
  { label: "created_at", key: "createdAt", sortable: false },
]);

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchBrandList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchBrandList();
};

const fetchBrandList = async () => {
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

    const resp = await callApi("/brand", "GET", null, params);
    if (resp) {
      tableData.value = resp.brandList;
      totalRows.value = resp.count;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchBrandList();
});
//#endregion

//#region MODAL
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref("add_brand");
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, {
    name: "",
    code: "",
    statusId: 1,
  });
};

const handleAdd = () => {
  formTitle.value = "add_brand";
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
};

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/brand/${row.id}`, "GET", null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = "edit_brand";
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
      await callApi(`/brand/${submitData.id}`, "PATCH", submitData, null);
    } else {
      await callApi("/brand", "POST", submitData, null);
    }
    handleMessage(t(isEdit.value ? "brand_updated" : "brand_created"), "success");
    closeModal();
    fetchBrandList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
};
//#endregion
</script>

