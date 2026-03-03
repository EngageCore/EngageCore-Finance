<script setup>
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'LangSwitch'
});

const props = defineProps({
  lang: {
    type: String,
    default: ''
  },
  langOptions: {
    type: Array,
    default: () => []
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['changeLang']);

const tooltipContent = computed(() => {
  if (!props.showTooltip) return '';

  return $t('language');
});

/** Add bottom margin to all options except the last one for proper visual separation */
const dropdownOptions = computed(() => {
  const lastIndex = props.langOptions.length - 1;

  return props.langOptions.map((option, index) => ({
    ...option,
    props: {
      class: index < lastIndex ? 'mb-1' : undefined
    }
  }));
});

function changeLang(lang) {
  emit('changeLang', lang);
}
</script>

<template>
  <NDropdown :value="lang" :options="dropdownOptions" trigger="hover" @select="changeLang">
    <div>
      <ButtonIcon :tooltip-content="tooltipContent" tooltip-placement="left">
        <SvgIcon icon="fa6-solid:language" />
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
