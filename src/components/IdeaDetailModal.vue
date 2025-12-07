<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch } from 'vue'
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
const analysisTime = ref('0.0')
let timerInterval: number | null = null

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
  analysisTime.value = '0.0'
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})

watch(() => props.isEditing, (val) => {
  internalIsEditing.value = !!val
}, { immediate: true })

// 渲染 AI 分析的 Markdown
const renderAiMarkdown = async () => {
  if (aiPreviewContainer.value && aiAnalysis.value) {
    await Vditor.preview(aiPreviewContainer.value as HTMLDivElement, aiAnalysis.value, {
      mode: 'light',
    })
  }
}

// 使用防抖优化渲染频率，但对于流式输出，我们需要更频繁的更新以体现"实时感"
// Vditor 的 preview 方法可能比较重，我们尝试降低防抖时间，或者在内容变动较小时不防抖
let renderTimeout: number | null = null
const debouncedRender = () => {
  if (renderTimeout) clearTimeout(renderTimeout)
  // 降低防抖时间到 50ms，提高响应速度
  renderTimeout = window.setTimeout(() => {
    renderAiMarkdown()
  }, 50) 
}

watch(() => aiAnalysis.value, () => {
  if (!isAiCollapsed.value && aiAnalysis.value) {
    debouncedRender()
  }
})

const SYSTEM_PROMPT = `### **哲学思想分析师提示词**

**【角色定义】**
你是一位**人类思想的对话者与哲学分析师**，你的核心身份是“思想镜鉴”。你并非真理的裁判官，而是智慧脉络的勘探者与思维结构的解读者。你具备以下素养：
1.  **广博的哲思传统**：精通从古希腊、先秦到现代分析哲学、现象学、后现代主义等主要思想流派的核心方法与概念工具。
2.  **深度共情与超然客观**：你能深入体察任何观点背后的情感、经验与动机，同时又能抽离出来，以逻辑和理性对其进行冷静审视。
3.  **苏格拉底式的追问者**：你擅长通过提问揭示预设、澄清概念、检验一致性，旨在激发更深层的思考，而非给出终结性答案。

**【核心任务】**
对用户提供的**任何一段陈述、观点、疑问或感慨**，进行多维度、结构化的哲学分析。你将每一段话都视为一个潜在的“思想样本”，从中萃取其智慧成分，分析其逻辑结构，并评估其在人类思想图谱中的位置与价值。

**【分析框架与约束】**
每次分析需遵循以下原则与结构：

**1. 原则（必须遵守）：**
*   **价值中立**：不预先判定任何观点的“对错”，而是分析其“何以成立”及“成立的条件”。
*   **语境敏感**：紧密结合用户表述的语境（如情感色彩、潜在经历）进行解读，避免脱离背景的抽象批判。
*   **建设性指向**：分析的终点是**启发与拓展**，而非否定与终结。旨在打开新的思考维度。

**2. 分析结构（按顺序输出）：**
*   **A. 核心主张提炼**：用一句高度精炼的哲学式命题，复述或点明用户话语中的核心思想内核。
*   **B. 逻辑与概念分析**：
    *   **预设检查**：识别该观点背后未被言明的前提假设（关于世界、人性、知识、价值等）。
    *   **概念澄清**：解析其中关键概念（如“自由”、“幸福”、“意义”、“真实”）的潜在定义与模糊地带。
    *   **逻辑一致性**：探讨观点内部是否存在矛盾，或与人们普遍持有的其他信念是否冲突。
*   **C. 思想谱系定位**：
    *   将该观点与历史上的某种哲学立场、思想家或思想传统进行**共鸣或对比**（例如：“您的这种感受，与存在主义者对‘焦虑’的描述有相通之处……”或：“这与功利主义的计算逻辑不同，更接近美德伦理学的关怀……”）。
    *   指出这是一种**常见的智慧形态**，还是一种**独特而深刻的个人洞见**。
*   **D. 蕴含与启示**：
    *   **推演**：如果此观点为真，它将导向何种生活态度、伦理选择或对社会世界的看法？
    *   **挑战**：它可能面临的最强有力的哲学性质疑是什么？
*   **E. 升华与提问**：
    *   以一句凝练的、富有哲学意味的总结，升华这段思考的价值。
    *   最后，提出**1-2个开放性的、苏格拉底式的问题**，邀请用户沿着已开辟的思想路径继续前行。

**【输出风格】**
语言应**专业、清晰、富有洞察力且充满敬意**。使用“您”作为称呼，体现对思考者的尊重。分析应像一份精密的“思想体检报告”，既有术语的精确，又有对话的温度。避免使用浮夸的赞誉，也避免冷漠的拆解。

**【最终指令】**
现在，请将上述所有原则内化。我将开始向您呈现人类思想的片段。请您戴上哲学分析师的透镜，开始工作。`

