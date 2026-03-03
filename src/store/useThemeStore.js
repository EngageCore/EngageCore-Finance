import { computed, effectScope, onScopeDispose, ref, toRefs, watch } from 'vue';
import { useEventListener, usePreferredColorScheme } from '@vueuse/core';
import { defineStore } from 'pinia';
import { defu } from 'defu';
import { addColorAlpha, getColorPalette, getPaletteColorByNumber, getRgb } from '@sa/color';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { DARK_CLASS } from '@/constants/app';
import { toggleHtmlClass } from '@/utils/common';
import { overrideThemeSettings, themeSettings } from '@/theme/settings';
import { themeVars } from '@/theme/vars';

function initThemeSettings() {
  const isProd = import.meta.env.PROD;
  if (!isProd) return themeSettings;
  const localSettings = localStg.get('themeSettings');
  let settings = defu(localSettings, themeSettings);
  const isOverride = localStg.get('overrideThemeFlag') === BUILD_TIME;
  if (!isOverride) {
    settings = defu(overrideThemeSettings, settings);
    localStg.set('overrideThemeFlag', BUILD_TIME);
  }
  return settings;
}

function getCssVarByTokens(tokens) {
  if (!tokens || typeof tokens !== 'object') return '';
  const styles = [];
  function removeVarPrefix(value) { return value.replace('var(', '').replace(')', ''); }
  function removeRgbPrefix(value) { return value.replace('rgb(', '').replace(')', ''); }
  for (const [key, tokenValues] of Object.entries(themeVars)) {
    if (!tokens[key] || typeof tokens[key] !== 'object') continue;
    for (const [tokenKey, tokenValue] of Object.entries(tokenValues)) {
      let cssVarsKey = removeVarPrefix(tokenValue);
      let cssValue = tokens[key][tokenKey];
      if (cssValue && key === 'colors') {
        cssVarsKey = removeRgbPrefix(cssVarsKey);
        const { r, g, b } = getRgb(cssValue);
        cssValue = `${r} ${g} ${b}`;
      }
      if (cssValue) styles.push(`${cssVarsKey}: ${cssValue}`);
    }
  }
  return styles.join(';');
}

function addThemeVarsToGlobal(tokens, darkTokens) {
  const cssVarStr = getCssVarByTokens(tokens);
  const darkCssVarStr = getCssVarByTokens(darkTokens);
  const css = `
    :root {
      ${cssVarStr}
    }
  `;
  const darkCss = `
    html.${DARK_CLASS} {
      ${darkCssVarStr}
    }
  `;
  const styleId = 'theme-vars';
  const style = document.querySelector(`#${styleId}`) || document.createElement('style');
  style.id = styleId;
  style.textContent = css + darkCss;
  document.head.appendChild(style);
}

function toggleCssDarkMode(darkMode = false) {
  const { add, remove } = toggleHtmlClass(DARK_CLASS);
  if (darkMode) add(); else remove();
}

function toggleAuxiliaryColorModes(grayscaleMode = false, colourWeakness = false) {
  const htmlElement = document.documentElement;
  htmlElement.style.filter = [grayscaleMode ? 'grayscale(100%)' : '', colourWeakness ? 'invert(80%)' : '']
    .filter(Boolean)
    .join(' ');
}

function createThemeToken(colors, tokens, recommended = false) {
  const paletteColors = createThemePaletteColors(colors, recommended);
  const { light, dark } = tokens || themeSettings.tokens;
  const themeTokens = {
    colors: { ...paletteColors, nprogress: paletteColors.primary, ...light.colors },
    boxShadow: { ...light.boxShadow }
  };
  const darkThemeTokens = {
    colors: { ...themeTokens.colors, ...dark?.colors },
    boxShadow: { ...themeTokens.boxShadow, ...dark?.boxShadow }
  };
  return { themeTokens, darkThemeTokens };
}

function createThemePaletteColors(colors, recommended = false) {
  const colorKeys = Object.keys(colors);
  const colorPaletteVar = {};
  colorKeys.forEach(key => {
    const colorMap = getColorPalette(colors[key], recommended);
    colorPaletteVar[key] = colorMap.get(500);
    colorMap.forEach((hex, number) => { colorPaletteVar[`${key}-${number}`] = hex; });
  });
  return colorPaletteVar;
}

function getNaiveThemeColors(colors, recommended = false) {
  const colorActions = [
    { scene: '', handler: color => color },
    { scene: 'Suppl', handler: color => color },
    { scene: 'Hover', handler: color => getPaletteColorByNumber(color, 500, recommended) },
    { scene: 'Pressed', handler: color => getPaletteColorByNumber(color, 700, recommended) },
    { scene: 'Active', handler: color => addColorAlpha(color, 0.1) }
  ];
  const themeColors = {};
  const colorEntries = Object.entries(colors);
  colorEntries.forEach(color => {
    colorActions.forEach(action => {
      const [colorType, colorValue] = color;
      const colorKey = `${colorType}Color${action.scene}`;
      themeColors[colorKey] = action.handler(colorValue);
    });
  });
  return themeColors;
}

