<template>
  <div>
    <DynamicSearchForm
      :fields="fields"
      :initialData="initialData"
      :showAddButton="true"
      @submit="handleSearch"
      @add="handleAdd"
      @reset="handleReset"
    />

    <ReusableTable
      :title="$t('transaction_list')"
      :headers="tableHeaders"
      :data="tableData"
      :offset="offset"
      :limit="limit"
      :totalRows="totalRows"
      @pagination="handlePaginate"
      @sort="handleSort"
    >
      <template #type="{ row }">
        <span class="badge" :class="row.type === 'deposit' ? 'bg-success' : 'bg-warning text-dark'">
          {{ row.type === 'deposit' ? $t('deposit') : $t('withdrawal') }}
        </span>
      </template>
    </ReusableTable>
  </div>

  <TransactionModal
    v-if="isModalVisible"
    :isVisible="isModalVisible"
    :formTitle="formTitle"
    :formData="formData"
    :banks="banks"
    @closeModal="closeModal"
    @saveChanges="handleSave"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DynamicSearchForm from '@/components/DynamicSearchForm.vue';
import ReusableTable from '@/components/ReusableTable.vue';
import TransactionModal from '@/components/Modal/TransactionModal.vue';
import { handleMessage } from '@/utils/notification';
import banksSeed from '@/mock/banks.json';
import transactionsSeed from '@/mock/transactions.json';

const { t } = useI18n();

const BANKS_STORAGE_KEY = 'mock_banks';
const TX_STORAGE_KEY = 'mock_transactions';

const loadJsonArrayFromStorage = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // ignore
    }
  }
  return Array.isArray(fallback) ? fallback : [];
};

const saveJsonArrayToStorage = (key, rows) => {
  localStorage.setItem(key, JSON.stringify(rows));
};

// Banks list (used for select + balance updates)
const banks = ref([]);

// Search form
const initialData = reactive({
  bank_id: '',
  type: '',
});

const bankOptions = computed(() => [
  { value: '', label: t('all') },
  ...banks.value.map((b) => ({
    value: b.id,
    label: `${b.account_name} (${b.account_number})`,
  })),
]);

const typeOptions = computed(() => [
  { value: '', label: t('all') },
  { value: 'deposit', label: t('deposit') },
  { value: 'withdrawal', label: t('withdrawal') },
]);

const fields = reactive([
  { id: 'bank_id', label: 'bank', type: 'select', options: bankOptions, colClass: 'col-md-3 col-sm-6' },
  { id: 'type', label: 'type', type: 'select', options: typeOptions, colClass: 'col-md-3 col-sm-6' },
]);

const handleSearch = (payload) => {
  Object.assign(initialData, payload);
  offset.value = 0;
  applyFiltersAndPaginate();
};

const handleReset = () => {
  Object.keys(initialData).forEach((k) => delete initialData[k]);
  Object.assign(initialData, { bank_id: '', type: '' });
  applyFiltersAndPaginate();
};

// Table
const offset = ref(0);
const limit = ref(10);
const totalRows = ref(0);
const tableData = ref([]);
const allRows = ref([]);

const tableHeaders = ref([
  { label: 'bank', key: 'bank_account_name', sortable: false },
  { label: 'type', key: 'type', sortable: false },
  { label: 'debit', key: 'debit', sortable: false },
  { label: 'credit', key: 'credit', sortable: false },
  { label: 'remark', key: 'remark', sortable: false },
]);

const applyFiltersAndPaginate = () => {
  const bankId = initialData.bank_id ? Number(initialData.bank_id) : '';
  const type = initialData.type || '';

  let filtered = allRows.value.slice();
  if (bankId) filtered = filtered.filter((r) => Number(r.bank_id) === bankId);
  if (type) filtered = filtered.filter((r) => r.type === type);

  totalRows.value = filtered.length;
  tableData.value = filtered.slice(offset.value, offset.value + limit.value);
};

const handlePaginate = ({ offset: newOffset, limit: newLimit }) => {
  offset.value = newOffset;
  limit.value = newLimit;
  applyFiltersAndPaginate();
};

const handleSort = ({ key, order }) => {
  void key;
  void order;
};

const handleView = (row) => {
  // Keep simple for now; could add view modal later
  handleMessage(t, `${t('transaction')}: ${row.bank_account_name} • ${row.type} • ${row.amount}`, 'info');
};

// Modal
const isModalVisible = ref(false);
const formTitle = ref('');
const formData = reactive({
  id: 0,
  bank_id: 0,
  type: '',
  amount: 0,
  remark: '',
});

const handleAdd = () => {
  document.body.classList.add('no-scroll');
  formTitle.value = t('add_transaction');
  Object.assign(formData, { id: 0, bank_id: 0, type: '', amount: 0, remark: '' });
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  document.body.classList.remove('no-scroll');
};

const handleSave = (payload) => {
  const txRows = allRows.value.slice();
  const maxId = txRows.reduce((m, r) => Math.max(m, Number(r.id || 0)), 0);

  const bank = banks.value.find((b) => Number(b.id) === Number(payload.bank_id));
  if (!bank) {
    handleMessage(t, t('bank_is_required'), 'error');
    return;
  }

  const amount = Number(payload.amount || 0);
  const type = payload.type;

  // For deposit -> credit, withdrawal -> debit
  const debit = type === 'withdrawal' ? amount : 0;
  const credit = type === 'deposit' ? amount : 0;

  txRows.unshift({
    id: maxId + 1,
    bank_id: bank.id,
    bank_account_name: bank.account_name,
    type,
    amount,
    debit,
    credit,
    remark: payload.remark || '',
    created_at: new Date().toISOString(),
  });

  // Update bank balances in storage
  const nextBanks = banks.value.map((b) => {
    if (Number(b.id) !== Number(bank.id)) return b;
    const current = Number(b.balance || 0);
    const next = type === 'deposit' ? current + amount : current - amount;
    return { ...b, balance: next };
  });

  banks.value = nextBanks;
  saveJsonArrayToStorage(BANKS_STORAGE_KEY, nextBanks);

  allRows.value = txRows;
  saveJsonArrayToStorage(TX_STORAGE_KEY, txRows);

  handleMessage(t, 'transaction_created_successfully', 'success');
  closeModal();
  applyFiltersAndPaginate();
};

onMounted(() => {
  banks.value = loadJsonArrayFromStorage(BANKS_STORAGE_KEY, banksSeed);
  allRows.value = loadJsonArrayFromStorage(TX_STORAGE_KEY, transactionsSeed);
  applyFiltersAndPaginate();
});
</script>

