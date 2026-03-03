<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { $t } from '@/locales';

defineOptions({
  name: 'HeaderBanner'
});

/**
 * @typedef {Object} StatisticItem
 * @property {number} id - The unique identifier
 * @property {string} label - The display label
 * @property {string} value - The display value
 */

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

const statisticData = computed(() => [
  {
    id: 0,
    label: $t('project_count'),
    value: '25'
  },
  {
    id: 1,
    label: $t('to_do'),
    value: '4/16'
  },
  {
    id: 2,
    label: $t('message'),
    value: '12'
  }
]);
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:18">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img src="@/assets/imgs/gamingpro.jpg" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ $t('greeting', { userName: authStore.userInfo.userName }) }}
            </h3>
            <p class="text-#999 leading-30px">{{ $t('weather_description') }}</p>
          </div>
        </div>
      </NGi>
      <NGi span="24 s:24 m:6">
        <NSpace :size="24" justify="end">
          <NStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </NSpace>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
