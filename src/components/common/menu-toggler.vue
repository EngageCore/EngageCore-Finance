<script setup>
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'MenuToggler' });

const props = defineProps({
  /** Show collapsed icon */
  collapsed: {
    type: Boolean,
    default: false
  },
  /** Arrow style icon */
  arrowIcon: {
    type: Boolean,
    default: false
  },
  zIndex: {
    type: Number,
    default: undefined
  }
});

const icon = computed(() => {
  const icons = {
    0: {
      0: 'fa6-solid:angles-left',
      1: 'fa6-solid:angles-right'
    },
    1: {
      0: 'fa6-solid:caret-left',
      1: 'fa6-solid:caret-right'
    }
  };

  const arrowIcon = Number(props.arrowIcon || false);

  const collapsed = Number(props.collapsed || false);

  return icons[arrowIcon][collapsed];
});
</script>

<template>
  <ButtonIcon
    :key="String(collapsed)"
    :tooltip-content="collapsed ? $t('expand_menu') : $t('collapse_menu')"
    tooltip-placement="bottom-start"
    :z-index="zIndex"
  >
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>

<style scoped></style>
