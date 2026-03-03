<script setup>
defineOptions({
  name: 'SettingItem'
});

defineProps({
  label: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="w-full flex-y-center justify-between">
    <div>
      <span class="pr-8px text-base-text">{{ label }}</span>
      <slot name="suffix"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped></style>
