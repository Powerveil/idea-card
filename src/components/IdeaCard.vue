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

// 简单的 Markdown 解析器（基于原始逻辑改进）
const parsedContent = computed(() => {
  const text = props.idea.content.substring(0, 100) + (props.idea.content.length > 100 ? '...' : '')
  
  // 1. 首先转义 HTML 特殊字符
  const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // 2. 按行拆分
  const lines = escapedText.split('\n')

  // 3. 处理每一行
  const processedLines = lines.map(line => {
    let content = line
    let isList = false
    let headingLevel = 0
    
    // 检查标题
    const headingMatch = content.match(/^(\s*)(#{1,6})\s+(.*)/)
    if (headingMatch) {
      headingLevel = headingMatch[2].length
      content = headingMatch[3]
    } else {
      // 检查列表项（支持 - 和 *）
      const listMatch = content.match(/^(\s*)([-*])\s+(.*)/)
      if (listMatch) {
        isList = true
        content = listMatch[3] // 提取列表标记后的内容
      }
    }
    
    // 处理行内样式
    // 代码块
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // 粗体 - 支持中文字符和符号
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    
    // 斜体 - 避免匹配跨行的 *（防止与粗体冲突）
    content = content.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3')
    
    // 包裹标签
    if (headingLevel > 0) {
      return `<h${headingLevel} style="margin: 0.2em 0 0.1em; font-size: ${1.2 - (headingLevel * 0.05)}em; line-height: 1.2;">${content}</h${headingLevel}>`
    }

    if (isList) {
      return `<ul style="margin: 0; padding-left: 20px;"><li>${content}</li></ul>`
    }
    
    // 对于普通文本，如果是空行（仅换行符），返回空字符串以避免双重换行
    if (!content.trim()) return ''
    
    return `<div style="margin-bottom: 4px;">${content}</div>`
  })
  
  // 4. 合并所有行，不使用 <br>，因为现在使用 div 进行结构化布局
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
      <div class="card-title">
        {{ idea.title }}
        <span v-if="idea.mood" class="mood-badge" title="心情">{{ idea.mood }}</span>
      </div>
      <div class="card-date">{{ formattedDate }}</div>
    </div>
    <div class="card-content" v-html="parsedContent" @click="emit('preview', idea.id)" style="cursor: pointer;"></div>
    <div class="card-tags">
      <span v-if="idea.source" class="source-tag" title="来源">📍 {{ idea.source }}</span>
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
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-badge {
  font-size: 1.2rem;
  line-height: 1;
}

.card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.card-content {
  margin-bottom: 15px;
  color: #555;
  line-height: 1.5;
  font-size: 0.95rem;
  flex: 1; /* Push actions to bottom */
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.source-tag {
  font-size: 0.8rem;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  border: 1px dashed #ccc;
}

.card-tag {
  background-color: #e9ecef;
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
  margin-top: auto; /* Ensure it stays at bottom */
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
