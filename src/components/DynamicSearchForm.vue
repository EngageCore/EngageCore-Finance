<template>
  <div class="p-4 h-auto">
    <div class="max-w-full mx-auto">
      <n-card :segmented="true" size="small" class="shadow-sm rounded-lg overflow-auto">
        <n-collapse :default-expanded-names="['form']">
          <n-collapse-item name="form">
            <template #header>
              <n-text strong>{{ $t('form_filters') }}</n-text>
            </template>

            <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top" class="grid grid-cols-12 gap-4">
              <template v-for="(field, index) in fields" :key="index">
                <n-form-item :label="$t(field.label)" :path="getFieldKey(field)" :class="field.colClass || 'col-span-12 lg:col-span-3'">
                  <slot :name="`custom-${getFieldKey(field)}`" :field="field" :formData="formData">

                    <!-- 普通输入 -->
                    <n-input
                      v-if="['text', 'number'].includes(field.type)"
                      v-model:value="formData[getFieldKey(field)]"
                      :type="field.type"
                      clearable
                      :placeholder="$t(field.placeholder || '')"
                    />

                    <!-- 单日期 -->
                    <n-date-picker
                      v-else-if="field.type === 'date'"
                      v-model:value="formData[getFieldKey(field)]"
                      type="date"
                      format="yyyy-MM-dd"
                      clearable
                      :is-date-disabled="field.maxToday ? disableAfterToday : undefined"
                      :placeholder="$t(field.placeholder || '')"
                    />

                    <!-- 日期范围 -->
                    <n-date-picker
                      v-else-if="field.type === 'daterange'"
                      v-model:value="formData[getFieldKey(field)]"
                      type="daterange"
                      format="yyyy-MM-dd"
                      close-on-select
                      clearable
                      :placeholder="[$t('start_date'), $t('end_date')]"
                    />

                    <!-- ✅ 动态远程单选 -->
                    <n-select
                      v-else-if="field.type === 'select'"
                      v-model:value="formData[getFieldKey(field)]"
                      clearable
                      :options="field.options"
                      :loading="field.loading"
                      :placeholder="$t('select_an_option')"
                      filterable
                      :filterable="!!field.isDynamic"
                      :remote="!!field.isDynamic"
                      @search="field.isDynamic ? handleRemoteSearch(field, $event) : null"
                    />

                    <!-- 多选 -->
                    <n-select
                      v-else-if="field.type === 'multiselect'"
                      v-model:value="formData[getFieldKey(field)]"
                      clearable
                      multiple
                      filterable
                      :options="field.options"
                      :placeholder="$t('select_an_option')"
                    />
                  </slot>
                </n-form-item>
              </template>

              <!-- ✅ 工具栏 -->
              <slot name="toolbars"></slot>

              <!-- ✅ 按钮区 -->
              <div class="col-span-12 flex justify-end gap-2">
                <slot name="extra-button"></slot>
                <n-button v-if="showResetButton" @click="onReset" type="default">{{ $t('reset') }}</n-button>
                <n-button v-if="showAddButton" @click="onAdd" type="warning">{{ $t('add') }}</n-button>
                <n-button v-if="showSearchButton" type="primary" @click="onSubmit">{{ $t('search') }}</n-button>
              </div>
            </n-form>
          </n-collapse-item>
        </n-collapse>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@/composables/useDebounceFn' // ✅ 引入你自己的防抖函数
import { formatDate } from '@/utils/common'
import {
  NCard, NForm, NFormItem, NInput, NSelect,
  NDatePicker, NButton, NCollapse, NCollapseItem, NText
} from 'naive-ui'

const { t } = useI18n()

const props = defineProps({
  fields: { type: Array, required: true },
  initialData: { type: Object, default: () => ({}) },
  defaultData: { type: Object, default: () => ({}) },
  showResetButton: { type: Boolean, default: true },
  showAddButton: { type: Boolean, default: false },
  showSearchButton: { type: Boolean, default: true }
})

const emit = defineEmits(['submit', 'add', 'reset'])

const formRef = ref(null)
const formData = reactive({})
const rules = reactive({})

//#region helper
const getFieldKey = (field) => Array.isArray(field.id) ? field.id.join('_') : field.id

const getTodayStartTs = () => {
  const now = new Date()
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
}

