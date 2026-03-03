import { localStg } from '@/utils/storage';
import i18n from '@/i18n';

const localeMap = {
  'en-US': 'en_US',
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW'
};

function normalizeLocale(lang) {
  return localeMap[lang] || lang;
}

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app) {
  app.use(i18n);
  const current = localStg.get('lang') || 'en-US';
  const mapped = normalizeLocale(current);
  i18n.global.locale.value = mapped;
  localStorage.setItem('language', mapped);
}

export const $t = i18n.global.t;

export function setLocale(locale) {
  const mapped = normalizeLocale(locale);
  i18n.global.locale.value = mapped;
  localStorage.setItem('language', mapped);
}
