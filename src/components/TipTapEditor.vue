<template>
  <div class="tiptap-wrapper w-full">
    <div
      :class="['border rounded-md w-full tiptap-editor', isDark ? 'tiptap-dark' : 'tiptap-light']"
      :style="{ minHeight: height }"
    >
      <!-- Toolbar -->
      <div v-if="showToolbar" :class="['tiptap-toolbar border-b', isDark ? 'tiptap-toolbar-dark' : 'tiptap-toolbar-light']">
        <div class="flex flex-wrap gap-1 p-2">
          <!-- Bold -->
          <button
            v-if="hasToolbarItem('bold')"
            type="button"
            @click="editor?.chain().focus().toggleBold().run()"
            :class="['toolbar-btn', editor?.isActive('bold') ? 'is-active' : '']"
            :title="t('bold')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          
          <!-- Italic -->
          <button
            v-if="hasToolbarItem('italic')"
            type="button"
            @click="editor?.chain().focus().toggleItalic().run()"
            :class="['toolbar-btn', editor?.isActive('italic') ? 'is-active' : '']"
            :title="t('italic')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </button>
          
          <!-- Underline -->
          <button
            v-if="hasToolbarItem('underline')"
            type="button"
            @click="editor?.chain().focus().toggleUnderline().run()"
            :class="['toolbar-btn', editor?.isActive('underline') ? 'is-active' : '']"
            :title="t('underline')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
          
          <!-- Strike -->
          <button
            v-if="hasToolbarItem('strike')"
            type="button"
            @click="editor?.chain().focus().toggleStrike().run()"
            :class="['toolbar-btn', editor?.isActive('strike') ? 'is-active' : '']"
            :title="t('strike')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M10 19h4v-3h-4v3zm-6-4h16v-2H4v2zm2-5V4h4v6H6zm6 0V4h4v6h-4z"/>
            </svg>
          </button>
          
          <div v-if="hasToolbarItem('bold') || hasToolbarItem('italic') || hasToolbarItem('underline') || hasToolbarItem('strike')" class="toolbar-divider" />
          
          <!-- Ordered List -->
          <button
            v-if="hasToolbarItem('orderedList')"
            type="button"
            @click="editor?.chain().focus().toggleOrderedList().run()"
            :class="['toolbar-btn', editor?.isActive('orderedList') ? 'is-active' : '']"
            :title="t('ordered_list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </button>
          
          <!-- Bullet List -->
          <button
            v-if="hasToolbarItem('bulletList')"
            type="button"
            @click="editor?.chain().focus().toggleBulletList().run()"
            :class="['toolbar-btn', editor?.isActive('bulletList') ? 'is-active' : '']"
            :title="t('bullet_list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </button>
          
          <div v-if="hasToolbarItem('orderedList') || hasToolbarItem('bulletList')" class="toolbar-divider" />
          
          <!-- Link -->
          <button
            v-if="hasToolbarItem('link')"
            type="button"
            @click="setLink"
            :class="['toolbar-btn', editor?.isActive('link') ? 'is-active' : '']"
            :title="t('link')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
          </button>
          
          <!-- Table -->
          <div v-if="hasToolbarItem('table')" class="toolbar-divider" />
          <div v-if="hasToolbarItem('table')" class="toolbar-group">
            <button
              type="button"
              @click="insertTable"
              class="toolbar-btn"
              :title="t('insert_table')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().addColumnBefore()"
              type="button"
              @click="editor?.chain().focus().addColumnBefore().run()"
              class="toolbar-btn"
              :title="t('add_column_before')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h4v12H4zm6 0V6h4v12h-4zm6 0V6h4v12h-4z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().addColumnAfter()"
              type="button"
              @click="editor?.chain().focus().addColumnAfter().run()"
              class="toolbar-btn"
              :title="t('add_column_after')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 14H4v-4h12v4zm0-6H4V8h12v4zm4 6h-2v-4h2v4zm0-6h-2V8h2v4z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().deleteColumn()"
              type="button"
              @click="editor?.chain().focus().deleteColumn().run()"
              class="toolbar-btn"
              :title="t('delete_column')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M6 19h12v2H6zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm0-4H7v-2h7v2zm0-4H7V7h7v2z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().addRowBefore()"
              type="button"
              @click="editor?.chain().focus().addRowBefore().run()"
              class="toolbar-btn"
              :title="t('add_row_before')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M22 7h-4V3h-2v4h-4v2h4v4h2V9h4V7zM8 9H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H4v-8h4v8zm10-10h-4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10h-4v-8h4v8z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().addRowAfter()"
              type="button"
              @click="editor?.chain().focus().addRowAfter().run()"
              class="toolbar-btn"
              :title="t('add_row_after')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M22 7h-4V3h-2v4h-4v2h4v4h2V9h4V7zM8 9H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H4v-8h4v8zm10-10h-4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10h-4v-8h4v8z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().deleteRow()"
              type="button"
              @click="editor?.chain().focus().deleteRow().run()"
              class="toolbar-btn"
              :title="t('delete_row')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M6 19h12v2H6zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm0-4H7v-2h7v2zm0-4H7V7h7v2z"/>
              </svg>
            </button>
            <button
              v-if="editor?.can().deleteTable()"
              type="button"
              @click="editor?.chain().focus().deleteTable().run()"
              class="toolbar-btn"
              :title="t('delete_table')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M22 7h-4V3h-2v4h-4v2h4v4h2V9h4V7zM8 9H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H4v-8h4v8zm10-10h-4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10h-4v-8h4v8z"/>
              </svg>
            </button>
          </div>
          
          <div v-if="hasToolbarItem('link') || hasToolbarItem('table')" class="toolbar-divider" />
          
          <!-- Clean -->
          <button
            v-if="hasToolbarItem('clean')"
            type="button"
            @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
            class="toolbar-btn"
            :title="t('clean')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Editor Content -->
      <div :class="isDark ? 'tiptap-dark' : 'tiptap-light'">
        <EditorContent :editor="editor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TableKit } from '@tiptap/extension-table'
