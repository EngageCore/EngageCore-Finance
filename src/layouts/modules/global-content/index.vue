<script setup>
import { computed } from 'vue';
import { LAYOUT_SCROLL_EL_ID } from '@sa/materials';
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useRouteStore } from '@/store/useRouteStore';
import { useTabStore } from '@/store/useTabStore';
import AmbientParticles from '@/components/custom/ambient-particles.vue';

defineOptions({
  name: 'GlobalContent'
});

defineProps({
  /** Show padding for content */
  showPadding: {
    type: Boolean,
    default: true
  }
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();
const tabStore = useTabStore();

const transitionName = computed(() => (themeStore.page.animate ? themeStore.page.animateMode : ''));

function resetScroll() {
  const el = document.querySelector(`#${LAYOUT_SCROLL_EL_ID}`);

  el?.scrollTo({ left: 0, top: 0 });
}
</script>

<template>
  <AmbientParticles />
  <RouterView v-slot="{ Component, route }">
    <KeepAlive :include="routeStore.cacheRoutes" :exclude="routeStore.excludeCacheRoutes">
      <component
        :is="Component"
        v-if="appStore.reloadFlag"
        :key="tabStore.getTabIdByRoute(route)"
        :class="{ 'p-16px': showPadding }"
        class="flex-grow bg-layout route-surface"
      />
    </KeepAlive>
  </RouterView>
</template>

<style scoped>
.route-surface {
  position: relative;
  z-index: 1;
}
</style>
