<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Idea } from '../stores/idea'

interface Props {
  show: boolean
  importData: Idea[]
  existingTitles: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', selectedItems: Idea[]): void
}>()

// Selection state
const selectedIds = ref<Set<string>>(new Set())

// Categorize data
const conflicts = computed(() => props.importData.filter(item => props.existingTitles.has(item.title)))
const newItems = computed(() => props.importData.filter(item => !props.existingTitles.has(item.title)))

const visible = computed({
  get: () => props.show,
  set: (val) => {
    if (!val) emit('close')
  }
})

// Initialize selection when data changes
watch(() => props.importData, () => {
  selectedIds.value = new Set(newItems.value.map(i => i.id))
}, { immediate: true })

// Toggle selection
const toggleSelection = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const toggleAllNew = () => {
  const allNewIds = newItems.value.map(i => i.id)
  const allSelected = allNewIds.every(id => selectedIds.value.has(id))
  
  if (allSelected) {
    allNewIds.forEach(id => selectedIds.value.delete(id))
  } else {
    allNewIds.forEach(id => selectedIds.value.add(id))
  }
}

const toggleAllConflicts = () => {
  const allConflictIds = conflicts.value.map(i => i.id)
  const allSelected = allConflictIds.every(id => selectedIds.value.has(id))
  
  if (allSelected) {
    allConflictIds.forEach(id => selectedIds.value.delete(id))
  } else {
    allConflictIds.forEach(id => selectedIds.value.add(id))
  }
}

const handleConfirm = () => {
  const selectedItems = props.importData.filter(item => selectedIds.value.has(item.id))
  emit('confirm', selectedItems)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="导入数据选择"
    width="600px"
    destroy-on-close
    align-center
  >
    <div class="modal-body">
      <div v-if="newItems.length > 0" class="section">
        <div class="section-header">
          <h3>🆕 新记忆卡片 ({{ newItems.length }})</h3>
          <el-button type="primary" link @click="toggleAllNew">全选/取消</el-button>
        </div>
        <div class="item-list">
          <div 
            v-for="item in newItems" 
            :key="item.id" 
            class="import-item new"
            :class="{ selected: selectedIds.has(item.id) }"
            @click="toggleSelection(item.id)"
          >
            <el-checkbox 
              :model-value="selectedIds.has(item.id)" 
              @change="toggleSelection(item.id)"
              @click.stop
            />
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-meta">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="conflicts.length > 0" class="section">
        <div class="section-header">
          <h3>⚠️ 标题冲突 ({{ conflicts.length }})</h3>
          <el-button type="warning" link @click="toggleAllConflicts">全选/取消</el-button>
        </div>
        <div class="conflict-notice">注意：选中将覆盖现有同名卡片</div>
        <div class="item-list">
          <div 
            v-for="item in conflicts" 
            :key="item.id" 
            class="import-item conflict"
            :class="{ selected: selectedIds.has(item.id) }"
            @click="toggleSelection(item.id)"
          >
            <el-checkbox 
              :model-value="selectedIds.has(item.id)" 
              @change="toggleSelection(item.id)"
              @click.stop
            />
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-meta">现有内容将被覆盖</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedIds.size === 0">
          确认导入 ({{ selectedIds.size }})
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}

.section {
  margin-bottom: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--el-text-color-primary);
}

.conflict-notice {
  font-size: 0.85rem;
  color: var(--el-color-warning);
  margin-bottom: 10px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.import-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 10px;
}

.import-item:hover {
  background: var(--el-fill-color);
}

.import-item.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.import-item.conflict.selected {
  border-color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.item-meta {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
}
</style>