import Link from '@tiptap/extension-link'
import { computed, watch, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/useThemeStore'

//#region Props & Emits
const { t } = useI18n()
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

// 默认 toolbar 配置 (匹配 QuillEditor 格式)
const defaultToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'clean']
]

// 扁平化 toolbar 数组以便检查
const flattenToolbar = (toolbar) => {
  if (!toolbar) return []
  return toolbar.flat().map(item => {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item.list) return `${item.list}List`
    return null
  }).filter(Boolean)
}

// 检查是否包含某个 toolbar 项
const hasToolbarItem = (item) => {
  const toolbarItems = flattenToolbar(props.toolbar || defaultToolbar)
  return toolbarItems.includes(item)
}

// 是否显示 toolbar
const showToolbar = computed(() => {
  const toolbarItems = flattenToolbar(props.toolbar || defaultToolbar)
  return toolbarItems.length > 0
})

// 根据 toolbar prop 解析启用的扩展
const getEnabledExtensions = () => {
  const toolbarItems = flattenToolbar(props.toolbar || defaultToolbar)
  
  const extensions = [
    StarterKit.configure({
      bold: toolbarItems.includes('bold'),
      italic: toolbarItems.includes('italic'),
      strike: toolbarItems.includes('strike'),
      bulletList: toolbarItems.includes('bulletList'),
      orderedList: toolbarItems.includes('orderedList'),
      heading: false,
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 underline',
      },
    }),
    TableKit.configure({
      resizable: true,
    }),
  ]

  return extensions
}

