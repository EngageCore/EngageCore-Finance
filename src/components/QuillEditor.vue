<template>
  <div class="quill-wrapper w-full">
    <quill-editor v-model:content="localValue" content-type="html" :options="resolvedOptions" :class="['border rounded-md w-full', isDark ? 'quill-dark' : 'quill-light']"
      :style="{ minHeight: height }" />
  </div>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/useThemeStore'

//#region Props & Emits
const { t } = useI18n();
const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'please_enter_content'
  },
  height: {
    type: String,
    default: '200px'
  },
  /** ✅ 新增：只要传 toolbar 数组就可以自定义 */
  toolbar: {
    type: Array,
    default: null
  }
})
const emit = defineEmits(['update:modelValue'])
//#endregion

//#region Computed values
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.darkMode)

const localValue = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

// 默认 toolbar
const defaultToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'clean']
]

// ✅ 组合最终配置
const resolvedOptions = computed(() => ({
  theme: 'snow',
  placeholder: t(props.placeholder),
  modules: {
    toolbar: props.toolbar || defaultToolbar // ✅ 如果有传，就用传进来的
  }
}))
//#endregion
</script>

<style scoped>
.quill-wrapper {
  width: 100%;
}

/* ✅ 亮色模式 */
.quill-light .ql-container {
  background-color: #fff;
  color: #000;
}

/* ✅ 暗色模式 */
.quill-dark .ql-container {
  background-color: #1f1f1f;
  color: #e5e5e5;
}

.quill-dark .ql-toolbar {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
}

.quill-dark .ql-container.ql-snow {
  border-color: #3a3a3a;
}

:global(.quill-light .ql-editor.ql-blank::before) {
  color: #999 !important;
}

:global(.quill-dark .ql-editor.ql-blank::before) {
  color: rgba(255, 255, 255, 0.35) !important;
}
</style>
