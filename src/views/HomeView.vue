<script setup lang="ts">
import { ref } from 'vue'
import { useIdeaStore } from '../stores/idea'
import { storeToRefs } from 'pinia'
import IdeaForm from '../components/IdeaForm.vue'
import IdeaCard from '../components/IdeaCard.vue'
import FilterBar from '../components/FilterBar.vue'
import IdeaDetailModal from '../components/IdeaDetailModal.vue'

const store = useIdeaStore()
const { filteredIdeas, stats } = storeToRefs(store)

const showDetail = ref(false)
const detailData = ref<any>(null)
const isEditingDetail = ref(false)

const handleEdit = (id: string) => {
  const idea = store.ideas.find(i => i.id === id)
  if (idea) {
    detailData.value = idea
    isEditingDetail.value = true
    showDetail.value = true
  }
}

const handlePreview = (id: string) => {
  const idea = store.ideas.find(i => i.id === id)
  if (idea) {
    detailData.value = idea
    isEditingDetail.value = false
    showDetail.value = true
  }
}

const handleFormSubmit = (data: any) => {
  store.addIdea(data)
}

const handleUpdate = (data: any) => {
  if (detailData.value) {
    store.updateIdea(detailData.value.id, data)
    // Update local detail data to reflect changes immediately
    detailData.value = { ...detailData.value, ...data }
  }
}

const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const success = await store.importData(input.files[0])
    if (success) {
      // Reset input value to allow re-importing same file if needed
      input.value = ''
      alert('导入成功！')
    }
  }
}
</script>

<template>
  <div class="container">
    <header>
      <h1>想法卡片管理器</h1>
      <div class="header-right">
        <div class="stats">总计: {{ stats.total }} | 收藏: {{ stats.favorites }}</div>
        <div class="data-controls">
          <button @click="store.exportData" class="btn-tool" title="导出数据备份">
            📥 导出
          </button>
          <button @click="triggerImport" class="btn-tool" title="导入数据备份">
            📤 导入
          </button>
          <input 
            ref="fileInput" 
            type="file" 
            accept=".json" 
            style="display: none" 
            @change="handleImport"
          >
        </div>
      </div>
    </header>

    <FilterBar />

    <div class="main-layout">
      <IdeaForm 
        @submit="handleFormSubmit" 
      />

      <main class="cards-grid">
        <div v-if="filteredIdeas.length === 0" class="empty-state">
          没有找到符合条件的卡片。
        </div>
        <IdeaCard 
          v-for="idea in filteredIdeas" 
          :key="idea.id" 
          :idea="idea"
          @delete="store.deleteIdea"
          @favorite="store.toggleFavorite"
          @edit="handleEdit"
          @preview="handlePreview"
        />
      </main>
    </div>
    
    <IdeaDetailModal 
      :show="showDetail" 
      :idea="detailData"
      :is-editing="isEditingDetail" 
      @close="showDetail = false" 
      @update="handleUpdate"
    />
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.data-controls {
  display: flex;
  gap: 10px;
}

.btn-tool {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-main);
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-tool:hover {
  background-color: #f8f9fa;
  border-color: #bbb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-tool:active {
  transform: translateY(0);
  box-shadow: none;
}

h1 {
  font-size: 2rem;
  color: var(--primary-color);
}

.stats {
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-content: start;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 1.2rem;
}
</style>
