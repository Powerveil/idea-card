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
