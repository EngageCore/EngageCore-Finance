<script setup>
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderOperation'
});

defineProps({
  itemAlign: {
    type: String,
    default: 'center'
  },
  disabledDelete: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['add', 'delete', 'refresh']);

const columns = defineModel('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <NSpace :item-style="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">
      <NButton size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </NButton>
      <NPopconfirm @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
    </slot>
    <NButton size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </NButton>
    <TableColumnSetting v-model="columns" />
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
