export const bankProviderStatusEnum = Object.freeze({
  Active: { id: 1, name: 'active', tagType: 'success' },
  Inactive: { id: 2, name: 'inactive', tagType: 'error' },
});

export const getBankProviderStatusNameById = (id) => {
  const item = Object.values(bankProviderStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getBankProviderStatusById = (id) => {
  const item = Object.values(bankProviderStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getBankProviderStatusTagTypeById = (id) => {
  const item = Object.values(bankProviderStatusEnum).find(x => x.id == id);
  return item ? item.tagType : 'default';
};