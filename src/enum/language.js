export const languageEnum = Object.freeze({
  English: { id: 1, name: 'english', shortName: 'EN' },
  SimplfiedChinese: { id: 2, name: 'simplified_chinese', shortName: 'CN' },
  Malay: { id: 3, name: 'malay', shortName: 'BM' },
});

export const getLanguageNameById = (id) => {
  const item = Object.values(languageEnum).find(x => x.id == id);
  return item ? item.name : 'unknown';
};

export const getLanguageShortNameById = (id) => {
  const item = Object.values(languageEnum).find(x => x.id == id);
  return item ? item.shortName : 'unknown';
};
