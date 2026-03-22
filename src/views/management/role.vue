<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddRole"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable title="role" :headers="filteredTableHeaders" :data="tableData" :offset="offset" :limit="limit" :totalRows="totalRows" bordered striped @sort="handleSort" @pagination="handlePaginate">
    <template #action="{ row }">
      <div
        v-if="canEditRole"
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
              :disabled="row.id == 1"
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
      <n-tag :type="getRoleStatusTagTypeById(row.statusId)" size="small" round>
        {{ t(getRoleStatusNameById(row.statusId)) }}
      </n-tag>
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>
  </ReusableTable>

  <RoleModal v-if="isModalVisible" :isVisible="isModalVisible" :formTitle="formTitle" :formData="formData" :isEdit="isEdit" @save="handleSave" @close="closeModal" />
</template>

<script setup>
import ReusableTable from '@/components/ReusableTable.vue';
import DynamicSearchForm from '@/components/DynamicSearchForm.vue';
import RoleModal from '@/components/modal/RoleModal.vue';
import { PencilOutline } from '@vicons/ionicons5';
import { ref, reactive, onMounted, computed } from 'vue';
import { NButton, NIcon } from 'naive-ui';
import { useI18n } from "vue-i18n";
import { useCallApi } from '@/hooks/useCallApi';
import { useDropdown } from '@/composables/useDropdown';
import { dateFormat, handleMessage } from '@/utils/common';
import { getRoleStatusNameById, getRoleStatusTagTypeById } from '@/enum/roleStatus';
import { useApiError } from '@/composables/useApiError';
import { useSubmitLoadingStore } from '@/store/useSubmitLoadingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ACCESS_ACTIONS } from '@/enum/accessPermission';

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canListRole = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.listRole)
);
const canAddRole = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.addRole)
);
const canEditRole = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.updateRole)
);

//#region Form
const { roleStatusOptions, getRoleStatusOptions } = useDropdown();

const fields = ref([
  { id: 'name', label: 'name', type: 'text', colClass: 'col-span-12 lg:col-span-3' },
  { id: 'statusId', label: 'status', type: 'select', options: roleStatusOptions, colClass: 'col-span-12 lg:col-span-3' },
])

const initialData = reactive({ statusId: 0, name: '' });

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchRoleList();
};

const handleReset = () => {
  Object.keys(initialData).forEach(key => {
    delete initialData[key];
  });
  Object.assign(initialData, { statusId: 0, name: '' });
  fetchRoleList();
}

onMounted(() => {
  getRoleStatusOptions(true);
});
//#endregion

//#region Table
const offset = ref(0)
const limit = ref(10)
const sortKey = ref('createdAt')
const sortOrder = ref('desc')
const totalRows = ref(3)

const filteredTableHeaders = computed(() => {
  return tableHeaders.value.filter((header) => {
    if (header.key === "action") {
      return canEditRole.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: 'action', key: 'action', sortable: false },
  { label: 'name', key: 'name', sortable: false },
  { label: 'status', key: 'statusId', sortable: false },
  { label: 'created_at', key: 'createdAt', sortable: false },
])

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchRoleList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchRoleList();
};

const fetchRoleList = async () => {
  try {
    const params = {
      offset: offset.value,
      limit: limit.value,
      sort: sortKey.value,
      order: sortOrder.value,
    };

    Object.keys(initialData).forEach(key => {
      if (initialData[key]) {
        params[key] = initialData[key];
      }
    });

    if (!canListRole.value) {
      tableData.value = [];
      totalRows.value = 0;
      return;
    }

    const resp = await callApi('/role', 'GET', null, params);
    if (resp) {
      tableData.value = resp.roleList;
      totalRows.value = resp.count;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchRoleList();
});
//#endregion

//#region Modal
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref('add_role');
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, {
    name: '',
    statusId: 1,
    accessPageIds: [],
    accessActionIds: [],
    accessFeatureIds: [],
  });
}

const handleAdd = () => {
  formTitle.value = 'add_role';
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
}

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/role/${row.id}`, 'GET', null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = 'edit_role';
    isEdit.value = true;
    isModalVisible.value = true;
  } catch (error) {
    handleApiError(error);
  }
}

const closeModal = () => {
  isModalVisible.value = false;
  formTitle.value = '';
  resetFormData();
}

const handleSave = async (submitData) => {
  try {
    if(isEdit.value) {
      await callApi(`/role/${submitData.id}`, 'PATCH', submitData, null);
    } else {
      await callApi('/role', 'POST', submitData, null);
    }
    handleMessage(t(isEdit.value ? 'role_updated' : 'role_created'), 'success');
    closeModal();
    fetchRoleList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
}
//#endregion
</script>
