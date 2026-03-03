<script setup>
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'PinToggler' });

/**
 * @typedef {Object} Props
 * @property {boolean} [pin] - Whether the item is pinned
 */
const props = defineProps({
  pin: {
    type: Boolean,
    default: false
  }
});

const icon = computed(() => (props.pin ? 'mdi-pin-off' : 'mdi-pin'));
</script>

<template>
  <ButtonIcon
    :tooltip-content="pin ? $t('icon.unpin') : $t('icon.pin')"
    tooltip-placement="bottom-start"
    :z-index="100"
  >
    <SvgIcon :icon="icon" />
  </ButtonIcon>
</template>

<style scoped></style>
