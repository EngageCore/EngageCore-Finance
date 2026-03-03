<template>
  <DynamicSearchForm :fields="fields" :initialData="initialData" :showAddButton="true" @add="handleAdd" @submit="handleSearch" @reset="handleReset" />

  <ReusableTable title="role" :headers="tableHeaders" :data="tableData" :offset="offset" :limit="limit"
    :totalRows="totalRows" bordered striped @sort="handleSort" @pagination="handlePaginate">
    <template #action="{ row }">
      <div class="flex justify-center items-center gap-2">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button circle tertiary type="primary" size="small" class="!w-8 !h-8 flex items-center justify-center" @click="handleEdit(row)">
              <template #icon>
                <n-icon class="text-lg">
                  <PencilOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('edit') }}
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button circle tertiary type="success" size="small" class="!w-8 !h-8 flex items-center justify-center" @click="handleDuplicate(row)">
              <template #icon>
                <n-icon class="text-lg">
                  <CopyOutline />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('duplicate') }}
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
</template>

<script setup>
import ReusableTable from '@/components/ReusableTable.vue';
import DynamicSearchForm from '@/components/DynamicSearchForm.vue';
import { PencilOutline, CopyOutline } from '@vicons/ionicons5';
import { ref, reactive, onMounted } from 'vue';
import { NButton, NIcon } from 'naive-ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from "vue-i18n";
import { useCallApi } from '@/hooks/useCallApi';
import { useDropdown } from '@/composables/useDropdown';
import { dateFormat, convertToLocalDateOnly, convertToUTC, parseDateToNumber, getImageUrl, handleMessage, urlToBase64 } from '@/utils/common';
import { getRoleStatusNameById, getRoleStatusTagTypeById } from '@/enum/roleStatus';
import { useApiError } from '@/composables/useApiError';
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();

//#region Form
const { roleStatusOptions, getRoleStatusOptions } = useDropdown();

const fields = ref([
  { id: 'name', label: 'name', type: 'text', colClass: 'col-span-12 lg:col-span-3' },
  { id: 'statusId', label: 'status', type: 'select', options: roleStatusOptions, colClass: 'col-span-12 lg:col-span-3' },
])

const initialData = reactive({ startAt: null, endAt: null, statusId: 0 });

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  fetchRoleList();
};

const handleReset = () => {
  Object.keys(initialData).forEach(key => {
    delete initialData[key];
  });
  Object.assign(initialData, { startAt: null, endAt: null, statusId: 0 });
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

    if (params.startAt) {
      params.startAt = convertToUTC(params.startAt);
    }
    if (params.endAt) {
      params.endAt = convertToUTC(params.endAt);
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
</script>
