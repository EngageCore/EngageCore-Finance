<script setup>
import { $t } from '@/locales';

defineOptions({
  name: 'FullScreen'
});

defineProps({
  full: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <ButtonIcon :key="String(full)" :tooltip-content="full ? $t('exit_fullscreen') : $t('fullscreen')">
    <icon-gridicons-fullscreen-exit v-if="full" />
    <icon-gridicons-fullscreen v-else />
  </ButtonIcon>
</template>

<style scoped></style>
