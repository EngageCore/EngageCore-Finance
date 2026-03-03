<script setup>
import { $t } from '@/locales';

defineOptions({
  name: 'GlobalLogo'
});

defineProps({
  /** Whether to show the title */
  showTitle: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <RouterLink to="/" class="w-full flex-center nowrap-hidden">
    <SystemLogo class="text-32px text-primary" />
    <h2 v-show="showTitle" class="pl-8px text-16px text-primary font-bold transition duration-300 ease-in-out">
      EngageFinance
    </h2>
  </RouterLink>
</template>

<style scoped></style>
