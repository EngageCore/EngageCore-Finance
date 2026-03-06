import { ref } from 'vue';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallApi } from '@/hooks/useCallApi';
import { useApiError } from '@/composables/useApiError';
import { useI18n } from 'vue-i18n';
import { roleStatusEnum } from '@/enum/roleStatus';
import { userStatusEnum } from '@/enum/userStatus';
import { brandStatusEnum } from '@/enum/brandStatus';
import { bankProviderStatusEnum } from '@/enum/bankProviderStatus';
import { counterPartyTypeEnum } from '@/enum/counterPartyType';
import { counterPartyStatusEnum } from '@/enum/counterPartyStatus';
import { transactionTypeEnum } from '@/enum/transactionType';

export function useDropdown() {
  const authStore = useAuthStore();
  const { t } = useI18n();
  const { callApi } = useCallApi();
  const { handleApiError } = useApiError();

  const roleStatusOptions = ref([]);
  const roleOptions = ref([]);
  const userStatusOptions = ref([]);
  const brandStatusOptions = ref([]);
  const bankProviderStatusOptions = ref([]);
  const counterPartyTypeOptions = ref([]);
  const brandOptions = ref([]);
  const bankProviderOptions = ref([]);
  const counterPartyStatusOptions = ref([]);
  const transactionTypeOptions = ref([]);
  const bankOptions = ref([]);
  const memberOptions = ref([]);
  const counterPartyOptions = ref([]);

  const getRoleStatusOptions = async (includeAll = true) => {
    let options = Object.values(roleStatusEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    roleStatusOptions.value = options;
  }

  const getRoleOptions = async (includeAll = true, disableInactive = false) => {
    const resp = await callApi('/role', 'GET', null);

    let options = resp.roleList.map(item => ({
      label: item.name,
      value: item.id,
      disabled: disableInactive && item.statusId === 2
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    roleOptions.value = options;
  }

  const getUserStatusOptions = async (includeAll = true) => {
    let options = Object.values(userStatusEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    userStatusOptions.value = options;
  }

  const getBrandStatusOptions = async (includeAll = true) => {
    let options = Object.values(brandStatusEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    brandStatusOptions.value = options;
  }

  const getBankProviderStatusOptions = async (includeAll = true) => {
    let options = Object.values(bankProviderStatusEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    bankProviderStatusOptions.value = options;
  }

  const getCounterPartyTypeOptions = async (includeAll = true) => {
    let options = Object.values(counterPartyTypeEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    counterPartyTypeOptions.value = options;
  }

  const getBrandOptions = async (includeAll = true, disableInactive = false) => {
    const resp = await callApi('/brand', 'GET');
    let options = resp.brandList.map(item => ({
      label: item.name,
      value: item.id,
      disabled: disableInactive && item.statusId === 2
    }));
    
    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    brandOptions.value = options;
  }

  const getBankProviderOptions = async (includeAll = true, disableInactive = false) => {
    const resp = await callApi('/bankProvider', 'GET');
    let options = (resp.bankProviderList || []).map(item => ({
      label: item.name,
      value: item.id,
      disabled: disableInactive && item.statusId === 2
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    bankProviderOptions.value = options;
  }

  const getCounterPartyStatusOptions = async (includeAll = true) => {
    let options = Object.values(counterPartyStatusEnum).map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    counterPartyStatusOptions.value = options;
  }

  const getTransactionTypeOptions = async (includeAll = true) => {
    let items = Object.values(transactionTypeEnum).filter(item => item.id !== 9);

    let options = items.map(item => ({
      label: t(item.name),
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    transactionTypeOptions.value = options;
  }

  const getBankOptions = async (includeAll = true, params = {}) => {
    const resp = await callApi('/bank', 'GET', params);
    let options = (resp.bankList || []).map(item => ({
      label: `${item.bankProviderName} - ${item.accountName} (${item.accountNumber})`,
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    bankOptions.value = options;
  }

  const getMemberOptions = async (includeAll = true) => {
    const resp = await callApi('/member', 'GET');
    let options = (resp.memberList || []).map(item => ({
      label: item.name,
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    memberOptions.value = options;
  }

  const getCounterPartyOptions = async (includeAll = true) => {
    const resp = await callApi('/counterParty', 'GET');
    let options = (resp.counterPartyList || []).map(item => ({
      label: item.name,
      value: item.id
    }));

    if (includeAll) {
      options.unshift({
        label: t('all'),
        value: 0
      });
    }

    counterPartyOptions.value = options;
  }

  return {
    roleStatusOptions,
    getRoleStatusOptions,
    roleOptions,
    getRoleOptions,
    userStatusOptions,
    getUserStatusOptions,
    brandStatusOptions,
    getBrandStatusOptions,
    bankProviderStatusOptions,
    getBankProviderStatusOptions,
    counterPartyTypeOptions,
    getCounterPartyTypeOptions,
    brandOptions,
    getBrandOptions,
    bankProviderOptions,
    getBankProviderOptions,
    counterPartyStatusOptions,
    getCounterPartyStatusOptions,
    transactionTypeOptions,
    getTransactionTypeOptions,
    bankOptions,
    getBankOptions,
    memberOptions,
    getMemberOptions,
    counterPartyOptions,
    getCounterPartyOptions,
  };
}