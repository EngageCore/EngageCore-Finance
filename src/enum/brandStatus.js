export const brandStatusEnum = Object.freeze({
  Active: { id: 1, name: 'active', tagType: 'success' },
  Inactive: { id: 2, name: 'inactive', tagType: 'error' },
});

export const getBrandStatusNameById = (id) => {
  const item = Object.values(brandStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getBrandStatusById = (id) => {
  const item = Object.values(brandStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getBrandStatusTagTypeById = (id) => {
  const item = Object.values(brandStatusEnum).find(x => x.id == id);
  return item ? item.tagType : 'default';
};