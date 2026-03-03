import { ref } from 'vue';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallApi } from '@/hooks/useCallApi';
import { useApiError } from '@/composables/useApiError';
import { useI18n } from 'vue-i18n';
import { roleStatusEnum } from '@/enum/roleStatus';

export function useDropdown() {
  const authStore = useAuthStore();
  const { t } = useI18n();
  const { callApi } = useCallApi();
  const { handleApiError } = useApiError();

  const roleStatusOptions = ref([]);

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

  return {
    roleStatusOptions,
    getRoleStatusOptions,
  };
}