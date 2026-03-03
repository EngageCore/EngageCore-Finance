<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { TransitionPresets, useTransition } from '@vueuse/core';

defineOptions({
  name: 'CountTo'
});

const props = defineProps({
  startValue: {
    type: Number,
    default: 0
  },
  endValue: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 1000
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  decimals: {
    type: Number,
    default: 0
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  separator: {
    type: String,
    default: ','
  },
  decimal: {
    type: String,
    default: '.'
  },
  useEasing: {
    type: Boolean,
    default: true
  },
  transition: {
    type: String,
    default: 'linear'
  }
});

const source = ref(props.startValue);

const transition = computed(() =>
  props.useEasing ? TransitionPresets[props.transition] || props.transition : props.transition
);

const disabled = computed(() => props.startValue === props.endValue);

const outputValue = useTransition(source, {
  disabled,
  duration: props.duration,
  transition: transition.value
});

const value = computed(() => formatValue(outputValue.value));

function formatValue(num) {
  const { decimals, decimal, separator, suffix, prefix } = props;

  let number = num.toFixed(decimals);
  number = String(number);

  const x = number.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimal + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  if (separator) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, `$1${separator}$2`);
    }
  }

  return prefix + x1 + x2 + suffix;
}

async function start() {
  await nextTick();
  source.value = props.endValue;
}

watch(
  [() => props.startValue, () => props.endValue],
  () => {
    if (props.autoplay) {
      start();
    }
  },
  { immediate: true }
);
</script>

<template>
  <span>{{ value }}</span>
</template>

<style scoped></style>
