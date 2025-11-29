<script setup lang="ts">
import { computed } from 'vue'
import type { Idea } from '../stores/idea'

const props = defineProps<{
  idea: Idea
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'favorite', id: string): void
  (e: 'edit', id: string): void
  (e: 'preview', id: string): void
}>()

// Simple Markdown Parser (from original logic)
const parsedContent = computed(() => {
  const text = props.idea.content.substring(0, 100) + (props.idea.content.length > 100 ? '...' : '')
  
  // 1. Escape HTML special characters first
  const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // 2. Split into lines
  const lines = escapedText.split('\n')

  // 3. Process each line
  const processedLines = lines.map(line => {
    let content = line
    let isList = false
    let headingLevel = 0
    
    // Check for headings
    const headingMatch = content.match(/^(\s*)(#{1,6})\s+(.*)/)
    if (headingMatch) {
      headingLevel = headingMatch[2].length
      content = headingMatch[3]
    } else {
      // Check for list item (supports - and *)
      const listMatch = content.match(/^(\s*)([-*])\s+(.*)/)
      if (listMatch) {
        isList = true
        content = listMatch[3] // Extract content after list marker
      }
    }
    
    // Process inline styles
    // Code blocks
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Bold - supports Chinese characters and symbols
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    
    // Italic - avoid matching across * used in bold
    content = content.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3')
    
    // Wrap in tags
    if (headingLevel > 0) {
      return `<h${headingLevel} style="margin: 0.2em 0 0.1em; font-size: ${1.2 - (headingLevel * 0.05)}em; line-height: 1.2;">${content}</h${headingLevel}>`
    }

    if (isList) {
      return `<ul style="margin: 0; padding-left: 20px;"><li>${content}</li></ul>`
    }
    
    // For normal text, if it's empty (just newline), return empty string to avoid double breaks
    if (!content.trim()) return ''
    
    return `<div style="margin-bottom: 4px;">${content}</div>`
  })
  
  // 4. Join lines without <br> since we use divs for structure now
  return processedLines.filter(line => line !== '').join('')
})

const formattedDate = computed(() => {
  return new Date(props.idea.createdAt).toLocaleDateString() + ' ' + 
         new Date(props.idea.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
})
</script>

<template>
  <div class="card" :style="{ borderTopColor: idea.color !== '#ffffff' ? idea.color : '#eee' }">
    <div class="card-header" @click="emit('preview', idea.id)" style="cursor: pointer;">
      <div class="card-title">{{ idea.title }}</div>
      <div class="card-date">{{ formattedDate }}</div>
    </div>
    <div class="card-content" v-html="parsedContent" @click="emit('preview', idea.id)" style="cursor: pointer;"></div>
    <div class="card-tags">
      <span v-for="tag in idea.tags" :key="tag" class="card-tag">#{{ tag }}</span>
    </div>
    <div class="card-actions">
      <button class="action-btn preview" @click="emit('preview', idea.id)" title="预览" aria-label="预览">👁️</button>
      <button class="action-btn edit" @click="emit('edit', idea.id)" title="编辑" aria-label="编辑">✏️</button>
      <button 
        class="action-btn favorite" 
        :class="{ active: idea.isFavorite }" 
        @click="emit('favorite', idea.id)"
        title="收藏"
        aria-label="收藏"
      >
        {{ idea.isFavorite ? '★' : '☆' }}
      </button>
      <button class="action-btn delete" @click="emit('delete', idea.id)" title="删除" aria-label="删除">🗑️</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 5px solid transparent;
  position: relative;
  height: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-right: 10px;
  word-break: break-word;
}

.card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.card-content {
  flex: 1;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #555;
  overflow: hidden;
  word-wrap: break-word;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.card-tag {
  background: #eef2f7;
  color: var(--primary-color);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: color 0.2s;
  padding: 5px;
}

.action-btn:hover {
  color: var(--primary-color);
}

.action-btn.delete:hover {
  color: var(--danger);
}

.action-btn.favorite.active {
  color: var(--warning);
}
</style>
