<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const COLORS = [
  { value: '#ffffff', name: '白色' },
  { value: '#fff3cd', name: '黄色' },
  { value: '#d4edda', name: '绿色' },
  { value: '#f8d7da', name: '红色' },
  { value: '#d1ecf1', name: '蓝色' },
  { value: '#e2e3e5', name: '灰色' },
  { value: '#e8daef', name: '紫色' }
]

const SOURCES = ['散步', '洗澡', '睡前', '通勤', '阅读', '运动', '聊天', '工作', '其他']
const MOODS = [
  { value: '🤩', label: '兴奋' },
  { value: '😌', label: '平静' },
  { value: '🤔', label: '困惑' },
  { value: '😤', label: '焦虑' },
  { value: '💡', label: '顿悟' },
  { value: '😴', label: '疲惫' }
]

const props = defineProps<{
  editData?: {
    id: string
    title: string
    content: string
    tags: string[]
    color: string
    source?: string
    mood?: string
  } | null
  variant?: 'sidebar' | 'modal'
}>()

const emit = defineEmits<{
  (e: 'submit', data: { title: string, content: string, tags: string[], color: string, source?: string, mood?: string }): void
  (e: 'cancel'): void
}>()

const formData = reactive({
  title: '',
  content: '',
  tags: [] as string[],
  color: COLORS[0].value,
  source: '',
  mood: ''
})

const tagInput = ref('')
const vditor = ref<Vditor | null>(null)
const vditorId = `vditor-${Math.random().toString(36).substr(2, 9)}`

const resetForm = () => {
  formData.title = ''
  formData.content = ''
  formData.tags = []
  formData.color = COLORS[0].value
  formData.source = ''
  formData.mood = ''
  tagInput.value = ''
  if (vditor.value) {
    vditor.value.setValue('')
  }
}

// 与 props 同步以进入编辑模式
watch(() => props.editData, (newVal) => {
  if (newVal) {
    formData.title = newVal.title
    formData.content = newVal.content
    formData.tags = [...newVal.tags]
    formData.color = newVal.color
    formData.source = newVal.source || ''
    formData.mood = newVal.mood || ''
    if (vditor.value) {
      vditor.value.setValue(newVal.content)
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  formData.tags = formData.tags.filter(t => t !== tag)
}

const handleSubmit = () => {
  if (vditor.value) {
    formData.content = vditor.value.getValue()
  }
  emit('submit', { ...formData })
  if (!props.editData) {
    resetForm()
  }
}

const vditorOptions = {
  height: 360,
  toolbarConfig: {
    pin: false, // Disable pin to prevent overlapping
  },
  cache: {
    enable: false,
  },
  toolbar: [
    'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
    'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
    'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
    'upload', 'record', 'table', '|',
    'undo', 'redo', '|',
    'fullscreen', 'edit-mode', 'both', 'preview'
  ],
}

onMounted(() => {
  vditor.value = new Vditor(vditorId, {
    ...vditorOptions,
    after: () => {
      if (props.editData) {
        vditor.value?.setValue(props.editData.content)
      }
    },
    input: (value) => {
      formData.content = value
    }
  })
})
</script>

<template>
  <aside class="card-form" :class="{ 'modal-variant': variant === 'modal' }">
    <h2>{{ editData ? '编辑想法' : '添加新想法' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">标题 *</label>
        <input 
          id="title" 
          v-model="formData.title" 
          type="text" 
          class="form-control" 
          maxlength="50" 
          required 
          placeholder="输入标题 (最多50字)"
        >
      </div>
      
      <div class="form-group">
        <label for="content">内容 (Markdown)</label>
        <div :id="vditorId"></div>
      </div>

      <div class="form-group">
        <label>标签</label>
        <div class="tags-input-container">
          <div v-for="tag in formData.tags" :key="tag" class="tag-chip">
            {{ tag }} <span @click="removeTag(tag)">×</span>
          </div>
          <input 
            v-model="tagInput" 
            @keydown.enter.prevent="addTag" 
            @keydown.space.prevent="addTag"
            type="text" 
            placeholder="输入标签按回车添加"
          >
        </div>
      </div>

      <div class="form-group">
        <label>颜色标记</label>
        <div class="color-picker">
          <div 
            v-for="color in COLORS" 
            :key="color.value"
            class="color-option"
            :class="{ selected: formData.color === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="formData.color = color.value"
            :title="color.name"
          ></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label>心情状态</label>
          <div class="mood-picker">
            <div 
              v-for="m in MOODS" 
              :key="m.value"
              class="mood-option"
              :class="{ selected: formData.mood === m.value }"
              @click="formData.mood = m.value"
              :title="m.label"
            >
              {{ m.value }}
            </div>
          </div>
        </div>

        <div class="form-group half">
          <label>想法来源</label>
          <div class="source-picker">
            <div 
              v-for="s in SOURCES" 
              :key="s"
              class="source-option"
              :class="{ selected: formData.source === s }"
              @click="formData.source = s"
            >
              {{ s }}
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn">{{ editData ? '更新卡片' : '添加卡片' }}</button>
        <button 
          v-if="editData" 
          type="button" 
          class="btn btn-secondary" 
          @click="emit('cancel')"
        >取消</button>
      </div>
    </form>
  </aside>
</template>

<style scoped>
.card-form {
  background: var(--card-bg);
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.card-form.modal-variant {
  position: static;
  box-shadow: none;
  padding: 20px;
  background: transparent;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-main);
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-option.selected {
  transform: scale(1.2);
  border: 2px solid var(--text-main);
}

.tags-input-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  background: white;
}

.tags-input-container input {
  border: none;
  padding: 5px;
  flex: 1;
  min-width: 60px;
  outline: none;
}

.tag-chip {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag-chip span {
  cursor: pointer;
  font-weight: bold;
}

.form-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.form-group.half {
  flex: 1;
  min-width: 200px;
}

.mood-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mood-option {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: transform 0.2s, background-color 0.2s;
  line-height: 1;
}

.mood-option:hover {
  transform: scale(1.2);
  background-color: rgba(0,0,0,0.05);
}

.mood-option.selected {
  transform: scale(1.2);
  background-color: rgba(0,0,0,0.1);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.source-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-option {
  font-size: 0.9rem;
  padding: 4px 10px;
  background-color: #f0f0f0;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.source-option:hover {
  background-color: #e0e0e0;
}

.source-option.selected {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
}

.btn-secondary {
  background: var(--text-secondary);
}
</style>
