export const counterPartyStatusEnum = Object.freeze({
  Active: { id: 1, name: 'active', tagType: 'success' },
  Inactive: { id: 2, name: 'inactive', tagType: 'error' },
});

export const getCounterPartyStatusNameById = (id) => {
  const item = Object.values(counterPartyStatusEnum).find((x) => x.id == id);
  return item ? item.name : 'unknown';
};

export const getCounterPartyStatusById = (id) => {
  const item = Object.values(counterPartyStatusEnum).find((x) => x.id == id);
  return item ? item.name : 'unknown';
};

export const getCounterPartyStatusTagTypeById = (id) => {
  const item = Object.values(counterPartyStatusEnum).find((x) => x.id == id);
  return item ? item.tagType : 'default';
};

