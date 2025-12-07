<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIdeaStore } from '../stores/idea'
import { storeToRefs } from 'pinia'
import { Plus, Download, Upload, DataAnalysis, Notification } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IdeaForm from '../components/IdeaForm.vue'
import IdeaCard from '../components/IdeaCard.vue'
import FilterBar from '../components/FilterBar.vue'
import IdeaDetailModal from '../components/IdeaDetailModal.vue'
import ImportModal from '../components/ImportModal.vue'
import InsightStats from '../components/InsightStats.vue'
import type { Idea } from '../stores/idea'

const store = useIdeaStore()
const router = useRouter()
const { filteredIdeas, stats } = storeToRefs(store)

const showDetail = ref(false)
const detailData = ref<any>(null)
const isEditingDetail = ref(false)
const showStats = ref(false)

// Import state
const showImportModal = ref(false)
const importCandidates = ref<Idea[]>([])
const existingTitles = ref<Set<string>>(new Set())

// Add Idea state
const showAddModal = ref(false)

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

const handleDelete = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这张卡片吗？此操作无法撤销。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      store.deleteIdea(id)
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      // cancel
    })
}

const handleFormSubmit = (data: any) => {
  store.addIdea(data)
  showAddModal.value = false
  ElMessage.success('添加成功')
}



const handleUpdate = (data: any) => {
  if (detailData.value) {
    store.updateIdea(detailData.value.id, data)
    // Update local detail data to reflect changes immediately
    detailData.value = { ...detailData.value, ...data }
    ElMessage.success('更新成功')
  }
}

const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const data = JSON.parse(json)
        
        if (Array.isArray(data)) {
          const validItems = data.filter((item: any) => 
            item && typeof item === 'object' && item.title && item.content
          ) as Idea[]
          
          if (validItems.length === 0) {
            ElMessage.error('文件未包含有效的卡片数据')
            return
          }

          importCandidates.value = validItems
          existingTitles.value = new Set(store.ideas.map(i => i.title))
          showImportModal.value = true
          
          // Reset input so same file can be selected again
          input.value = ''
        } else {
          ElMessage.error('无效的文件格式：应为 JSON 数组')
        }
      } catch (error) {
        console.error('Parse error:', error)
        ElMessage.error('无法解析 JSON 文件')
      }
    }
    
    reader.readAsText(file)
  }
}

const handleImportConfirm = async (selectedItems: Idea[]) => {
  const success = await store.importData(selectedItems)
  if (success) {
    showImportModal.value = false
    ElMessage.success(`成功导入 ${selectedItems.length} 条卡片！`)
  }
}
</script>

<template>
  <el-container class="app-container">
    <el-header height="auto" class="app-header">
      <div class="header-content">
        <h1>想法卡片管理器</h1>
        <div class="header-right">
          <div class="stats-tags">
             <el-tag type="info" effect="plain" round>总计: {{ stats.total }}</el-tag>
             <el-tag type="warning" effect="plain" round>收藏: {{ stats.favorites }}</el-tag>
          </div>
          <div class="data-controls">
             <el-button-group>
               <el-button :icon="Notification" @click="router.push('/changelog')">日志</el-button>
               <el-button :icon="DataAnalysis" @click="showStats = true">分析</el-button>
               <el-button :icon="Download" @click="store.exportData">导出</el-button>
               <el-button :icon="Upload" @click="triggerImport">导入</el-button>
             </el-button-group>
            <input 
              ref="fileInput" 
              type="file" 
              accept=".json" 
              style="display: none" 
              @change="handleFileSelect"
            >
          </div>
        </div>
      </div>
    </el-header>

    <el-main>
      <FilterBar />

      <div v-if="filteredIdeas.length === 0" class="empty-state">
        <el-empty description="没有找到符合条件的卡片" />
      </div>

      <div class="cards-grid">
        <IdeaCard 
          v-for="idea in filteredIdeas" 
          :key="idea.id" 
          :idea="idea"
          @delete="handleDelete"
          @favorite="store.toggleFavorite"
          @edit="handleEdit"
          @preview="handlePreview"
        />
      </div>
    </el-main>
    
    <!-- FAB for Add Idea -->
    <div class="fab-container">
      <el-button type="primary" circle size="large" :icon="Plus" class="fab-add" @click="showAddModal = true" />
    </div>

    <!-- Add Idea Modal -->
    <el-dialog
      v-model="showAddModal"
      title="添加新想法"
      width="90%"
      style="max-width: 800px;"
      align-center
      destroy-on-close
    >
      <IdeaForm 
        variant="modal"
        @submit="handleFormSubmit"
        @cancel="showAddModal = false"
      />
    </el-dialog>

    <IdeaDetailModal 
      :show="showDetail" 
      :idea="detailData"
      :is-editing="isEditingDetail" 
      @close="() => { showDetail = false; isEditingDetail = false }" 
      @update="handleUpdate"
    />

    <ImportModal
      :show="showImportModal"
      :import-data="importCandidates"
      :existing-titles="existingTitles"
      @close="showImportModal = false"
      @confirm="handleImportConfirm"
    />

    <InsightStats
      :show="showStats"
      @close="showStats = false"
    />
  </el-container>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.app-header {
  padding: 20px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stats-tags {
  display: flex;
  gap: 10px;
}

h1 {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin: 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  align-items: start;
  margin-top: 20px;
}

.fab-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 100;
}

.fab-add {
  font-size: 1.5rem;
  width: 60px;
  height: 60px;
  box-shadow: var(--el-box-shadow);
}
.fab-add.el-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .fab-container {
    bottom: 20px;
    right: 20px;
  }
}
</style>
