export const roleStatusEnum = Object.freeze({
  Active: { id: 1, name: 'active', tagType: 'success' },
  Inactive: { id: 2, name: 'inactive', tagType: 'warning' },
});

export const getRoleStatusNameById = (id) => {
  const item = Object.values(roleStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getRoleStatusById = (id) => {
  const item = Object.values(roleStatusEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getRoleStatusTagTypeById = (id) => {
  const item = Object.values(roleStatusEnum).find(x => x.id == id);
  return item ? item.tagType : 'default';
};