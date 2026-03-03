export const userStatusEnum = Object.freeze({
  Active: { id: 1, name: 'active', tagType: 'success' },
  Inactive: { id: 2, name: 'inactive', tagType: 'error' },
});

export const getUserNameById = (id) => {
  const item = Object.values(userStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getUserIdById = (id) => {
  const item = Object.values(userStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getUserTagTypeById = (id) => {
  const item = Object.values(userStatusEnum).find(x => x.id == id);
  return item ? item.tagType : 'default';
};