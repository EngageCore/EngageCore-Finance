<script setup>
import { twMerge } from 'tailwind-merge';

defineOptions({
  name: 'ButtonIcon',
  inheritAttrs: false
});

const props = defineProps({
  /** Button class */
  class: {
    type: String,
    default: ''
  },
  /** Iconify icon name */
  icon: {
    type: String,
    default: ''
  },
  /** Tooltip content */
  tooltipContent: {
    type: String,
    default: ''
  },
  /** Tooltip placement */
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  },
  zIndex: {
    type: Number,
    default: 98
  }
});

const DEFAULT_CLASS = 'h-[36px] text-icon';
</script>

<template>
  <NTooltip :placement="tooltipPlacement" :z-index="zIndex" :disabled="!tooltipContent">
    <template #trigger>
      <NButton quaternary :class="twMerge(DEFAULT_CLASS, props.class)" v-bind="$attrs">
        <div class="flex-center gap-8px">
          <slot>
            <SvgIcon :icon="icon" />
          </slot>
        </div>
      </NButton>
    </template>
    {{ tooltipContent }}
  </NTooltip>
</template>

<style scoped></style>
