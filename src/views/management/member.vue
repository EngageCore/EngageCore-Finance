<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddMember"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable
    title="member"
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
    <template #header-right>
      <n-button
        v-if="canAddMember"
        size="small"
        type="primary"
        @click="openBulkModal"
      >
        {{ $t('bulk_add_member') }}
      </n-button>
    </template>
    <template #action="{ row }">
      <div
        v-if="canEditMember"
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

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>
  </ReusableTable>

  <MemberModal
    v-if="isModalVisible"
    :isVisible="isModalVisible"
    :formTitle="formTitle"
    :formData="formData"
    :isEdit="isEdit"
    @save="handleSave"
    @close="closeModal"
  />

  <n-modal v-model:show="isBulkModalVisible" preset="dialog">
    <template #header>
      {{ $t("bulk_add_member") }}
    </template>
    <div class="flex flex-col gap-4">
      <n-button size="small" type="primary" @click="downloadBulkTemplate">
        {{ $t("download_template") }}
      </n-button>
      <n-upload
        :file-list="bulkFileList"
        :on-update:file-list="handleBulkFileChange"
        :max="1"
        accept=".xlsx,.xls"
        :default-upload="false"
      >
        <n-upload-dragger>
          <n-text>{{ $t("please_select") }} Excel</n-text>
        </n-upload-dragger>
      </n-upload>
    </div>
    <template #action>
      <n-button @click="closeBulkModal">
        {{ $t("cancel") }}
      </n-button>
      <n-button type="primary" @click="handleBulkConfirm">
        {{ $t("submit") }}
      </n-button>
    </template>
  </n-modal>
</template>

<script setup>
import ReusableTable from "@/components/ReusableTable.vue";
import DynamicSearchForm from "@/components/DynamicSearchForm.vue";
import MemberModal from "@/components/modal/MemberModal.vue";
import { PencilOutline } from "@vicons/ionicons5";
import { ref, reactive, onMounted, computed } from "vue";
import { NButton, NIcon, NModal, NUpload, NUploadDragger, NText } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useDropdown } from "@/composables/useDropdown";
import { dateFormat, handleMessage } from "@/utils/common";
import { useApiError } from "@/composables/useApiError";
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ACCESS_ACTIONS } from "@/enum/accessPermission";
import * as XLSX from "xlsx";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canListMember = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.listMember)
);
const canAddMember = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.addMember)
);
const canEditMember = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.updateMember)
);

//#region FORM
const { brandOptions, getBrandOptions } = useDropdown();

const fields = ref([
  {
    id: "brandId",
    label: "brand",
    type: "select",
    options: brandOptions,
    colClass: "col-span-12 lg:col-span-3",
  },
  {
    id: "name",
    label: "name",
    type: "text",
    colClass: "col-span-12 lg:col-span-3",
  },
]);

const initialData = reactive({
  brandId: 0,
  name: "",
});

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchMemberList();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => {
    delete initialData[key];
  });
  Object.assign(initialData, {
    brandId: 0,
    name: "",
  });
  fetchMemberList();
};

onMounted(() => {
  getBrandOptions(true);
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
      return canEditMember.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: "action", key: "action", sortable: false },
  { label: "brand", key: "brandName", sortable: false },
  { label: "code", key: "code", sortable: false },
  { label: "name", key: "name", sortable: false },
  { label: "created_at", key: "createdAt", sortable: false },
]);

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchMemberList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchMemberList();
};

const fetchMemberList = async () => {
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

    if (!canListMember.value) {
      tableData.value = [];
      totalRows.value = 0;
      return;
    }

    const resp = await callApi("/member", "GET", null, params);
    if (resp) {
      tableData.value = resp.memberList;
      totalRows.value = resp.count;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchMemberList();
});
//#endregion

//#region MODAL
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref("add_member");
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, {
    brandId: null,
    name: "",
  });
};

const handleAdd = () => {
  formTitle.value = "add_member";
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
};

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/member/${row.id}`, "GET", null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = "edit_member";
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
      await callApi(`/member/${submitData.id}`, "PATCH", submitData, null);
    } else {
      await callApi("/member", "POST", submitData, null);
    }
    handleMessage(
      t(isEdit.value ? "member_updated" : "member_created"),
      "success"
    );
    closeModal();
    fetchMemberList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
};
//#endregion

//#region BULK ADD
const isBulkModalVisible = ref(false);
const bulkFileList = ref([]);

const openBulkModal = () => {
  bulkFileList.value = [];
  isBulkModalVisible.value = true;
};

const closeBulkModal = () => {
  isBulkModalVisible.value = false;
  bulkFileList.value = [];
};

const handleBulkFileChange = (files) => {
  bulkFileList.value = files.slice(-1);
};

const downloadBulkTemplate = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([["brandCode", "code", "name"]]);
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "member_bulk_template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleBulkConfirm = async () => {
  try {
    if (!bulkFileList.value.length) {
      handleMessage(t("please_select"), "warning");
      return;
    }
    const file = bulkFileList.value[0].file;
    if (!file) {
      handleMessage(t("please_select"), "warning");
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const payload = rows
      .map((row) => ({
        brandCode: String(row.brandCode || "").trim(),
        code: String(row.code || "").trim(),
        name: String(row.name || "").trim(),
      }))
      .filter((item) => item.brandCode && item.code && item.name);

    if (!payload.length) {
      handleMessage(t("no_data"), "warning");
      return;
    }

    await callApi("/member/bulk", "POST", payload, null);
    handleMessage(t("member_created"), "success");
    closeBulkModal();
    fetchMemberList();
  } catch (error) {
    handleApiError(error);
  }
};
//#endregion
</script>
