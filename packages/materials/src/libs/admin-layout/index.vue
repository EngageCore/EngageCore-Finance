<script setup>
import { computed } from 'vue';
import { LAYOUT_MAX_Z_INDEX, LAYOUT_SCROLL_EL_ID, createLayoutCssVars } from './shared';
import style from './index.module.css';

defineOptions({
  name: 'AdminLayout'
});

const props = defineProps({
  mode: {
    type: String,
    default: 'vertical'
  },
  scrollMode: {
    type: String,
    default: 'content'
  },
  scrollElId: {
    type: String,
    default: LAYOUT_SCROLL_EL_ID
  },
  commonClass: {
    type: String,
    default: 'transition-all-300'
  },
  fixedTop: {
    type: Boolean,
    default: true
  },
  maxZIndex: {
    type: Number,
    default: LAYOUT_MAX_Z_INDEX
  },
  headerVisible: {
    type: Boolean,
    default: true
  },
  headerHeight: {
    type: Number,
    default: 56
  },
  tabVisible: {
    type: Boolean,
    default: true
  },
  tabHeight: {
    type: Number,
    default: 48
  },
  siderVisible: {
    type: Boolean,
    default: true
  },
  siderCollapse: {
    type: Boolean,
    default: false
  },
  siderWidth: {
    type: Number,
    default: 220
  },
  siderCollapsedWidth: {
    type: Number,
    default: 64
  },
  footerVisible: {
    type: Boolean,
    default: true
  },
  footerHeight: {
    type: Number,
    default: 48
  },
  rightFooter: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  fullContent: {
    type: Boolean,
    default: false
  },
  fixedFooter: {
    type: Boolean,
    default: false
  },
  scrollWrapperClass: {
    type: String,
    default: ''
  },
  headerClass: {
    type: String,
    default: ''
  },
  tabClass: {
    type: String,
    default: ''
  },
  siderClass: {
    type: String,
    default: ''
  },
  mobileSiderClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  footerClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:siderCollapse']);

const slots = defineSlots();

const cssVars = computed(() => createLayoutCssVars(props));

// config visible
const showHeader = computed(() => Boolean(slots.header) && props.headerVisible);
const showTab = computed(() => Boolean(slots.tab) && props.tabVisible);
const showSider = computed(() => !props.isMobile && Boolean(slots.sider) && props.siderVisible);
const showMobileSider = computed(() => props.isMobile && Boolean(slots.sider) && props.siderVisible);
const showFooter = computed(() => Boolean(slots.footer) && props.footerVisible);

// scroll mode
const isWrapperScroll = computed(() => props.scrollMode === 'wrapper');
const isContentScroll = computed(() => props.scrollMode === 'content');

// layout direction
const isVertical = computed(() => props.mode === 'vertical');
const isHorizontal = computed(() => props.mode === 'horizontal');

const fixedHeaderAndTab = computed(() => props.fixedTop || (isHorizontal.value && isWrapperScroll.value));

// css
const leftGapClass = computed(() => {
  if (!props.fullContent && showSider.value) {
    return props.siderCollapse ? style['left-gap_collapsed'] : style['left-gap'];
  }

  return '';
});

const headerLeftGapClass = computed(() => (isVertical.value ? leftGapClass.value : ''));

const footerLeftGapClass = computed(() => {
  const condition1 = isVertical.value;
  const condition2 = isHorizontal.value && isWrapperScroll.value && !props.fixedFooter;
  const condition3 = Boolean(isHorizontal.value && props.rightFooter);

  if (condition1 || condition2 || condition3) {
    return leftGapClass.value;
  }

  return '';
});

const siderPaddingClass = computed(() => {
  let cls = '';

  if (showHeader.value && !headerLeftGapClass.value) {
    cls += style['sider-padding-top'];
  }
  if (showFooter.value && !footerLeftGapClass.value) {
    cls += ` ${style['sider-padding-bottom']}`;
  }

  return cls;
});

function handleClickMask() {
  emit('update:siderCollapse', true);
}
</script>

<template>
  <div class="relative h-full" :class="[commonClass]" :style="cssVars">
    <div
      :id="isWrapperScroll ? scrollElId : undefined"
      class="h-full flex flex-col"
      :class="[commonClass, scrollWrapperClass, { 'overflow-y-auto': isWrapperScroll }]"
    >
      <!-- Header -->
      <template v-if="showHeader">
        <header
          v-show="!fullContent"
          class="flex-shrink-0"
          :class="[
            style['layout-header'],
            commonClass,
            headerClass,
            headerLeftGapClass,
            { 'absolute top-0 left-0 w-full': fixedHeaderAndTab }
          ]"
        >
          <slot name="header"></slot>
        </header>
        <div
          v-show="!fullContent && fixedHeaderAndTab"
          class="flex-shrink-0 overflow-hidden"
          :class="[style['layout-header-placement']]"
        ></div>
      </template>

      <!-- Tab -->
      <template v-if="showTab">
        <div
          class="flex-shrink-0"
          :class="[
            style['layout-tab'],
            commonClass,
            tabClass,
            { 'top-0!': fullContent || !showHeader },
            leftGapClass,
            { 'absolute left-0 w-full': fixedHeaderAndTab }
          ]"
        >
          <slot name="tab"></slot>
        </div>
        <div
          v-show="fullContent || fixedHeaderAndTab"
          class="flex-shrink-0 overflow-hidden"
          :class="[style['layout-tab-placement']]"
        ></div>
      </template>

      <!-- Sider -->
      <template v-if="showSider">
        <aside
          v-show="!fullContent"
          class="absolute left-0 top-0 h-full"
          :class="[
            commonClass,
            siderClass,
            siderPaddingClass,
            siderCollapse ? style['layout-sider_collapsed'] : style['layout-sider']
          ]"
        >
          <slot name="sider"></slot>
        </aside>
      </template>

      <!-- Mobile Sider -->
      <template v-if="showMobileSider">
        <aside
          class="absolute left-0 top-0 h-full w-0 bg-white"
          :class="[
            commonClass,
            mobileSiderClass,
            style['layout-mobile-sider'],
            siderCollapse ? 'overflow-hidden' : style['layout-sider']
          ]"
        >
          <slot name="sider"></slot>
        </aside>
        <div
          v-show="!siderCollapse"
          class="absolute left-0 top-0 h-full w-full bg-[rgba(0,0,0,0.2)]"
          :class="[style['layout-mobile-sider-mask']]"
          @click="handleClickMask"
        ></div>
      </template>

      <!-- Main Content -->
      <main
        :id="isContentScroll ? scrollElId : undefined"
        class="flex flex-col flex-grow"
        :class="[commonClass, contentClass, leftGapClass, { 'overflow-y-auto': isContentScroll }]"
      >
        <slot></slot>
      </main>

      <!-- Footer -->
      <template v-if="showFooter">
        <footer
          v-show="!fullContent"
          class="flex-shrink-0"
          :class="[
            style['layout-footer'],
            commonClass,
            footerClass,
            footerLeftGapClass,
            { 'absolute left-0 bottom-0 w-full': fixedFooter }
          ]"
        >
          <slot name="footer"></slot>
        </footer>
        <div
          v-show="!fullContent && fixedFooter"
          class="flex-shrink-0 overflow-hidden"
          :class="[style['layout-footer-placement']]"
        ></div>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
