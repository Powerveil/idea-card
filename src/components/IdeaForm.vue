<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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

  if (!formData.title.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  if (!formData.content.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }

  emit('submit', { ...formData })
}

onMounted(() => {
  vditor.value = new Vditor(vditorId, {
    height: 360,
    width: '100%',
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
    toolbar: [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'upload', 'record', 'table', '|',
      'undo', 'redo', '|',
      'fullscreen', 'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help',
        ],
      }
    ]
  })
})
</script>

<template>
  <el-form :model="formData" label-position="top" class="idea-form">
    <el-form-item label="标题">
      <el-input 
        v-model="formData.title" 
        placeholder="给你的想法起个标题..." 
        size="large"
        clearable
      />
    </el-form-item>

    <el-form-item label="内容">
      <div :id="vditorId" class="vditor-wrapper"></div>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12" :xs="24">
        <el-form-item label="标签">
          <div class="tags-container">
            <el-tag
              v-for="tag in formData.tags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="formData.tags.length < 5"
              v-model="tagInput"
              class="input-new-tag"
              size="small"
              placeholder="+ 标签 (回车添加)"
              @keyup.enter="addTag"
              @blur="addTag"
            />
          </div>
        </el-form-item>
      </el-col>
      
      <el-col :span="12" :xs="24">
        <el-form-item label="颜色">
          <div class="color-options">
            <div 
              v-for="c in COLORS" 
              :key="c.value" 
              class="color-circle"
              :style="{ backgroundColor: c.value }"
              :class="{ selected: formData.color === c.value }"
              @click="formData.color = c.value"
              :title="c.name"
            ></div>
          </div>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12" :xs="24">
        <el-form-item label="来源">
          <el-select v-model="formData.source" placeholder="选择灵感来源" style="width: 100%" clearable>
             <el-option v-for="s in SOURCES" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-col>
      
      <el-col :span="12" :xs="24">
        <el-form-item label="心情">
          <el-radio-group v-model="formData.mood">
            <el-radio-button v-for="m in MOODS" :key="m.value" :label="m.value" :value="m.value">
              {{ m.value }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="form-actions">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存想法</el-button>
    </div>
  </el-form>
</template>

<style scoped>
.idea-form {
  padding: 10px;
}

.vditor-wrapper {
  margin-top: 5px;
  border-radius: 4px;
  overflow: hidden;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.input-new-tag {
  width: 120px;
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.color-circle.selected {
  border-color: var(--el-color-primary);
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

/* Vditor overrides if needed */
:deep(.vditor) {
  border-color: var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}
</style>
