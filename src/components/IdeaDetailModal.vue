<script setup lang="ts">
import { defineProps, defineEmits, computed, onMounted, ref, watch } from 'vue'
import type { Idea } from '../stores/idea'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import IdeaForm from './IdeaForm.vue'

const props = defineProps<{
  show: boolean
  idea: Idea | null
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'update', data: any): void
}>()

const previewContainer = ref<HTMLElement | null>(null)
const internalIsEditing = ref(false)
const aiAnalysis = ref('')
const isAnalyzing = ref(false)
const isAiCollapsed = ref(false)
const aiPreviewContainer = ref<HTMLElement | null>(null)

watch(() => props.idea, () => {
  if (props.idea) {
    aiAnalysis.value = props.idea.aiAnalysis || ''
    // 如果有 AI 分析内容，默认收起，否则展开
    isAiCollapsed.value = !!props.idea.aiAnalysis
  } else {
    aiAnalysis.value = ''
    isAiCollapsed.value = false
  }
  isAnalyzing.value = false
})

watch(() => props.isEditing, (val) => {
  internalIsEditing.value = !!val
}, { immediate: true })

// 渲染 AI 分析的 Markdown
const renderAiMarkdown = async () => {
  if (aiPreviewContainer.value && aiAnalysis.value) {
    await Vditor.preview(aiPreviewContainer.value, aiAnalysis.value, {
      mode: 'light',
    })
  }
}

watch(() => [aiAnalysis.value, isAiCollapsed.value], () => {
  if (!isAiCollapsed.value && aiAnalysis.value) {
    // 使用 nextTick 确保 DOM 已更新
    setTimeout(renderAiMarkdown, 0)
  }
}, { flush: 'post' })

const analyzeIdea = async () => {
  if (!props.idea) return
  isAnalyzing.value = true
  isAiCollapsed.value = false // 展开分析区域
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 200000) // 200s timeout

  try {
    const msg = `标题：${props.idea.title}\n内容：${props.idea.content}`
    const res = await fetch(`http://localhost:8080/chat/sync?message=${encodeURIComponent(msg)}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
    const text = await res.text()
    aiAnalysis.value = text
    // Save analysis to the idea
    emit('update', { ...props.idea, aiAnalysis: text })
  } catch (e: any) {
    console.error(e)
    if (e.name === 'AbortError') {
      aiAnalysis.value = "分析超时（超过200秒），请稍后再试。"
    } else {
      aiAnalysis.value = "分析失败，请稍后再试。"
    }
  } finally {
    isAnalyzing.value = false
    clearTimeout(timeoutId)
  }
}

// 监听显示状态，确保每次打开时重置编辑状态
watch(() => props.show, (val) => {
  if (val) {
    internalIsEditing.value = !!props.isEditing
  }
})

const formattedDate = computed(() => {
  if (!props.idea) return ''
  return new Date(props.idea.createdAt).toLocaleDateString() + ' ' + 
         new Date(props.idea.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
})

watch(() => [props.show, props.idea, internalIsEditing.value], async ([show, idea, isEditing]) => {
  if (show && idea && !isEditing && previewContainer.value) {
    // 使用 Vditor 的预览渲染
    await Vditor.preview(previewContainer.value, (idea as Idea).content, {
      mode: 'light',
    })
  }
}, { flush: 'post' })

const toggleEdit = () => {
  internalIsEditing.value = !internalIsEditing.value
}

const handleFormSubmit = (data: any) => {
  emit('update', data)
  internalIsEditing.value = false
}

const handleFormCancel = () => {
  if (props.isEditing) {
    emit('close')
  } else {
    internalIsEditing.value = false
  }
}
</script>

<template>
  <div v-if="show && idea" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop :style="{ borderTopColor: idea.color !== '#ffffff' ? idea.color : '#eee' }">
      
      <!-- 编辑模式 -->
      <div v-if="internalIsEditing" class="edit-mode-wrapper">
        <IdeaForm 
          :edit-data="idea" 
          variant="modal"
          @submit="handleFormSubmit" 
          @cancel="handleFormCancel"
        />
      </div>

      <!-- 预览模式 -->
      <div v-else class="preview-mode-wrapper">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ idea.title }} <span v-if="idea.mood">{{ idea.mood }}</span></h2>
            <div class="meta-row">
              <span class="modal-date">{{ formattedDate }}</span>
              <span v-if="idea.source" class="source-badge">📍 {{ idea.source }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="edit-btn" @click="toggleEdit" title="编辑">✏️</button>
            <button class="close-btn" @click="emit('close')">&times;</button>
          </div>
        </div>

        <div class="top-actions">
            <button 
              class="action-btn ai-btn" 
              @click="analyzeIdea" 
              :disabled="isAnalyzing" 
              title="AI 分析"
            >
               ✨ AI 分析
            </button>
            <button 
              class="action-btn favorite" 
              :class="{ active: idea.isFavorite }" 
              @click="emit('update', { ...idea, isFavorite: !idea.isFavorite })"
              title="收藏"
            >
              {{ idea.isFavorite ? '★ 已收藏' : '☆ 收藏' }}
            </button>
        </div>
        
        <!-- AI Analysis Section -->
        <div v-if="aiAnalysis || isAnalyzing" class="ai-analysis-section" :class="{ collapsed: isAiCollapsed }">
           <div class="ai-header" @click="isAiCollapsed = !isAiCollapsed">
             <h3>
               🤖 AI 深度分析
               <span class="collapse-icon" :class="{ rotated: isAiCollapsed }">▼</span>
             </h3>
           </div>
           <div class="ai-content" v-show="!isAiCollapsed">
             <div v-if="isAnalyzing" class="analyzing-state">
               AI 正在深度思考中... (约200秒)
             </div>
             <div v-else ref="aiPreviewContainer" class="analysis-text vditor-reset"></div>
           </div>
        </div>
        
        <div ref="previewContainer" class="modal-body vditor-reset"></div>
        
        <div class="modal-footer">
          <div class="tags">
            <span v-for="tag in idea.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ... existing styles ... */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.modal-actions {
  display: flex;
  gap: 10px;
}
/* ... */
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
  font-size: 1.5rem;
  color: var(--text-main);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.source-badge {
  font-size: 0.85rem;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  color: #666;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.edit-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: transform 0.2s;
}

.edit-btn:hover {
  transform: scale(1.1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
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

.ai-analysis-section {
  margin: 20px 0;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.ai-header {
  padding: 10px 15px;
  background: #e3f2fd;
  border-bottom: 1px solid #bbdefb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ai-header:hover {
  background: #d0e7fb;
}

.ai-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.collapse-icon {
  font-size: 0.8rem;
  transition: transform 0.3s;
  opacity: 0.7;
}

.collapse-icon.rotated {
  transform: rotate(-90deg);
}

.ai-content {
  padding: 15px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #37474f;
  white-space: pre-wrap;
}

.ai-analysis-section.collapsed {
  height: auto;
}

.ai-analysis-section.collapsed .ai-content {
  display: none;
}

.analyzing-state {
  color: #78909c;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analyzing-state::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid #78909c;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.95rem;
  font-weight: 500;
}

.ai-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(118, 75, 162, 0.4);
}

.ai-btn:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

.action-btn.favorite {
  padding: 6px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: white;
  color: #7f8c8d;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.action-btn.favorite:hover {
  border-color: #ffd700;
  color: #f1c40f;
}

.action-btn.favorite.active {
  background: #fff9c4;
  border-color: #ffd700;
  color: #f39c12;
}

.top-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
</style>
