import { ref } from 'vue';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallApi } from '@/hooks/useCallApi';
import { useApiError } from '@/composables/useApiError';
import { useI18n } from 'vue-i18n';
import { roleStatusEnum } from '@/enum/roleStatus';
import { userStatusEnum } from '@/enum/userStatus';
import { brandStatusEnum } from '@/enum/brandStatus';

export function useDropdown() {
  const authStore = useAuthStore();
  const { t } = useI18n();
  const { callApi } = useCallApi();
  const { handleApiError } = useApiError();

  const roleStatusOptions = ref([]);
  const roleOptions = ref([]);
  const userStatusOptions = ref([]);
  const brandStatusOptions = ref([]);

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

  const getRoleOptions = async (includeAll = true) => {
    const resp = await callApi('/role', 'GET');

    let options = resp.roleList.map(item => ({
      label: item.name,
      value: item.id
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

  return {
    roleStatusOptions,
    getRoleStatusOptions,
    roleOptions,
    getRoleOptions,
    userStatusOptions,
    getUserStatusOptions,
    brandStatusOptions,
    getBrandStatusOptions,
  };
}