function getNaiveTheme(colors, recommended = false, darkMode = false) {
  const { primary: colorLoading } = colors;
  const cardColor = darkMode ? 'rgb(24, 32, 44)' : 'rgb(252, 253, 255)';
  const bodyColor = darkMode ? 'rgb(24, 32, 44)' : 'rgb(248, 250, 253)';
  const borderColor = darkMode ? 'rgba(143, 165, 191, 0.24)' : 'rgba(15, 23, 42, 0.1)';
  const theme = {
    common: {
      ...getNaiveThemeColors(colors, recommended),
      borderRadius: '8px',
      borderRadiusSmall: '6px',
      fontWeightStrong: '600',
      cardColor,
      modalColor: cardColor,
      popoverColor: cardColor,
      tableColor: bodyColor,
      bodyColor,
      actionColor: darkMode ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
      hoverColor: darkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.06)',
      borderColor
    },
    LoadingBar: { colorLoading },
    Tag: { borderRadius: '6px' },
    Card: {
      borderRadius: '10px',
      borderColor,
      boxShadow: darkMode ? '0 8px 24px rgba(2, 8, 20, 0.35)' : '0 6px 20px rgba(15, 23, 42, 0.08)'
    }
  };
  return theme;
}

export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  const scope = effectScope();
  const osTheme = usePreferredColorScheme();

  const settings = ref(initThemeSettings());

  const darkMode = computed(() => {
    if (settings.value.themeScheme === 'auto') {
      return osTheme.value === 'dark';
    }
    return settings.value.themeScheme === 'dark';
  });

  const grayscaleMode = computed(() => settings.value.grayscale);
  const colourWeaknessMode = computed(() => settings.value.colourWeakness);

  const themeColors = computed(() => {
    const { themeColor, otherColor, isInfoFollowPrimary } = settings.value;
    const colors = {
      primary: themeColor,
      ...otherColor,
      info: isInfoFollowPrimary ? themeColor : otherColor.info
    };
    return colors;
  });

  const naiveTheme = computed(() => getNaiveTheme(themeColors.value, settings.value.recommendColor, darkMode.value));

  const settingsJson = computed(() => JSON.stringify(settings.value));

  function resetStore() {
    const themeStore = useThemeStore();
    themeStore.$reset();
  }

  function setThemeScheme(themeScheme) { settings.value.themeScheme = themeScheme; }
  function setGrayscale(isGrayscale) { settings.value.grayscale = isGrayscale; }
  function setColourWeakness(isColourWeakness) { settings.value.colourWeakness = isColourWeakness; }

  function toggleThemeScheme() {
    const themeSchemes = ['light', 'dark', 'auto'];
    const index = themeSchemes.findIndex(item => item === settings.value.themeScheme);
    const nextIndex = index === themeSchemes.length - 1 ? 0 : index + 1;
    const nextThemeScheme = themeSchemes[nextIndex];
    setThemeScheme(nextThemeScheme);
  }

  function updateThemeColors(key, color) {
    let colorValue = color;
    if (settings.value.recommendColor) {
      colorValue = getPaletteColorByNumber(color, 500, true);
    }
    if (key === 'primary') {
      settings.value.themeColor = colorValue;
    } else {
      settings.value.otherColor[key] = colorValue;
    }
  }

  function setThemeLayout(mode) { settings.value.layout.mode = mode; }

  function setupThemeVarsToGlobal() {
    const { themeTokens, darkThemeTokens } = createThemeToken(
      themeColors.value,
      settings.value.tokens,
      settings.value.recommendColor
    );
    addThemeVarsToGlobal(themeTokens, darkThemeTokens);
  }

  function setLayoutReverseHorizontalMix(reverse) { settings.value.layout.reverseHorizontalMix = reverse; }

  function cacheThemeSettings() {
    const isProd = import.meta.env.PROD;
    if (!isProd) return;
    localStg.set('themeSettings', settings.value);
  }

  useEventListener(window, 'beforeunload', () => { cacheThemeSettings(); });

  scope.run(() => {
    watch(darkMode, val => { toggleCssDarkMode(val); localStg.set('darkMode', val); }, { immediate: true });
    watch([grayscaleMode, colourWeaknessMode], val => { toggleAuxiliaryColorModes(val[0], val[1]); }, { immediate: true });
    watch(themeColors, val => { setupThemeVarsToGlobal(); localStg.set('themeColor', val.primary); }, { immediate: true });
  });

  onScopeDispose(() => { scope.stop(); });

  return {
    ...toRefs(settings.value),
    darkMode,
    themeColors,
    naiveTheme,
    settingsJson,
    setGrayscale,
    setColourWeakness,
    resetStore,
    setThemeScheme,
    toggleThemeScheme,
    updateThemeColors,
    setThemeLayout,
    setLayoutReverseHorizontalMix
  };
});