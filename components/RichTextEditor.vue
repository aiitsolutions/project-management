<template>
  <div class="rich-editor" :class="{ compact: compact }">
    <div class="editor-tools">
      <button type="button" @click="formatText('bold')" title="Bold"><b>B</b></button>
      <button type="button" @click="formatText('italic')" title="Italic"><i>I</i></button>
      <button type="button" @click="formatText('underline')" title="Underline"><u>U</u></button>
      <div class="divider"></div>
      <button type="button" @click="formatText('insertUnorderedList')" title="Bullet List">• List</button>
    </div>
    <div 
      class="editor-canvas" 
      contenteditable="true" 
      ref="editorRef" 
      @input="updateContent"
      @paste="handlePaste"
      v-html="initialContent"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue?: string
  initialContent?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLElement | null>(null)

const formatText = (command: string) => {
  document.execCommand(command, false, '')
  editorRef.value?.focus()
}

const updateContent = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const handlePaste = (e: Event) => {
  e.preventDefault()
  const text = (e as ClipboardEvent).clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== editorRef.value.innerHTML) {
    editorRef.value.innerHTML = newVal || ''
  }
})

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-bg-card);
}

.rich-editor.compact {
  border-radius: 8px;
}

.editor-tools {
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.rich-editor.compact .editor-tools {
  padding: 0.4rem 0.5rem;
}

.editor-tools button {
  padding: 0.25rem 0.5rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text-secondary);
}

.editor-tools button:hover {
  background: var(--color-bg-main);
  border-color: var(--color-border-light);
}

.divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
  margin: 0 0.25rem;
}

.editor-canvas {
  min-height: 100px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text-primary);
  outline: none;
}

.rich-editor.compact .editor-canvas {
  min-height: 80px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.editor-canvas:empty::before {
  content: 'Enter description...';
  color: var(--color-text-muted);
}

.editor-canvas:focus {
  background: var(--color-bg-card);
}
</style>
