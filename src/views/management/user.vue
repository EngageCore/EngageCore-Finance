<template>
  <DynamicSearchForm
    :fields="fields"
    :initialData="initialData"
    :showAddButton="canAddUser"
    @add="handleAdd"
    @submit="handleSearch"
    @reset="handleReset"
  />

  <ReusableTable title="user" :headers="filteredTableHeaders" :data="tableData" :offset="offset" :limit="limit" :totalRows="totalRows" bordered striped @sort="handleSort" @pagination="handlePaginate">
    <template #action="{ row }">
      <div
        v-if="canEditUser || canChangeUserPassword"
        class="flex justify-center items-center gap-2"
      >
        <n-tooltip v-if="canEditUser" trigger="hover">
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
          {{ $t("edit") }}
        </n-tooltip>
        <n-tooltip v-if="canChangeUserPassword" trigger="hover">
          <template #trigger>
            <n-button
              circle
              tertiary
              type="primary"
              size="small"
              class="!w-8 !h-8 flex items-center justify-center"
              @click="openPasswordModal(row)"
              :disabled="row.id == 1"
            >
              <template #icon>
                <n-icon class="text-lg">
                  <KeyOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t("reset_password") }}
        </n-tooltip>
      </div>
    </template>

    <template #statusId="{ row }">
      <n-tag :type="getUserTagTypeById(row.statusId)" size="small" round>
        {{ t(getUserNameById(row.statusId)) }}
      </n-tag>
    </template>

    <template #createdAt="{ row }">
      {{ dateFormat(row.createdAt) }}
    </template>
  </ReusableTable>

  <UserModal v-if="isModalVisible" :isVisible="isModalVisible" :formTitle="formTitle" :formData="formData" :isEdit="isEdit" @save="handleSave" @close="closeModal" />

  <n-modal
    v-model:show="isPasswordModalVisible"
    preset="dialog"
    :mask-closable="false"
  >
    <template #header>
      {{ $t("reset_password") }}
    </template>
    <div class="flex flex-col gap-3">
      <div v-if="passwordTargetName" class="text-sm text-gray-500 dark:text-gray-400">
        {{ passwordTargetName }}
      </div>
      <div>
        <div class="text-sm mb-1">{{ $t("password") }}</div>
        <n-input
          v-model:value="passwordForm.password"
          type="password"
          show-password-on="mousedown"
          :placeholder="$t('please_input')"
          clearable
        />
      </div>
    </div>
    <template #action>
      <n-button @click="closePasswordModal">
        {{ $t("cancel") }}
      </n-button>
      <n-button
        type="primary"
        :loading="passwordSubmitting"
        @click="submitPasswordChange"
      >
        {{ $t("confirm") }}
      </n-button>
    </template>
  </n-modal>
</template>

<script setup>
import ReusableTable from '@/components/ReusableTable.vue';
import DynamicSearchForm from '@/components/DynamicSearchForm.vue';
import UserModal from '@/components/modal/UserModal.vue';
import { PencilOutline, KeyOutline } from '@vicons/ionicons5';
import { ref, reactive, onMounted, computed } from 'vue';
import { NButton, NIcon, NInput, NModal } from 'naive-ui';
import { useI18n } from "vue-i18n";
import { useCallApi } from '@/hooks/useCallApi';
import { useDropdown } from '@/composables/useDropdown';
import { dateFormat, handleMessage } from '@/utils/common';
import { getUserNameById, getUserTagTypeById } from '@/enum/userStatus';
import { useApiError } from '@/composables/useApiError';
import { useSubmitLoadingStore } from '@/store/useSubmitLoadingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ACCESS_ACTIONS } from '@/enum/accessPermission';

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const authStore = useAuthStore();
const canListUser = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.listUser)
);
const canAddUser = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.addUser)
);
const canEditUser = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.updateUser)
);
const canChangeUserPassword = computed(() =>
  authStore.hasActionAccess(ACCESS_ACTIONS.updateUserPassword)
);

//#region Form
const { roleOptions, getRoleOptions, userStatusOptions, getUserStatusOptions } = useDropdown();

