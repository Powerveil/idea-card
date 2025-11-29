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

const props = defineProps<{
  editData?: {
    id: string
    title: string
    content: string
    tags: string[]
    color: string
  } | null
  variant?: 'sidebar' | 'modal'
}>()

const emit = defineEmits<{
  (e: 'submit', data: { title: string, content: string, tags: string[], color: string }): void
  (e: 'cancel'): void
}>()

const formData = reactive({
  title: '',
  content: '',
  tags: [] as string[],
  color: COLORS[0].value
})

const tagInput = ref('')
const vditor = ref<Vditor | null>(null)
const vditorId = `vditor-${Math.random().toString(36).substr(2, 9)}`

const resetForm = () => {
  formData.title = ''
  formData.content = ''
  formData.tags = []
  formData.color = COLORS[0].value
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

onMounted(() => {
  vditor.value = new Vditor(vditorId, {
    height: 360,
    toolbarConfig: {
      pin: true,
    },
    cache: {
      enable: false,
    },
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
  padding: 0;
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
  border-color: #333;
  transform: scale(1.1);
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

.form-actions {
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
