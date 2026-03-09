<template>
  <div class="p-4 h-auto" :class="{ 'px-0': removePadding }">
    <div class="max-w-full mx-auto">
      <!-- When showCard is true (default), wrap table in Naive Card -->
      <n-card
        v-if="showCard"
        size="small"
        class="shadow-sm rounded-lg overflow-auto"
        bordered
      >
        <!-- ✅ Header: 左边 title -->
        <template #header>
          <span v-if="title">{{ $t(title) }}</span>
        </template>

        <!-- ✅ Header Right: 右边内容 -->
        <template #header-extra>
          <div class="flex items-center gap-2">
            <n-button
              v-if="showExport"
              size="small"
              type="primary"
              ghost
              :loading="exportLoading"
              @click="emit('export')"
            >
              {{ $t(exportLabel) }}
            </n-button>
            <slot name="header-right"></slot>
          </div>
        </template>

        <!-- Description -->
        <template v-if="description">
          <n-text depth="3" class="text-sm mb-4 block -mt-2">
            {{ $t(description) }}
          </n-text>
        </template>

        <div class="table-wrapper">
          <n-data-table
            :columns="computedColumns"
            :data="paginatedData"
            :bordered="bordered"
            :striped="striped"
            :loading="loading"
            :single-line="false"
            :size="size"
            class="expandable-table"
            :style="{ minWidth: tableMinWidth, width: '100%' }"
          />
        </div>

        <div v-if="paginationEnabled" class="flex justify-end mt-4">
          <n-pagination
            v-model:page="pagination.page"
            :page-size="pagination.pageSize"
            :page-count="pageCount"
            show-size-picker
            :page-sizes="[5, 10, 20, 50]"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>

        <div class="mt-4">
          <slot name="footer"></slot>
        </div>
      </n-card>

      <!-- When showCard is false, render only the bare table + pagination + footer -->
      <div v-else>
        <div v-if="title || description || $slots['header-right'] || showExport" class="mb-2 flex items-center justify-between">
          <div>
            <div v-if="title" class="font-semibold text-sm">
              {{ $t(title) }}
            </div>
            <div v-if="description" class="text-xs text-gray-500">
              {{ $t(description) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <n-button
              v-if="showExport"
              size="small"
              type="primary"
              ghost
              :loading="exportLoading"
              @click="emit('export')"
            >
              {{ $t(exportLabel) }}
            </n-button>
            <slot name="header-right"></slot>
          </div>
        </div>

        <div class="table-wrapper">
          <n-data-table
            :columns="computedColumns"
            :data="paginatedData"
            :bordered="bordered"
            :striped="striped"
            :loading="loading"
            :single-line="false"
            :size="size"
            class="expandable-table"
            :style="{ minWidth: tableMinWidth, width: '100%' }"
          />
        </div>

        <div v-if="paginationEnabled" class="flex justify-end mt-4">
          <n-pagination
            v-model:page="pagination.page"
            :page-size="pagination.pageSize"
            :page-count="pageCount"
            show-size-picker
            :page-sizes="[5, 10, 20, 50]"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>

        <div class="mt-4">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NCard, NText, NDataTable, NPagination } from 'naive-ui'

const { t } = useI18n()
const slots = useSlots()

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  headers: { type: Array, required: true },
  data: { type: Array, required: true },
  bordered: { type: Boolean, default: true },
  striped: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  size: { type: String, default: 'medium' },
  offset: { type: Number, default: 0 },
  limit: { type: Number, default: 10 },
  totalRows: { type: Number, default: 0 },
  pagination: { type: Boolean, default: true },
  removePadding: { type: Boolean, default: false },
  /** When false, renders only the bare table (no outer card box) */
  showCard: { type: Boolean, default: true },
  showExport: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  exportLabel: { type: String, default: 'common.export' }
})

const emit = defineEmits(['sort', 'pagination', 'export'])

//#region Pagination
const pagination = ref({
  page: Math.floor(props.offset / props.limit) + 1,
  pageSize: props.limit
})

watch(
  () => props.offset,
  (newOffset) => {
    pagination.value.page = Math.floor(newOffset / props.limit) + 1
  }
)

const pageCount = computed(() =>
  Math.ceil(props.totalRows / pagination.value.pageSize)
)

const handlePageChange = (page) => {
  emit('pagination', {
    offset: (page - 1) * pagination.value.pageSize,
    limit: pagination.value.pageSize
  })
}

const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  emit('pagination', { offset: 0, limit: pageSize })
}

const paginationEnabled = computed(
  () => props.pagination && props.totalRows > 0
)

const paginatedData = computed(() => {
  // 如果 totalRows 有传，代表数据来自后端分页，直接用 data
  if (props.totalRows) return props.data
  // 否则前端分页
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  return props.data.slice(start, start + pagination.value.pageSize)
})
//#endregion

//#region Columns
const computedColumns = computed(() =>
  props.headers.map((header) => ({
    title: () => t(header.label),
    key: header.key,
    align: header.align || 'center',
    width: header.width || undefined,
    sorter: header.sortable
      ? (a, b) => {
          if (a[header.key] < b[header.key]) return -1
          if (a[header.key] > b[header.key]) return 1
          return 0
        }
      : false,
    render: (row, index) => {
      const slotName = header.key
      if (slots[slotName]) {
        return slots[slotName]({ row, index })
      }
      return row[header.key]
    }
  }))
)
//#endregion

//#region 动态最小宽度（每栏约100px，整体最小 500px）
const tableMinWidth = computed(() => {
  const baseWidth = 100
  const min = props.headers.length * baseWidth
  // For small column counts (e.g. 3 columns), this keeps width compact
  // but avoids overly narrow tables on larger screens.
  return `${Math.max(min, 500)}px`
})
//#endregion
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* ✅ 横向滚动支持 */
.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

/* ✅ 表格自动撑满或滚动 */
.expandable-table {
  table-layout: auto;
}

.n-data-table {
  white-space: nowrap;
}
</style>
