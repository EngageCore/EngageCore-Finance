<script setup>
import { computed } from 'vue';
import { useRouterPush } from '@/hooks/router';
import { $t } from '@/locales';

defineOptions({ name: 'ExceptionBase' });

/**
 * @typedef {'403' | '404' | '500'} ExceptionType
 */

/**
 * @typedef {Object} Props
 * @property {ExceptionType} type - Exception type
 *   - 403: no permission
 *   - 404: not found
 *   - 500: service error
 */
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['403', '404', '500'].includes(value)
  }
});

const { routerPushByKey } = useRouterPush();

const iconMap = {
  403: 'no-permission',
  404: 'not-found',
  500: 'service-error'
};

const icon = computed(() => iconMap[props.type]);
</script>

<template>
  <div class="size-full min-h-520px flex-col-center gap-24px overflow-hidden">
    <div class="flex text-400px text-primary">
      <SvgIcon :local-icon="icon" />
    </div>
    <NButton type="primary" @click="routerPushByKey('root')">{{ $t('common.backToHome') }}</NButton>
  </div>
</template>

<style scoped></style>
