<template>
  <div>
    <!-- 搜索表单 -->
    <DynamicSearchForm :fields="fields" :initialData="initialData" :showAddButton="true" @submit="handleSearch" @add="handleAdd" @reset="handleReset" />

    <!-- 表格 -->
    <ReusableTable :title="$t('bank_list')" :headers="tableHeaders" :data="tableData" :offset="offset" :limit="limit" :totalRows="totalRows" @sort="handleSort" @pagination="handlePaginate">
      <template #status="{ row }">
        <span :class="['badge', row.status == 'active' ? 'bg-success' : 'bg-danger']">
          {{ row.status == 'active' ? $t('active') : $t('inactive') }}
        </span>
      </template>

      <template #action="{ row }">
        <button class="btn btn-icon btn-sm btn-info-transparent rounded-pill" v-tooltip="$t('edit')" @click="handleEdit(row)">
          <i class="ri-edit-line"></i>
        </button>
      </template>
    </ReusableTable>
  </div>

  <!-- Modal -->
  <BankModal v-if="isModalVisible" :isVisible="isModalVisible" :formTitle="formTitle" :isEdit="isEdit" :formData="formData" @closeModal="closeModal" @saveChanges="handleSave" />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import DynamicSearchForm from '@/components/DynamicSearchForm.vue';
import ReusableTable from '@/components/ReusableTable.vue';
import BankModal from '@/components/Modal/BankModal.vue';
import { handleMessage } from '@/utils/notification';
import { useI18n } from 'vue-i18n';
import banksSeed from '@/mock/banks.json';
import transactionsSeed from '@/mock/transactions.json';

//#region Common
const { t } = useI18n();
//#endregion

//#region Form
const initialData = reactive({
  account_name: '',
  account_number: '',
  status: '',
});

const statusOptions = computed(() => [
  { value: '', label: t('all') },
  { value: 'active', label: t('active') },
  { value: 'inactive', label: t('inactive') },
]);

const fields = reactive([
  {
    id: 'account_name',
    label: 'account_name',
    type: 'text',
    placeholder: '',
    colClass: 'col-md-3 col-sm-6',
  },
  {
    id: 'account_number',
    label: 'account_number',
    type: 'text',
    placeholder: '',
    colClass: 'col-md-3 col-sm-6',
  },
  {
    id: 'status',
    label: 'status',
    type: 'select',
    options: statusOptions,
    colClass: 'col-md-3 col-sm-6',
  },
]);

const handleSearch = (formData) => {
  Object.assign(initialData, formData);
  offset.value = 0;
  applyFiltersAndPaginate();
};

const handleReset = () => {
  Object.keys(initialData).forEach((key) => delete initialData[key]);
  Object.assign(initialData, {
    status: '',
  })
  applyFiltersAndPaginate();
};
//#endregion

//#region Table
const offset = ref(0);
const limit = ref(10);
const totalRows = ref(0);
const tableData = ref([]);
const allRows = ref([]);

const tableHeaders = ref([
  { label: 'action', key: 'action', sortable: false },
  { label: 'account_name', key: 'account_name', sortable: false },
  { label: 'account_number', key: 'account_number', sortable: false },
  { label: 'balance', key: 'balance', sortable: false },
  { label: 'status', key: 'status', sortable: false },
]);

const STORAGE_KEY = 'mock_banks';
const TX_STORAGE_KEY = 'mock_transactions';

const loadBanks = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // ignore parse errors and fall back to seed
    }
  }
  return Array.isArray(banksSeed) ? banksSeed : [];
};

const loadTransactions = () => {
  const raw = localStorage.getItem(TX_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // ignore
    }
  }
  return Array.isArray(transactionsSeed) ? transactionsSeed : [];
};

const saveBanks = (rows) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
};

const saveTransactions = (rows) => {
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(rows));
};

