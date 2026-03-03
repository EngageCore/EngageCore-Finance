<script setup>
defineOptions({ name: 'DarkModeContainer' });

defineProps({
  inverted: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="bg-container text-base-text transition-300" :class="{ 'bg-inverted text-#1f1f1f': inverted }">
    <slot></slot>
  </div>
</template>

<style scoped></style>
