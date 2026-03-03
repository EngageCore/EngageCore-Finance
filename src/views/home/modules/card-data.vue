<script setup>
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { $t } from '@/locales';

defineOptions({
  name: 'CardData'
});

const cardData = computed(() => [
  {
    key: 'visitCount',
    title: $t('visit_count'),
    value: 9725,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'fa6-solid:chart-column'
  },
  {
    key: 'turnover',
    title: $t('turnover'),
    value: 1026,
    unit: '$',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'fa6-solid:money-bill-wave'
  },
  {
    key: 'downloadCount',
    title: $t('download_count'),
    value: 970925,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'fa6-solid:download'
  },
  {
    key: 'dealCount',
    title: $t('deal_count'),
    value: 9527,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'fa6-solid:certificate'
  }
]);

const [DefineGradientBg, GradientBg] = createReusableTemplate();

function getGradientColor(color) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="rd-8px px-16px pb-4px pt-8px text-white" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->

    <NGrid cols="s:1 m:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi v-for="item in cardData" :key="item.key">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
          <h3 class="text-16px">{{ item.title }}</h3>
          <div class="flex justify-between pt-12px">
            <SvgIcon :icon="item.icon" class="text-32px" />
            <CountTo
              :prefix="item.unit"
              :start-value="1"
              :end-value="item.value"
              class="text-30px text-white dark:text-dark"
            />
          </div>
        </GradientBg>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
