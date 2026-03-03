<script setup>
import { useAppStore } from '@/store/useAppStore';
import { $t } from '@/locales';

defineOptions({
  name: 'ThemeButton'
});

const appStore = useAppStore();
</script>

<template>
  <ButtonIcon
    icon="fa6-solid:palette"
    :tooltip-content="$t('theme_configuration')"
    @click="appStore.openThemeDrawer"
  />
</template>

<style scoped></style>
