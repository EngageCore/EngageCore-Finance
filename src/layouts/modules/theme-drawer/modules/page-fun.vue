<script setup>
import { computed } from 'vue';
import {
  resetCacheStrategyOptions,
  themePageAnimationModeOptions,
  themeScrollModeOptions,
  themeTabModeOptions
} from '@/constants/app';
import { useThemeStore } from '@/store/useThemeStore';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import SettingItem from '../components/setting-item.vue';

defineOptions({
  name: 'PageFun'
});

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);

const isMixLayoutMode = computed(() => layoutMode.value.includes('mix'));

const isWrapperScrollMode = computed(() => themeStore.layout.scrollMode === 'wrapper');
</script>

<template>
  <NDivider>{{ $t('page_function') }}</NDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <SettingItem key="0" :label="$t('reset_cache_strategy')">
      <NSelect
        v-model:value="themeStore.resetCacheStrategy"
        :options="translateOptions(resetCacheStrategyOptions)"
        size="small"
        class="w-120px"
      />
    </SettingItem>
    <SettingItem key="1" :label="$t('scroll_mode')">
      <NSelect
        v-model:value="themeStore.layout.scrollMode"
        :options="translateOptions(themeScrollModeOptions)"
        size="small"
        class="w-120px"
      />
    </SettingItem>
    <SettingItem key="1-1" :label="$t('page_animate')">
      <NSwitch v-model:value="themeStore.page.animate" />
    </SettingItem>
    <SettingItem v-if="themeStore.page.animate" key="1-2" :label="$t('page_animate_mode')">
      <NSelect
        v-model:value="themeStore.page.animateMode"
        :options="translateOptions(themePageAnimationModeOptions)"
        size="small"
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="isWrapperScrollMode" key="2" :label="$t('fixed_header_and_tab')">
      <NSwitch v-model:value="themeStore.fixedHeaderAndTab" />
    </SettingItem>
    <SettingItem key="3" :label="$t('header_height')">
      <NInputNumber v-model:value="themeStore.header.height" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem key="4" :label="$t('breadcrumb_visible')">
      <NSwitch v-model:value="themeStore.header.breadcrumb.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.header.breadcrumb.visible" key="4-1" :label="$t('breadcrumb_icon_visible')">
      <NSwitch v-model:value="themeStore.header.breadcrumb.showIcon" />
    </SettingItem>
    <SettingItem key="5" :label="$t('tab_visible')">
      <NSwitch v-model:value="themeStore.tab.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="5-1" :label="$t('tag_bar_info_cache')">
      <NSwitch v-model:value="themeStore.tab.cache" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="5-2" :label="$t('tab_height')">
      <NInputNumber v-model:value="themeStore.tab.height" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="5-3" :label="$t('tab_mode')">
      <NSelect
        v-model:value="themeStore.tab.mode"
        :options="translateOptions(themeTabModeOptions)"
        size="small"
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="layoutMode === 'vertical'" key="6-1" :label="$t('sider_width')">
      <NInputNumber v-model:value="themeStore.sider.width" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem v-if="layoutMode === 'vertical'" key="6-2" :label="$t('sider_collapsed_width')">
      <NInputNumber v-model:value="themeStore.sider.collapsedWidth" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem v-if="isMixLayoutMode" key="6-3" :label="$t('mix_sider_width')">
      <NInputNumber v-model:value="themeStore.sider.mixWidth" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem v-if="isMixLayoutMode" key="6-4" :label="$t('mix_collapsed_width')">
      <NInputNumber v-model:value="themeStore.sider.mixCollapsedWidth" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem v-if="layoutMode === 'vertical-mix'" key="6-5" :label="$t('mix_child_menu_width')">
      <NInputNumber v-model:value="themeStore.sider.mixChildMenuWidth" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem key="7" :label="$t('footer_visible')">
      <NSwitch v-model:value="themeStore.footer.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.footer.visible && isWrapperScrollMode" key="7-1" :label="$t('footer_fixed')">
      <NSwitch v-model:value="themeStore.footer.fixed" />
    </SettingItem>
    <SettingItem v-if="themeStore.footer.visible" key="7-2" :label="$t('footer_height')">
      <NInputNumber v-model:value="themeStore.footer.height" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem
      v-if="themeStore.footer.visible && layoutMode === 'horizontal-mix'"
      key="7-3"
      :label="$t('right_footer')"
    >
      <NSwitch v-model:value="themeStore.footer.right" />
    </SettingItem>
    <SettingItem key="8" :label="$t('watermark_full_screen_visible')">
      <NSwitch v-model:value="themeStore.watermark.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.watermark.visible" key="8-1" :label="$t('enable_user_name_watermark')">
      <NSwitch v-model:value="themeStore.watermark.enableUserName" />
    </SettingItem>
    <SettingItem v-if="themeStore.watermark.visible" key="8-2" :label="$t('watermark_text')">
      <NInput
        v-model:value="themeStore.watermark.text"
        autosize
        type="text"
        size="small"
        class="w-120px"
        placeholder="EngageFinance"
      />
    </SettingItem>
    <SettingItem key="9" :label="$t('display_multilingual_button')">
      <NSwitch v-model:value="themeStore.header.multilingual.visible" />
    </SettingItem>
    <SettingItem key="10" :label="$t('display_globalsearch_button')">
      <NSwitch v-model:value="themeStore.header.globalSearch.visible" />
    </SettingItem>
  </TransitionGroup>
</template>

<style scoped>
.setting-list-move,
.setting-list-enter-active,
.setting-list-leave-active {
  --uno: transition-all-300;
}

.setting-list-enter-from,
.setting-list-leave-to {
  --uno: opacity-0 -translate-x-30px;
}

.setting-list-leave-active {
  --uno: absolute;
}
</style>