const analyzeIdea = async () => {
  if (!props.idea) return
  isAnalyzing.value = true
  isAiCollapsed.value = false // 展开分析区域
  aiAnalysis.value = '' // 清空旧内容
  
  // Start timer
  const startTime = Date.now()
  analysisTime.value = '0.0'
  timerInterval = window.setInterval(() => {
    analysisTime.value = ((Date.now() - startTime) / 1000).toFixed(1)
  }, 100)
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 200000) // 200s timeout

  try {
    const msg = `标题：${props.idea.title}\n内容：${props.idea.content}`
    const res = await fetch(`http://localhost:8080/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/stream'
      },
      body: JSON.stringify({
        message: msg,
        systemPrompt: SYSTEM_PROMPT
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
    
    if (!res.body) throw new Error('No response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      
      // 简单判断：如果包含 data: 前缀，尝试作为 SSE 处理；否则视为纯文本流
      // 注意：后端现在返回的是 text/stream 纯文本流，直接追加即可
      // 为了兼容可能的 SSE 格式，保留简单判断，但优先保证纯文本换行符不丢失
      
      if (chunk.includes('data:') && res.headers.get('content-type')?.includes('event-stream')) {
         const lines = chunk.split('\n')
         for (const line of lines) {
           if (line.startsWith('data:')) {
               const content = line.slice(5).trim()
               if (content === '[DONE]') continue
               aiAnalysis.value += content
           }
         }
      } else {
         // 纯文本流模式：直接追加
         const text = chunk
         
         // 关键修改：直接赋值触发 Vue 响应式更新
         // 之前可能因为 += 操作在某些情况下（尤其是配合 buffer 时）没有触发 watch
         // 或者因为 chunk 太小导致视觉上没变化
         
         // 强制更新策略：
         // 1. 更新数据
         aiAnalysis.value = aiAnalysis.value + text
         
         // 2. 手动调用渲染（虽然 watch 会调用，但这里双重保险，且不受 watch flush 影响）
         // 如果 chunk 包含关键字符（如换行），立即渲染可能更好
         if (text.includes('\n') || aiAnalysis.value.length % 10 === 0) {
             debouncedRender()
         }
      }
    }

    // Save analysis to the idea
    emit('update', { ...props.idea, aiAnalysis: aiAnalysis.value })
  } catch (e: any) {
    console.error(e)
    if (e.name === 'AbortError') {
      aiAnalysis.value += "\n\n[分析超时（超过200秒）]"
    } else {
      aiAnalysis.value += "\n\n[分析失败，请稍后再试]"
    }
  } finally {
    isAnalyzing.value = false
    clearTimeout(timeoutId)
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
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
    await Vditor.preview(previewContainer.value as HTMLDivElement, (idea as Idea).content, {
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
             <div v-if="isAnalyzing && !aiAnalysis" class="analyzing-state">
               AI 正在深度思考中... ({{ analysisTime }}s)
             </div>
             <div v-show="aiAnalysis" ref="aiPreviewContainer" class="analysis-text vditor-reset"></div>
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
  line-height: 1.5;
  color: #37474f;
  /* 移除 white-space: pre-wrap，让 Vditor 负责排版 */
}

/* 修复 Vditor 预览的段落间距 */
.analysis-text :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

.analysis-text :deep(h1), 
.analysis-text :deep(h2), 
.analysis-text :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
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
