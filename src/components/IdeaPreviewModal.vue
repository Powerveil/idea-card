<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { Idea } from '../stores/idea'

const props = defineProps<{
  show: boolean
  idea: Idea | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const parsedContent = computed(() => {
  if (!props.idea) return ''
  const text = props.idea.content
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  
  // Enhanced Markdown Parsing
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.*?)`/g, '<code>$1</code>')
  html = html.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
  html = html.replace(/\n/g, '<br>')
  
  // Fix consecutive lists
  html = html.replace(/<\/ul><br><ul>/g, '')
  
  return html
})

const formattedDate = computed(() => {
  if (!props.idea) return ''
  return new Date(props.idea.createdAt).toLocaleDateString() + ' ' + 
         new Date(props.idea.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
})
</script>

<template>
  <div v-if="show && idea" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop :style="{ borderTopColor: idea.color !== '#ffffff' ? idea.color : '#eee' }">
      <div class="modal-header">
        <div class="modal-title-group">
          <h2>{{ idea.title }}</h2>
          <div class="modal-date">{{ formattedDate }}</div>
        </div>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body" v-html="parsedContent"></div>
      
      <div class="modal-footer">
        <div class="tags">
          <span v-for="tag in idea.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border-top: 6px solid #eee;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-title-group h2 {
  margin: 0 0 5px 0;
  color: var(--text-main);
}

.modal-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
  margin-left: 20px;
}

.close-btn:hover {
  color: var(--text-main);
}

.modal-body {
  line-height: 1.8;
  color: var(--text-main);
  font-size: 1.05rem;
  margin-bottom: 20px;
}

/* Markdown Styles */
:deep(.modal-body h1) { font-size: 1.5rem; margin: 1em 0 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
:deep(.modal-body h2) { font-size: 1.3rem; margin: 1em 0 0.5em; }
:deep(.modal-body h3) { font-size: 1.1rem; margin: 1em 0 0.5em; }
:deep(.modal-body p) { margin-bottom: 1em; }
:deep(.modal-body code) { background: #f5f7fa; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #e83e8c; }
:deep(.modal-body ul) { margin-left: 20px; margin-bottom: 1em; }
:deep(.modal-body blockquote) { border-left: 4px solid #ddd; padding-left: 15px; color: #666; margin: 1em 0; }

.modal-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  background: #eef2f7;
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
