<script setup lang="ts">
import { computed } from 'vue'
import type { Idea } from '../stores/idea'
import { Delete, Star, Edit, View, StarFilled } from '@element-plus/icons-vue'

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
  <el-card 
    class="idea-card" 
    shadow="hover" 
    :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }"
  >
    <div 
      class="card-color-strip" 
      :style="{ backgroundColor: idea.color !== '#ffffff' ? idea.color : '#eee' }"
    ></div>
    
    <div class="card-content-wrapper">
      <div class="card-header" @click="emit('preview', idea.id)">
        <div class="card-title">
          <h3>{{ idea.title }}</h3>
          <el-tag v-if="idea.mood" size="default" effect="plain" round>{{ idea.mood }}</el-tag>
        </div>
        <div class="card-date">{{ formattedDate }}</div>
      </div>
      
      <div 
        class="card-preview" 
        v-html="parsedContent" 
        @click="emit('preview', idea.id)"
      ></div>
      
      <div class="card-footer">
        <div class="card-tags">
          <el-tag v-if="idea.source" size="default" type="info" effect="light" class="source-tag">
            📍 {{ idea.source }}
          </el-tag>
          <el-tag 
            v-for="tag in idea.tags" 
            :key="tag" 
            size="default" 
            effect="plain"
          >
            #{{ tag }}
          </el-tag>
        </div>
        
        <div class="card-actions">
          <el-button-group>
            <el-button :icon="View" circle size="large" @click="emit('preview', idea.id)" />
            <el-button :icon="Edit" circle size="large" @click="emit('edit', idea.id)" />
            <el-button 
              :icon="idea.isFavorite ? StarFilled : Star" 
              circle 
              size="large" 
              :type="idea.isFavorite ? 'warning' : 'default'"
              @click="emit('favorite', idea.id)" 
            />
            <el-button :icon="Delete" circle size="large" type="danger" plain @click="emit('delete', idea.id)" />
          </el-button-group>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.idea-card {
  height: 100%;
  transition: transform 0.2s;
  border: none;
}

.idea-card:hover {
  transform: translateY(-2px);
}

.card-color-strip {
  height: 6px;
  width: 100%;
}

.card-content-wrapper {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  margin-bottom: 10px;
  cursor: pointer;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.card-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.card-date {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
}

.card-preview {
  flex: 1;
  color: var(--el-text-color-regular);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 15px;
  cursor: pointer;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  flex-wrap: wrap;
  gap: 10px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.source-tag {
  margin-right: 2px;
}

.card-actions {
  margin-left: auto;
}
</style>