const disableAfterToday = (ts) => {
  return ts > getTodayStartTs()
}
//#endregion

//#region 初始化表单数据
const toTs = (val) => {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    // 兼容 "yyyy-MM-dd"（避免时区偏移）
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val + 'T00:00:00').getTime()
    const t = Date.parse(val)
    return Number.isNaN(t) ? null : t
  }
  return null
}

const initializeFormData = () => {
  Object.keys(rules).forEach(k => delete rules[k])

  props.fields.forEach((field) => {
    const key = getFieldKey(field)

    // ✅ daterange：把 start/end（string/number）转成 [ts, ts]
    if (Array.isArray(field.id) && field.type === 'daterange') {
      const [startKey, endKey] = field.id
      const startRaw = props.initialData[startKey] ?? props.defaultData[startKey]
      const endRaw = props.initialData[endKey] ?? props.defaultData[endKey]
      const start = toTs(startRaw)
      const end = toTs(endRaw)
      formData[key] = start || end ? [start, end] : null
    }
    // ✅ date：把 string 转成 ts
    else if (field.type === 'date') {
      const raw =
        props.initialData[field.id] ??
        props.defaultData[field.id] ??
        field.default ??
        null
      formData[key] = toTs(raw)
    }
    // 其他照旧
    else {
      formData[key] =
        props.initialData[field.id] ??
        props.defaultData[field.id] ??
        field.default ??
        (field.type === 'multiselect' ? [] : null)
    }

    if (field.isRequired) {
      rules[key] = {
        trigger: ['blur', 'change'],
        validator: (_rule, value) => {
          // daterange: 必须数组，且两端都有值
          if (field.type === 'daterange') {
            const ok = Array.isArray(value) && value.length === 2 && !!value[0] && !!value[1]
            return ok ? true : new Error(`${t(field.label)} ${t('is_required')}`)
          }

          // date: 必须是 timestamp number
          if (field.type === 'date') {
            const ok = typeof value === 'number' && !Number.isNaN(value)
            return ok ? true : new Error(`${t(field.label)} ${t('is_required')}`)
          }

          // multiselect: 必须选到至少一个
          if (field.type === 'multiselect') {
            const ok = Array.isArray(value) && value.length > 0
            return ok ? true : new Error(`${t(field.label)} ${t('is_required')}`)
          }

          // 其他：非空
          const ok = value !== null && value !== undefined && value !== ''
          return ok ? true : new Error(`${t(field.label)} ${t('is_required')}`)
        }
      }
    }
  })
}

onMounted(() => initializeFormData())
watch(() => JSON.stringify(props.initialData), () => initializeFormData())
//#endregion

//#region 提交
const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const submissionData = {}
  props.fields.forEach((field) => {
    const key = getFieldKey(field)
    const value = formData[key]
    if (Array.isArray(field.id) && field.type === 'daterange') {
      const [startKey, endKey] = field.id
      submissionData[startKey] = formatDate(value?.[0]) || null
      submissionData[endKey] = formatDate(value?.[1]) || null
    } else if (field.type === 'date') {
      submissionData[field.id] = value ? formatDate(value) : null
      return
    } else {
      submissionData[field.id] = value
    }
  })
  emit('submit', submissionData)
}
//#endregion

//#region Reset / Add
const onReset = () => {
  initializeFormData()
  emit('reset')
}
const onAdd = () => emit('add')
//#endregion

//#region ✅ 动态远程搜索逻辑（只在 field.isDynamic = true 时启用）
const remoteSearchHandlers = new Map()

const handleRemoteSearch = (field, query) => {
  if (!field.remoteMethod) return

  if (!remoteSearchHandlers.has(field.id)) {
    // 为每个 field 创建独立的 debounce 函数
    const debouncedFn = useDebounceFn(async (val) => {
      try {
        field.loading = true
        await field.remoteMethod(val)
      } finally {
        field.loading = false
      }
    }, field.debounceDelay || 300) // ✅ 支持自定义 debounce 时间

    remoteSearchHandlers.set(field.id, debouncedFn)
  }

  remoteSearchHandlers.get(field.id)(query)
}
//#endregion
</script>

<style scoped>
.n-date-picker {
  width: 100%;
}
</style>
