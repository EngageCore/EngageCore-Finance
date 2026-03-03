<script setup>
import { computed } from 'vue';
import { ACTIVE_COLOR, createTabCssVars } from './shared';
import ChromeTab from './chrome-tab.vue';
import ButtonTab from './button-tab.vue';
import SvgClose from './svg-close.vue';
import style from './index.module.css';

defineOptions({
  name: 'PageTab'
});

const props = defineProps({
  mode: {
    type: String,
    default: 'chrome'
  },
  commonClass: {
    type: String,
    default: 'transition-all-300'
  },
  activeColor: {
    type: String,
    default: ACTIVE_COLOR
  },
  closable: {
    type: Boolean,
    default: true
  },
  chromeClass: {
    type: String,
    default: ''
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const activeTabComponent = computed(() => {
  const { mode, chromeClass, buttonClass } = props;

  const tabComponentMap = {
    chrome: {
      component: ChromeTab,
      class: chromeClass
    },
    button: {
      component: ButtonTab,
      class: buttonClass
    }
  };

  return tabComponentMap[mode];
});

const cssVars = computed(() => createTabCssVars(props.activeColor));

const bindProps = computed(() => {
  const { chromeClass: _chromeCls, buttonClass: _btnCls, ...rest } = props;

  return rest;
});

function handleClose() {
  emit('close');
}
</script>

<template>
  <component :is="activeTabComponent.component" :class="activeTabComponent.class" :style="cssVars" v-bind="bindProps">
    <template #prefix>
      <slot name="prefix"></slot>
    </template>
    <slot></slot>
    <template #suffix>
      <slot name="suffix">
        <SvgClose v-if="closable" :class="[style['svg-close']]" @pointerdown.stop="handleClose" />
      </slot>
    </template>
  </component>
</template>

<style scoped></style>
