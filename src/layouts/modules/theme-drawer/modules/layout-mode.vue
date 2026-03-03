<script setup>
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore } from '@/store/useThemeStore';
import { $t } from '@/locales';
import LayoutModeCard from '../components/layout-mode-card.vue';
import SettingItem from '../components/setting-item.vue';

defineOptions({
  name: 'LayoutMode'
});

const appStore = useAppStore();
const themeStore = useThemeStore();

function handleReverseHorizontalMixChange(value) {
  themeStore.setLayoutReverseHorizontalMix(value);
}
</script>

<template>
  <NDivider>{{ $t('layout_mode') }}</NDivider>
  <LayoutModeCard v-model:mode="themeStore.layout.mode" :disabled="appStore.isMobile">
    <template #vertical>
      <div class="layout-sider h-full w-18px"></div>
      <div class="vertical-wrapper">
        <div class="layout-header"></div>
        <div class="layout-main"></div>
      </div>
    </template>
    <template #vertical-mix>
      <div class="layout-sider h-full w-8px"></div>
      <div class="layout-sider h-full w-16px"></div>
      <div class="vertical-wrapper">
        <div class="layout-header"></div>
        <div class="layout-main"></div>
      </div>
    </template>
    <template #horizontal>
      <div class="layout-header"></div>
      <div class="horizontal-wrapper">
        <div class="layout-main"></div>
      </div>
    </template>
    <template #horizontal-mix>
      <div class="layout-header"></div>
      <div class="horizontal-wrapper">
        <div class="layout-sider w-18px"></div>
        <div class="layout-main"></div>
      </div>
    </template>
  </LayoutModeCard>
  <SettingItem
    v-if="themeStore.layout.mode === 'horizontal-mix'"
    :label="$t('reverse_horizontal_mix')"
    class="mt-16px"
  >
    <NSwitch :value="themeStore.layout.reverseHorizontalMix" @update:value="handleReverseHorizontalMixChange" />
  </SettingItem>
</template>

<style scoped>
.layout-header {
  --uno: h-16px bg-primary rd-4px;
}

.layout-sider {
  --uno: bg-primary-300 rd-4px;
}

.layout-main {
  --uno: flex-1 bg-primary-200 rd-4px;
}

.vertical-wrapper {
  --uno: flex-1 flex-col gap-6px;
}

.horizontal-wrapper {
  --uno: flex-1 flex gap-6px;
}
</style>
