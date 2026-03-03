<script setup>
import { useThemeStore } from '@/store/useThemeStore';
import { $t } from '@/locales';
import SettingItem from '../components/setting-item.vue';

defineOptions({
  name: 'ThemeColor'
});

const themeStore = useThemeStore();

function handleUpdateColor(color, key) {
  themeStore.updateThemeColors(key, color);
}

const swatches = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#0ea5e9',
  '#06b6d4',
  '#f43f5e',
  '#ef4444',
  '#ec4899',
  '#d946ef',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981'
];
</script>

<template>
  <NDivider>{{ $t('theme_color') }}</NDivider>
  <div class="flex-col-stretch gap-12px">
    <NTooltip placement="top-start">
      <template #trigger>
        <SettingItem key="recommend-color" :label="$t('apply_recommended_color_algorithm')">
          <NSwitch v-model:value="themeStore.recommendColor" />
        </SettingItem>
      </template>
      <p>
        <span class="pr-12px">{{ $t('recommend_color_desc') }}</span>
        <br />
        <NButton
          text
          tag="a"
          href="https://uicolors.app/create"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray"
        >
          https://uicolors.app/create
        </NButton>
      </p>
    </NTooltip>
    <SettingItem v-for="(_, key) in themeStore.themeColors" :key="key" :label="$t(`${key}`)">
      <template v-if="key === 'info'" #suffix>
        <NCheckbox v-model:checked="themeStore.isInfoFollowPrimary">
          {{ $t('follow_primary') }}
        </NCheckbox>
      </template>
      <NColorPicker
        class="w-90px"
        :value="themeStore.themeColors[key]"
        :disabled="key === 'info' && themeStore.isInfoFollowPrimary"
        :show-alpha="false"
        :swatches="swatches"
        @update:value="handleUpdateColor($event, key)"
      />
    </SettingItem>
  </div>
</template>

<style scoped></style>
