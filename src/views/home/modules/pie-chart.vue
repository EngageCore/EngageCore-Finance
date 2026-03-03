<script setup>
import { watch } from 'vue';
import { useAppStore } from '@/store/useAppStore';
import { useEcharts } from '@/hooks/echarts';
import { $t } from '@/locales';

defineOptions({
  name: 'PieChart'
});

const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '1%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#5da8ff', '#8e9dff', '#fedc69', '#26deca'],
      name: $t('schedule'),
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
}));

async function mockData() {
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  updateOptions(opts => {
    opts.series[0].data = [
      { name: $t('study'), value: 20 },
      { name: $t('entertainment'), value: 10 },
      { name: $t('work'), value: 40 },
      { name: $t('rest'), value: 30 }
    ];

    return opts;
  });
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();

    opts.series[0].name = originOpts.series[0].name;

    opts.series[0].data = [
      { name: $t('study'), value: 20 },
      { name: $t('entertainment'), value: 10 },
      { name: $t('work'), value: 40 },
      { name: $t('rest'), value: 30 }
    ];

    return opts;
  });
}

async function init() {
  mockData();
}

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

// init
init();
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </NCard>
</template>

<style scoped></style>
