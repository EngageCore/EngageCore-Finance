<script setup>
import { $t } from '@/locales';

defineOptions({
  name: 'ReloadButton'
});

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <ButtonIcon :tooltip-content="$t('reload')">
    <icon-ant-design-reload-outlined :class="{ 'animate-spin animate-duration-750': loading }" />
  </ButtonIcon>
</template>

<style scoped></style>
