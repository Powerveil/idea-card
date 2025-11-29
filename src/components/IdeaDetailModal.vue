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

watch(() => props.isEditing, (val) => {
  internalIsEditing.value = !!val
}, { immediate: true })

const formattedDate = computed(() => {
  if (!props.idea) return ''
  return new Date(props.idea.createdAt).toLocaleDateString() + ' ' + 
         new Date(props.idea.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
})

watch(() => [props.show, props.idea, internalIsEditing.value], async ([show, idea, isEditing]) => {
  if (show && idea && !isEditing && previewContainer.value) {
    // Use Vditor's preview rendering
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
      
      <!-- Edit Mode -->
      <div v-if="internalIsEditing" class="edit-mode-wrapper">
        <IdeaForm 
          :edit-data="idea" 
          variant="modal"
          @submit="handleFormSubmit" 
          @cancel="handleFormCancel"
        />
      </div>

      <!-- Preview Mode -->
      <div v-else class="preview-mode-wrapper">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ idea.title }}</h2>
            <div class="modal-date">{{ formattedDate }}</div>
          </div>
          <div class="header-actions">
            <button class="edit-btn" @click="toggleEdit" title="编辑">✏️</button>
            <button class="close-btn" @click="emit('close')">&times;</button>
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
  color: var(--text-main);
}

.modal-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
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
</style>