const applyFiltersAndPaginate = () => {
  const accountNameFilter = (initialData.account_name || '').trim().toLowerCase();
  const accountNumberFilter = (initialData.account_number || '').trim().toLowerCase();
  const statusFilter = initialData.status || '';

  let filtered = allRows.value.slice();

  if (accountNameFilter) {
    filtered = filtered.filter((r) => (r.account_name || '').toLowerCase().includes(accountNameFilter));
  }
  if (accountNumberFilter) {
    filtered = filtered.filter((r) => String(r.account_number || '').toLowerCase().includes(accountNumberFilter));
  }
  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  totalRows.value = filtered.length;
  const start = offset.value;
  const end = offset.value + limit.value;
  tableData.value = filtered.slice(start, end);
};

const handleSort = ({ key, order }) => {
  // sorting not needed for mock list right now (keep handler for table)
  void key;
  void order;
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  applyFiltersAndPaginate();
};

onMounted(() => {
  allRows.value = loadBanks();
  applyFiltersAndPaginate();
});
//#endregion

//#region Modal
const isEdit = ref(false);
const isModalVisible = ref(false);
const formData = reactive({
  id: 0,
  account_name: '',
  account_number: '',
  balance: 0,
  opening_balance: 0,
  status: 'active',
});
const formTitle = ref('');

const handleAdd = () => {
  document.body.classList.add('no-scroll');
  formTitle.value = t('add_bank');
  isEdit.value = false;
  Object.assign(formData, {
    id: 0,
    account_name: '',
    account_number: '',
    balance: 0,
    opening_balance: 0,
    status: 'active',
  });
  isModalVisible.value = true;
};

const handleEdit = (row) => {
  document.body.classList.add('no-scroll');
  formTitle.value = t('edit_bank');
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    account_name: row.account_name ?? '',
    account_number: row.account_number ?? '',
    balance: Number(row.balance ?? 0),
    opening_balance: Number(row.balance ?? 0),
    status: row.status ?? 'active',
  });
  isModalVisible.value = true;
};

const closeModal = () => {
  formTitle.value = '';
  isEdit.value = false;
  Object.assign(formData, {
    id: 0,
    account_name: '',
    account_number: '',
    balance: 0,
    opening_balance: 0,
    status: 'active',
  });
  isModalVisible.value = false;
  document.body.classList.remove('no-scroll');
};

const handleSave = (updatedData) => {
  const rows = allRows.value.slice();

  if (isEdit.value) {
    const idx = rows.findIndex((r) => r.id === updatedData.id);
    if (idx !== -1) {
      rows[idx] = {
        ...rows[idx],
        account_name: updatedData.account_name,
        account_number: updatedData.account_number,
        balance: Number(updatedData.balance ?? rows[idx].balance ?? 0),
        status: updatedData.status ?? rows[idx].status ?? 'active',
      };
    }
    handleMessage(t, 'bank_updated_successfully', 'success');
  } else {
    const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id || 0)), 0);
    const newBankId = maxId + 1;
    const openingAmount = Number(updatedData.opening_balance ?? 0);

    rows.unshift({
      id: newBankId,
      account_name: updatedData.account_name,
      account_number: updatedData.account_number,
      balance: openingAmount,
      status: updatedData.status ?? 'active',
    });

    // Create opening balance transaction record
    const txRows = loadTransactions();
    const maxTxId = txRows.reduce((m, r) => Math.max(m, Number(r.id || 0)), 0);
    // Opening balance is a credit (money into bank)
    txRows.unshift({
      id: maxTxId + 1,
      bank_id: newBankId,
      bank_account_name: updatedData.account_name,
      type: 'deposit',
      amount: openingAmount,
      debit: 0,
      credit: openingAmount,
      remark: t('opening_balance'),
      created_at: new Date().toISOString(),
    });
    saveTransactions(txRows);

    handleMessage(t, 'bank_created_successfully', 'success');
  }

  allRows.value = rows;
  saveBanks(rows);
  closeModal();
  applyFiltersAndPaginate();
};
//#endregion
</script>