const fields = ref([
  { id: 'name', label: 'name', type: 'text', colClass: 'col-span-12 lg:col-span-3' },
  { id: 'roleId', label: 'role', type: 'select', options: roleOptions, colClass: 'col-span-12 lg:col-span-3' },
  { id: 'statusId', label: 'status', type: 'select', options: userStatusOptions, colClass: 'col-span-12 lg:col-span-3' },
])

const initialData = reactive({ statusId: 0, roleId: 0 });

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchUserList();
};

const handleReset = () => {
  Object.keys(initialData).forEach(key => {
    delete initialData[key];
  });
  Object.assign(initialData, { statusId: 0, roleId: 0 });
  fetchUserList();
}

onMounted(() => {
  getUserStatusOptions(true);
  getRoleOptions(true);
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
      return canEditUser.value || canChangeUserPassword.value;
    }
    return true;
  });
});

const tableHeaders = ref([
  { label: 'action', key: 'action', sortable: false },
  { label: 'name', key: 'name', sortable: false },
  { label: 'role', key: 'roleName', sortable: false },
  { label: 'status', key: 'statusId', sortable: false },
  { label: 'created_at', key: 'createdAt', sortable: false },
])

const tableData = ref([]);

const handleSort = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchUserList();
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  fetchUserList();
};

const fetchUserList = async () => {
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

    if (!canListUser.value) {
      tableData.value = [];
      totalRows.value = 0;
      return;
    }

    const resp = await callApi('/user', 'GET', null, params);
    if (resp) {
      tableData.value = resp.userList;
      totalRows.value = resp.count;
    }
  } catch (error) {
    handleApiError(error);
  }
};

onMounted(() => {
  fetchUserList();
});
//#endregion

//#region Modal
const loadingStore = useSubmitLoadingStore();
const isModalVisible = ref(false);
const formTitle = ref('add_user');
const formData = reactive({});
const isEdit = ref(false);

const resetFormData = () => {
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, {
    name: '',
    password: '',
    confirmPassword: '',
    roleId: null,
    statusId: 1,
  });
}

const handleAdd = () => {
  formTitle.value = 'add_user';
  isEdit.value = false;
  resetFormData();
  isModalVisible.value = true;
}

const handleEdit = async (row) => {
  try {
    const resp = await callApi(`/user/${row.id}`, 'GET', null);
    resetFormData();
    if (resp) {
      Object.assign(formData, resp);
    }
    formTitle.value = 'edit_user';
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
      await callApi(`/user/${submitData.id}`, 'PATCH', submitData, null);
    } else {
      await callApi('/user', 'POST', submitData, null);
    }
    handleMessage(t(isEdit.value ? 'user_updated' : 'user_created'), 'success');
    closeModal();
    fetchUserList();
  } catch (error) {
    handleApiError(error);
  } finally {
    loadingStore.endSubmit();
  }
}

const isPasswordModalVisible = ref(false);
const passwordTargetId = ref(null);
const passwordTargetName = ref("");
const passwordForm = reactive({
  password: "",
});
const passwordSubmitting = ref(false);

const openPasswordModal = (row) => {
  if (row?.id == 1) return;
  passwordTargetId.value = row.id;
  passwordTargetName.value = row.name || "";
  passwordForm.password = "";
  isPasswordModalVisible.value = true;
};

const closePasswordModal = () => {
  isPasswordModalVisible.value = false;
  passwordTargetId.value = null;
  passwordTargetName.value = "";
  passwordForm.password = "";
};

const submitPasswordChange = async () => {
  if (!passwordTargetId.value) return;
  if (!passwordForm.password) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }
  passwordSubmitting.value = true;
  try {
    await callApi(
      `/user/${passwordTargetId.value}/password`,
      "PATCH",
      { password: passwordForm.password },
      null,
      false
    );
    handleMessage(t("user_password_updated"), "success");
    closePasswordModal();
  } catch (error) {
    handleApiError(error);
  } finally {
    passwordSubmitting.value = false;
  }
};
//#endregion
</script>
