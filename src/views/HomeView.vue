<script setup lang="ts">
import { ref } from 'vue'
import { useIdeaStore } from '../stores/idea'
import { storeToRefs } from 'pinia'
import IdeaForm from '../components/IdeaForm.vue'
import IdeaCard from '../components/IdeaCard.vue'
import FilterBar from '../components/FilterBar.vue'
import IdeaPreviewModal from '../components/IdeaPreviewModal.vue'

const store = useIdeaStore()
const { filteredIdeas, stats } = storeToRefs(store)

const editingId = ref<string | null>(null)
const editData = ref<any>(null)
const showPreview = ref(false)
const previewData = ref<any>(null)

const handleEdit = (id: string) => {
  const idea = store.ideas.find(i => i.id === id)
  if (idea) {
    editData.value = idea
    editingId.value = id
    // Scroll to top on mobile
    if (window.innerWidth < 900) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const handlePreview = (id: string) => {
  const idea = store.ideas.find(i => i.id === id)
  if (idea) {
    previewData.value = idea
    showPreview.value = true
  }
}

const handleFormSubmit = (data: any) => {
  if (editingId.value) {
    store.updateIdea(editingId.value, data)
    editingId.value = null
    editData.value = null
  } else {
    store.addIdea(data)
  }
}

const handleCancelEdit = () => {
  editingId.value = null
  editData.value = null
}
</script>

<template>
  <div class="container">
    <header>
      <h1>想法卡片管理器</h1>
      <div class="stats">总计: {{ stats.total }} | 收藏: {{ stats.favorites }}</div>
    </header>

    <FilterBar />

    <div class="main-layout">
      <IdeaForm 
        :edit-data="editData" 
        @submit="handleFormSubmit" 
        @cancel="handleCancelEdit"
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
    
    <IdeaPreviewModal 
      :show="showPreview" 
      :idea="previewData" 
      @close="showPreview = false" 
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
