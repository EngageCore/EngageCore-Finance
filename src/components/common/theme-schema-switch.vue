<script setup>
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'ThemeSchemaSwitch' });

const props = defineProps({
  themeSchema: {
    type: String,
    default: ''
  },
  showTooltip: {
    type: Boolean,
    default: true
  },
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  }
});

const emit = defineEmits(['switch']);

function handleSwitch() {
  emit('switch');
}

const icons = {
  light: 'fa6-solid:sun',
  dark: 'fa6-solid:moon',
  auto: 'fa6-solid:circle-half-stroke'
};

const icon = computed(() => icons[props.themeSchema]);

const tooltipContent = computed(() => {
  if (!props.showTooltip) return '';

  return $t('theme_schema');
});
</script>

<template>
  <ButtonIcon
    :icon="icon"
    :tooltip-content="tooltipContent"
    :tooltip-placement="tooltipPlacement"
    @click="handleSwitch"
  />
</template>

<style scoped></style>
