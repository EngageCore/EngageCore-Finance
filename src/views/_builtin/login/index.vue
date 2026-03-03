<script setup>
import { computed } from 'vue';
import { getPaletteColorByNumber, mixColor } from '@sa/color';
import { loginModuleRecord } from '@/constants/app';
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore } from '@/store/useThemeStore';
import { $t } from '@/locales';
import PwdLogin from './modules/pwd-login.vue';

/* 保留OTP功能代码以便未来需要时恢复 */
// 说明：OTP 功能已在子模块 pwd-login.vue 中以多行注释方式完整保留并禁用

const props = defineProps({
  module: {
    type: String,
    default: 'pwd-login'
  }
});

const appStore = useAppStore();
const themeStore = useThemeStore();

const moduleMap = {
  'pwd-login': { label: loginModuleRecord['pwd-login'], component: PwdLogin }
};

const activeModule = computed(() => moduleMap[props.module || 'pwd-login']);

const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor
);

const bgColor = computed(() => {
  const COLOR_WHITE = '#ffffff';

  const ratio = themeStore.darkMode ? 0.5 : 0.2;

  return mixColor(COLOR_WHITE, themeStore.themeColor, ratio);
});
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
    :style="{ backgroundColor: bgColor }"
  >
    <!-- Background Wave -->
    <WaveBg :theme-color="bgThemeColor" />

    <!-- Main Login Card -->
    <div class="relative z-10 max-w-md w-full">
      <NCard
        :bordered="false"
        class="overflow-hidden border-0 rounded-2xl bg-white shadow-xl dark:bg-gray-800"
      >
        <!-- Header Section -->
        <div class="px-6 pb-4 pt-6 text-center">
          <!-- Logo -->
          <div class="mb-4">
            <SystemLogo class="mx-auto text-3xl text-gray-800 dark:text-white" />
          </div>

          <!-- Title -->
          <div class="space-y-1">
            <h1 class="text-xl text-gray-900 font-bold dark:text-white">
              EngageFinance
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t(activeModule.label) }}
            </p>
          </div>

          <!-- Controls -->
          <div class="mt-4 flex items-center justify-center space-x-2">
            <ThemeSchemaSwitch
              :theme-schema="themeStore.themeScheme"
              :show-tooltip="false"
              class="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @switch="themeStore.toggleThemeScheme"
            />
            <LangSwitch
              v-if="themeStore.header.multilingual.visible"
              :lang="appStore.locale"
              :lang-options="appStore.localeOptions"
              :show-tooltip="false"
              class="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @change-lang="appStore.changeLocale"
            />
          </div>
        </div>

        <!-- Content Section -->
        <div class="px-6 pb-6">
          <!-- Welcome Message -->
          <div class="mb-4 text-center">
            <h2 class="mb-1 text-base text-gray-900 font-semibold dark:text-white">
              {{ $t('welcome_back') }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('welcome_back_description') }}
            </p>
          </div>

          <!-- Form Container -->
          <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <Transition :name="themeStore.page.animateMode" mode="out-in" appear>
              <component :is="activeModule.component" />
            </Transition>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>
