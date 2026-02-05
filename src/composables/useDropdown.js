import { ref } from 'vue';
import { useCallApi } from '@/hooks/useCallApi';

const { callApi } = useCallApi();

export function useDropdown() {
  const brands = ref([]);
  const roles = ref([]);
  const promotions = ref([]);

  const loadBrands = async (includeAll = true, t) => {
    const resp = await callApi('/admin/brands', 'GET', null, { for_selection: true });

    let options = resp.brands.map((option) => ({
      value: option.id,
      label: option.name,
    }));
    if (includeAll) {
      options = [{ value: '', label: t('all') }, ...options];
    }
    brands.value = options;
  };

  const loadRoles = async (includeAll = true, t) => {
    const resp = await callApi('/admin/roles', 'GET', null, { for_selection: true });

    let options = resp.roles.map((option) => ({
      value: option.id,
      label: option.name,
    }));
    if (includeAll) {
      options = [{ value: '', label: t('all') }, ...options];
    }
    roles.value = options;
  };

  const loadPromotions = async (brandId, memberId = null, includeAll = true, t) => {
    const params = {};
    if (memberId) {
      params.memberId = memberId;
    }

    const resp = await callApi(`/admin/brands/${brandId}/promotions`, 'GET', null, params);

    let options = resp.promotions.map((option) => ({
      value: option.id,
      label: option.name || option.title || `Promotion ${option.id}`,
    }));
    if (includeAll) {
      options = [{ value: '', label: t('all') }, ...options];
    }
    promotions.value = options;
  };

  return {
    brands,
    roles,
    promotions,
    loadBrands,
    loadRoles,
    loadPromotions,
  };
}
