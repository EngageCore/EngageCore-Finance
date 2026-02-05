import { useI18n } from 'vue-i18n';
import { handleMessage } from '@/utils/notification';

export function useApiError() {
  const { t } = useI18n();

  function handleApiError(error) {
    if (error.response && error.response.data && error.response.data.message) {
      handleMessage(t, `error_${error.response.data.code}`, 'error');
    } else {
      handleMessage(t, 'unknown_error_occurred', 'error');
    }
  }

  return {
    handleApiError
  };
}
