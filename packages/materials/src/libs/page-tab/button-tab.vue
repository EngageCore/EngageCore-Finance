<script setup>
import style from './index.module.css';

defineOptions({
  name: 'ButtonTab'
});

defineProps({
  darkMode: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  }
});

defineSlots();
</script>

<template>
  <div
    class=":soy: relative inline-flex cursor-pointer items-center justify-center gap-12px whitespace-nowrap border-(1px solid) rounded-4px px-12px py-4px"
    :class="[
      style['button-tab'],
      { [style['button-tab_dark']]: darkMode },
      { [style['button-tab_active']]: active },
      { [style['button-tab_active_dark']]: active && darkMode }
    ]"
  >
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="suffix"></slot>
  </div>
</template>

<style scoped></style>
