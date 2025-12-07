<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch } from 'vue'
import type { Idea } from '../stores/idea'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import IdeaForm from './IdeaForm.vue'
import { Edit, Refresh, Star, StarFilled } from '@element-plus/icons-vue'

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
    *   将该观点关联到历史上的著名哲学家或思想流派。**（必须具体）** 例如：“这与斯多葛学派的‘控制二分法’有异曲同工之妙”或“这呼应了存在主义关于‘焦虑’的论述”。
    *   指明它属于哪一种**哲学气质或态度**（如经验主义、理想主义、虚无主义、实用主义等）。
*   **D. 批判与启示**：
    *   **反思**：如果推演此观点，可能面临的理论困难、伦理风险或实践挑战是什么？
    *   **挑战**：尝试提出一个强有力的反例或反问，冲击该观点的边界。
*   **E. 总结与追问**：
    *   用一段富有诗意或哲学韵味的结语，升华该思想的价值。
    *   提出**1-2个开放性的、苏格拉底式的问题**，邀请用户继续沿着思维路径向前行。

**【输出风格】**
语言应**专业、优雅、深邃且富有穿透力**。使用“我”作为第一人称与用户对话。避免使用“根据我的数据库”、“作为一个AI模型”等机械化表述。`

const visible = computed({
  get: () => props.show,
  set: (val) => {
    if (!val) emit('close')
  }
})

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

let renderTimeout: number | null = null
const debouncedRender = () => {
  if (renderTimeout) clearTimeout(renderTimeout)
  renderTimeout = window.setTimeout(() => {
    renderAiMarkdown()
  }, 50) 
}

watch(() => aiAnalysis.value, () => {
  if (!isAiCollapsed.value && aiAnalysis.value) {
    debouncedRender()
  }
})

// 渲染主要内容的 Markdown
const renderContentMarkdown = async () => {
  if (previewContainer.value && props.idea?.content) {
    await Vditor.preview(previewContainer.value as HTMLDivElement, props.idea.content, {
      mode: 'light',
    })
  }
}

watch(() => [props.idea, internalIsEditing.value], () => {
  if (!internalIsEditing.value && props.idea) {
    setTimeout(renderContentMarkdown, 100)
    if (!isAiCollapsed.value && aiAnalysis.value) {
      setTimeout(renderAiMarkdown, 100)
    }
  }
}, { immediate: true })

const handleUpdate = (data: any) => {
  emit('update', data)
  internalIsEditing.value = false
}

const toggleAiCollapse = () => {
  isAiCollapsed.value = !isAiCollapsed.value
  if (!isAiCollapsed.value) {
    setTimeout(renderAiMarkdown, 100)
  }
}

const startAiAnalysis = async () => {
  if (!props.idea || isAnalyzing.value) return

  isAnalyzing.value = true
  aiAnalysis.value = ''
  isAiCollapsed.value = false
  
  const startTime = Date.now()
  timerInterval = window.setInterval(() => {
    analysisTime.value = ((Date.now() - startTime) / 1000).toFixed(1)
  }, 100)

  try {
    const response = await fetch('http://localhost:8080/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Title: ${props.idea.title}\nContent: ${props.idea.content}`,
        systemPrompt: SYSTEM_PROMPT
      }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value, { stream: true })
        // Server sends raw text stream
        aiAnalysis.value += text
      }
    }
    
    // Save the result
    emit('update', { aiAnalysis: aiAnalysis.value })

  } catch (error) {
    console.error('AI Analysis failed:', error)
    aiAnalysis.value = '**分析失败**：无法连接到 AI 服务，请检查后端服务是否启动。'
  } finally {
    isAnalyzing.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="internalIsEditing ? '编辑想法' : '想法详情'"
    width="90%"
    style="max-width: 900px;"
    destroy-on-close
    align-center
  >
    <div v-if="internalIsEditing">
      <IdeaForm 
        :edit-data="idea" 
        variant="modal"
        @submit="handleUpdate"
        @cancel="internalIsEditing = false"
      />
    </div>

    <div v-else-if="idea" class="detail-view">
      <div class="detail-header">
        <div class="title-section">
          <h2>{{ idea.title }}</h2>
          <div class="meta-tags">
            <el-tag v-if="idea.mood" effect="plain" round>{{ idea.mood }}</el-tag>
            <el-tag v-if="idea.source" type="info" effect="light">📍 {{ idea.source }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
           <el-button 
            :icon="idea.isFavorite ? StarFilled : Star" 
            circle 
            size="large" 
            :type="idea.isFavorite ? 'warning' : 'default'"
            class="action-btn"
            @click="emit('update', { isFavorite: !idea.isFavorite })" 
          />
          <el-button :icon="Edit" circle size="large" class="action-btn" @click="internalIsEditing = true" />
        </div>
      </div>

      <!-- AI Analysis Section (Moved to top) -->
      <div class="ai-analysis-section">
        <div class="ai-header" @click="toggleAiCollapse">
          <div class="ai-title">
            <h3>🤖 哲学分析师</h3>
            <span v-if="isAnalyzing" class="analyzing-badge">思考中 {{ analysisTime }}s...</span>
          </div>
          <div class="ai-controls">
             <el-button 
               v-if="!isAnalyzing && !aiAnalysis" 
               type="primary" 
               link 
               @click.stop="startAiAnalysis"
             >
               ✨ 开始分析
             </el-button>
             <el-button 
               v-if="aiAnalysis && !isAnalyzing" 
               type="primary" 
               link 
               @click.stop="startAiAnalysis"
             >
               🔄 重新分析
             </el-button>
            <span class="collapse-icon">{{ isAiCollapsed ? '▼' : '▲' }}</span>
          </div>
        </div>
        
        <div v-show="!isAiCollapsed" class="ai-content">
          <div v-if="!aiAnalysis && !isAnalyzing" class="ai-empty">
             <p>点击“开始分析”以获取哲学视角解读</p>
             <el-button type="primary" @click="startAiAnalysis">✨ 开始分析</el-button>
          </div>
          <div v-else ref="aiPreviewContainer" class="markdown-body ai-markdown"></div>
        </div>
      </div>
      
      <div class="detail-content">
        <div ref="previewContainer" class="markdown-body"></div>
      </div>
      
      <div class="detail-footer">
        <div class="tags-list">
          <el-tag v-for="tag in idea.tags" :key="tag" class="tag" effect="plain">#{{ tag }}</el-tag>
        </div>
        <div class="time-info">
          创建于: {{ new Date(idea.createdAt).toLocaleString() }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.title-section h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: var(--el-text-color-primary);
}

.meta-tags {
  display: flex;
  gap: 10px;
}

.detail-content {
  min-height: 200px;
  line-height: 1.6;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.tags-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.time-info {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.ai-analysis-section {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  margin-top: 10px;
}

.ai-header {
  padding: 12px 15px;
  background: var(--el-fill-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-title h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.ai-content {
  padding: 15px;
  background: #fff;
}

.ai-empty {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 20px;
}
</style>
