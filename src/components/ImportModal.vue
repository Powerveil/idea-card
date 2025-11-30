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
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>导入数据选择</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="newItems.length > 0" class="section">
          <div class="section-header">
            <h3>🆕 新记忆卡片 ({{ newItems.length }})</h3>
            <button class="btn-text" @click="toggleAllNew">全选/取消</button>
          </div>
          <div class="item-list">
            <div 
              v-for="item in newItems" 
              :key="item.id" 
              class="import-item new"
              :class="{ selected: selectedIds.has(item.id) }"
              @click="toggleSelection(item.id)"
            >
              <div class="checkbox">
                {{ selectedIds.has(item.id) ? '☑️' : '⬜' }}
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-meta">{{ formatDate(item.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="conflicts.length > 0" class="section">
          <div class="section-header">
            <h3>⚠️ 冲突/重复卡片 ({{ conflicts.length }})</h3>
            <button class="btn-text" @click="toggleAllConflicts">全选/取消</button>
          </div>
          <div class="alert-box">
            注意：选中冲突卡片将作为新卡片导入（标题相同），不会覆盖原有卡片。
          </div>
          <div class="item-list">
            <div 
              v-for="item in conflicts" 
              :key="item.id" 
              class="import-item conflict"
              :class="{ selected: selectedIds.has(item.id) }"
              @click="toggleSelection(item.id)"
            >
              <div class="checkbox">
                {{ selectedIds.has(item.id) ? '☑️' : '⬜' }}
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-meta">冲突：现有标题已存在</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="newItems.length === 0 && conflicts.length === 0" class="empty-state">
          没有发现有效的卡片数据。
        </div>
      </div>

      <div class="modal-footer">
        <div class="selection-info">
          已选择: <strong>{{ selectedIds.size }}</strong> 项
        </div>
        <div class="actions">
          <button class="btn-secondary" @click="emit('close')">取消</button>
          <button 
            class="btn-primary" 
            @click="handleConfirm"
            :disabled="selectedIds.size === 0"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
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
  font-size: 1rem;
  margin: 0;
  color: var(--text-main);
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
}

.btn-text:hover {
  text-decoration: underline;
}

.item-list {
  border: 1px solid #eee;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.import-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.import-item:last-child {
  border-bottom: none;
}

.import-item:hover {
  background-color: #f5f7fa;
}

.import-item.selected {
  background-color: #e3f2fd;
}

.import-item.conflict .item-title {
  color: #e67e22;
}

.checkbox {
  margin-right: 12px;
  font-size: 1.2rem;
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
  color: #7f8c8d;
}

.alert-box {
  background-color: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  border: none;
  transition: opacity 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: #e2e6ea;
  color: #4a4a4a;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>