import { useI18n } from 'vue-i18n';
import { handleMessage } from '@/utils/common';

export function useApiError() {
  const { t } = useI18n();

  function handleApiError(error) {
    if (error.response && error.response.data && error.response.data.code) {
      handleMessage(t(`error_${error.response.data.code}`), 'error');
    } else {
      handleMessage(t('unknown_error_occurred'), 'error');
    }
  }

  return {
    handleApiError
  };
}
