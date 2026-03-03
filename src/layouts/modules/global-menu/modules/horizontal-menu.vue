<script setup>
import { GLOBAL_HEADER_MENU_ID } from '@/constants/app';
import { useRouteStore } from '@/store/useRouteStore';
import { useRouterPush } from '@/hooks/router';
import { useMenu } from '../../../context';

defineOptions({
  name: 'HorizontalMenu'
});

const routeStore = useRouteStore();
const { routerPushByKeyWithMetaQuery } = useRouterPush();
const { selectedKey } = useMenu();
</script>

<template>
  <Teleport :to="`#${GLOBAL_HEADER_MENU_ID}`">
    <NMenu
      mode="horizontal"
      :value="selectedKey"
      :options="routeStore.menus"
      :indent="18"
      responsive
      @update:value="routerPushByKeyWithMetaQuery"
    />
  </Teleport>
</template>

<style scoped></style>
