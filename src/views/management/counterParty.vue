<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddCounterParty"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable
    title="counterParty"
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
        v-if="canEditCounterParty"
        class="flex justify-center items-center gap-2"
      >
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

    <template #statusId="{ row }">
      <n-tag :type="getCounterPartyStatusTagTypeById(row.statusId)" size="small" round>
        {{ t(getCounterPartyStatusNameById(row.statusId)) }}
      </n-tag>
    </template>

    <template #typeId="{ row }">
      {{ t(getCounterPartyTypeNameById(row.typeId)) }}
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>

    <template #outstandingAmount="{ row }">
      {{ formatAmount(row.outstandingAmount) }}
    </template>
  </ReusableTable>

  <CounterPartyModal
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
import CounterPartyModal from "@/components/modal/CounterPartyModal.vue";
import { PencilOutline } from "@vicons/ionicons5";
import { ref, reactive, onMounted, computed } from "vue";
import { NButton, NIcon } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage, formatAmount } from "@/utils/common";
import {
  getCounterPartyTypeNameById,
} from "@/enum/counterPartyType";
import { getCounterPartyStatusNameById, getCounterPartyStatusTagTypeById } from "@/enum/counterPartyStatus";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canListCounterParty = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.listCounterParty)
);
const canAddCounterParty = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.addCounterParty)
);
const canEditCounterParty = computed(() =>
  authStore.userInfo.accessActionIds.includes(ACCESS_ACTIONS.updateCounterParty)
);

//#region FORM
const { counterPartyTypeOptions, getCounterPartyTypeOptions } = useDropdown();

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
    id: "typeId",
    label: "type",
    type: "select",
    options: [
      { label: t("partner"), value: 1 },
      { label: t("bank_agent"), value: 2 },
    ],
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "statusId",
    label: "status",
    type: "select",
    options: counterPartyTypeOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({
  statusId: 0,
  name: "",
  code: "",
  typeId: 0,
});

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchCounterPartyList();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => {
    delete initialData[key];
  });
  Object.assign(initialData, {
    statusId: 0,
    name: "",
    code: "",
    typeId: 0,
  });
  fetchCounterPartyList();
};

onMounted(() => {
  getCounterPartyTypeOptions(true);
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
      return canEditCounterParty.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: "action", key: "action", sortable: false },
  { label: "brand", key: "brandName", sortable: false },
  { label: "code", key: "code", sortable: false },
  { label: "name", key: "name", sortable: false },
  { label: "type", key: "typeId", sortable: false },
  { label: "outstanding_amount", key: "outstandingAmount", sortable: false },
  { label: "status", key: "statusId", sortable: false },
  { label: "created_at", key: "createdAt", sortable: false },
]);

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchCounterPartyList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchCounterPartyList();
};

const fetchCounterPartyList = async () => {
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

    if (!canListCounterParty.value) {
      tableData.value = [];
      totalRows.value = 0;
      return;
    }

    const resp = await callApi("/counterParty", "GET", null, params);
    if (resp) {
      tableData.value = resp.counterPartyList;
      totalRows.value = resp.count;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchCounterPartyList();
});
//#endregion

//#region MODAL
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref("add_counterParty");
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, {
    brandId: "",
    name: "",
    code: "",
    typeId: 1,
    statusId: 1,
  });
};

const handleAdd = () => {
  formTitle.value = "add_counterParty";
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
};

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/counterParty/${row.id}`, "GET", null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = "edit_counterParty";
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
      await callApi(
        `/counterParty/${submitData.id}`,
        "PATCH",
        submitData,
        null
      );
    } else {
      await callApi("/counterParty", "POST", submitData, null);
    }
    handleMessage(
      t(isEdit.value ? "counterParty_updated" : "counterParty_created"),
      "success"
    );
    closeModal();
    fetchCounterPartyList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
};
//#endregion
</script>