// 创建编辑器实例
const editor = useEditor({
  content: props.modelValue || '',
  extensions: getEnabledExtensions(),
  editorProps: {
    attributes: {
      class: 'tiptap-content focus:outline-none',
      'data-placeholder': t(props.placeholder),
    },
    handlePaste(view, event) {
      let text = event.clipboardData?.getData('text/plain')
      if (text != null && text !== '') {
        event.preventDefault()
        // Normalize line endings so newline spacing is preserved (fix hidden new lines)
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        // Restore common missing spaces after paste (e.g. "leaderboard.Auto-Entry" -> "leaderboard. Auto-Entry")
        text = text
          .replace(/\.([A-Z])/g, '. $1')
          .replace(/\)([A-Za-z])/g, ') $1')
          .replace(/(\d)([AP]M)([-–—])/g, '$1$2 $3')
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '</p><p>')
        const html = '<p>' + escaped + '</p>'
        editor.value?.commands.insertContent(html)
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// 更新编辑器样式
const updateEditorStyles = () => {
  if (editor.value) {
    const editorElement = editor.value.view.dom
    const parentEl = editorElement.parentElement
    if (isDark.value) {
      editorElement.style.backgroundColor = '#1f1f1f'
      editorElement.style.color = '#e5e5e5'
      if (parentEl) parentEl.style.backgroundColor = '#1f1f1f'
    } else {
      editorElement.style.backgroundColor = '#fff'
      editorElement.style.color = '#000'
      if (parentEl) parentEl.style.backgroundColor = '#fff'
    }
  }
}

// 监听主题变化
watch(isDark, () => {
  updateEditorStyles()
})

// 编辑器创建后应用样式
watch(editor, () => {
  if (editor.value) {
    updateEditorStyles()
  }
}, { immediate: true })

onMounted(() => {
  updateEditorStyles()
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue || '', false)
  }
})

// 设置链接
const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// 插入表格
const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
//#endregion
</script>

<style scoped>
.tiptap-wrapper {
  width: 100%;
}

/* Toolbar Styles */
.tiptap-toolbar {
  display: flex;
  align-items: center;
}

.tiptap-toolbar-light {
  background-color: #fff;
  border-color: #e5e7eb;
}

.tiptap-toolbar-dark {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
}

.tiptap-dark .tiptap-toolbar {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
}

/* Dark mode container background */
.tiptap-dark {
  background-color: #1f1f1f;
  border-color: #3a3a3a;
}

.tiptap-dark.tiptap-editor {
  background-color: #1f1f1f;
  border-color: #3a3a3a;
}

.tiptap-light {
  background-color: #fff !important;
}

.tiptap-light.tiptap-editor {
  background-color: #fff !important;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  margin: 0 2px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tiptap-toolbar-light .toolbar-btn {
  color: #374151;
}

.tiptap-toolbar-light .toolbar-btn:hover {
  background-color: #f3f4f6;
}

.tiptap-toolbar-light .toolbar-btn.is-active {
  background-color: #e5e7eb;
  color: #111827;
}

.tiptap-toolbar-dark .toolbar-btn {
  color: #d1d5db;
}

.tiptap-toolbar-dark .toolbar-btn:hover {
  background-color: #374151;
}

.tiptap-toolbar-dark .toolbar-btn.is-active {
  background-color: #4b5563;
  color: #fff;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  margin: 0 4px;
  background-color: #e5e7eb;
}

.tiptap-toolbar-dark .toolbar-divider {
  background-color: #3a3a3a;
}

.toolbar-group {
  display: inline-flex;
  gap: 2px;
}

/* 基础样式 */
.tiptap-editor {
  min-height: v-bind(height);
}

:deep(.tiptap-editor .ProseMirror) {
  outline: none;
  padding: 12px;
}

/* ✅ 亮色模式 */
.tiptap-light :deep(.ProseMirror) {
  background-color: #fff !important;
  color: #000 !important;
}

:global(.tiptap-light .ProseMirror p.is-editor-empty:first-child::before) {
  color: #999 !important;
}

/* ✅ 暗色模式 */
.tiptap-dark :deep(.ProseMirror) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

.tiptap-dark :deep(.tiptap-content) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

.tiptap-dark.tiptap-editor {
  border-color: #3a3a3a;
}

:global(.tiptap-dark .ProseMirror) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

:global(.tiptap-dark .tiptap-content) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

:global(.tiptap-dark .ProseMirror p.is-editor-empty:first-child::before) {
  color: rgba(255, 255, 255, 0.35) !important;
}

/* Ensure the EditorContent wrapper div also gets dark bg */
.tiptap-dark :deep(.tiptap) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

:global(.tiptap-dark .tiptap) {
  background-color: #1f1f1f !important;
  color: #e5e5e5 !important;
}

/* 表格样式 */
:deep(.ProseMirror table) {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

:deep(.ProseMirror table td),
:deep(.ProseMirror table th) {
  border: 1px solid;
  box-sizing: border-box;
  min-width: 1em;
  padding: 8px;
  position: relative;
  vertical-align: top;
}

.tiptap-light :deep(.ProseMirror table td),
.tiptap-light :deep(.ProseMirror table th) {
  border-color: #e5e7eb;
}

.tiptap-dark :deep(.ProseMirror table td),
.tiptap-dark :deep(.ProseMirror table th) {
  border-color: #3a3a3a;
  background-color: #1f1f1f;
  color: #e5e5e5;
}

:deep(.ProseMirror table th) {
  font-weight: bold;
  text-align: left;
}

.tiptap-light :deep(.ProseMirror table th) {
  background-color: #f9fafb;
}

.tiptap-dark :deep(.ProseMirror table th) {
  background-color: #2a2a2a;
}

/* 选中状态 */
:deep(.ProseMirror table .selectedCell:after) {
  z-index: 2;
  position: absolute;
  content: '';
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

.tiptap-dark :deep(.ProseMirror table .selectedCell:after) {
  background: rgba(100, 100, 200, 0.4);
}

/* 列调整手柄 */
:deep(.ProseMirror .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: #adf;
  pointer-events: none;
}

.tiptap-dark :deep(.ProseMirror .column-resize-handle) {
  background-color: #4a5568;
}

/* 链接样式 */
:deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.tiptap-dark :deep(.ProseMirror a) {
  color: #60a5fa;
}

/* 列表样式 */
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5em;
}

:deep(.ProseMirror li) {
  margin: 0.25em 0;
}
</style>
