import { transformRecordToOption } from '@/utils/common';

export const GLOBAL_HEADER_MENU_ID = '__GLOBAL_HEADER_MENU__';

export const GLOBAL_SIDER_MENU_ID = '__GLOBAL_SIDER_MENU__';

export const themeSchemaRecord = {
  light: 'light',
  dark: 'dark',
  auto: 'follow_system'
};

export const themeSchemaOptions = transformRecordToOption(themeSchemaRecord);

export const loginModuleRecord = {
  'pwd-login': 'password_login',
  'code-login': 'verification_code_login',
  register: 'register',
  'reset-pwd': 'reset_password',
  'bind-wechat': 'bind_wechat'
};

export const themeLayoutModeRecord = {
  vertical: 'vertical_menu_mode',
  'vertical-mix': 'vertical_mix_menu_mode',
  horizontal: 'horizontal_menu_mode',
  'horizontal-mix': 'horizontal_mix_menu_mode'
};

export const themeLayoutModeOptions = transformRecordToOption(themeLayoutModeRecord);

export const themeScrollModeRecord = {
  wrapper: 'wrapper',
  content: 'content'
};

export const themeScrollModeOptions = transformRecordToOption(themeScrollModeRecord);

export const themeTabModeRecord = {
  chrome: 'chrome',
  button: 'button'
};

export const themeTabModeOptions = transformRecordToOption(themeTabModeRecord);

export const themePageAnimationModeRecord = {
  'fade-slide': 'fade_slide',
  fade: 'fade',
  'fade-bottom': 'fade_bottom',
  'fade-scale': 'fade_scale',
  'zoom-fade': 'zoom_fade',
  'zoom-out': 'zoom_out',
  none: 'none'
};

export const themePageAnimationModeOptions = transformRecordToOption(themePageAnimationModeRecord);

export const resetCacheStrategyRecord = {
  close: 'close_page',
  refresh: 'refresh_page'
};

export const resetCacheStrategyOptions = transformRecordToOption(resetCacheStrategyRecord);

export const DARK_CLASS = 'dark';
