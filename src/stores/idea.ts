import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface Idea {
  id: string
  title: string
  content: string
  tags: string[]
  color: string
  createdAt: number
  updatedAt?: number
  isFavorite: boolean
}

export interface FilterState {
  search: string
  color: string
  tag: string
}

export const useIdeaStore = defineStore('idea', () => {
  const ideas = ref<Idea[]>([])
  const filter = ref<FilterState>({
    search: '',
    color: 'all',
    tag: 'all'
  })

  // Load from local storage
  const loadIdeas = () => {
    const stored = localStorage.getItem('idea-cards-data')
    if (stored) {
      try {
        ideas.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse ideas', e)
      }
    }
  }

  // Save to local storage
  watch(ideas, (newVal) => {
    localStorage.setItem('idea-cards-data', JSON.stringify(newVal))
  }, { deep: true })

  const addIdea = (idea: Omit<Idea, 'id' | 'createdAt' | 'isFavorite'>) => {
    const newIdea: Idea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: Date.now(),
      isFavorite: false
    }
    ideas.value.unshift(newIdea)
  }

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    const index = ideas.value.findIndex(i => i.id === id)
    if (index !== -1) {
      ideas.value[index] = { ...ideas.value[index], ...updates, updatedAt: Date.now() }
    }
  }

  const deleteIdea = (id: string) => {
    ideas.value = ideas.value.filter(i => i.id !== id)
  }

  const toggleFavorite = (id: string) => {
    const idea = ideas.value.find(i => i.id === id)
    if (idea) {
      idea.isFavorite = !idea.isFavorite
    }
  }

  // Getters
  const filteredIdeas = computed(() => {
    return ideas.value.filter(idea => {
      const matchSearch = (idea.title + idea.content).toLowerCase().includes(filter.value.search.toLowerCase())
      const matchColor = filter.value.color === 'all' || idea.color === filter.value.color
      const matchTag = filter.value.tag === 'all' || idea.tags.includes(filter.value.tag)
      return matchSearch && matchColor && matchTag
    })
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    ideas.value.forEach(i => i.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  })

  const stats = computed(() => ({
    total: ideas.value.length,
    favorites: ideas.value.filter(i => i.isFavorite).length
  }))

  // Export/Import Actions
  const exportData = () => {
    const dataStr = JSON.stringify(ideas.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const date = new Date().toISOString().split('T')[0]
    link.download = `idea-cards-backup-${date}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string
          const data = JSON.parse(json)
          if (Array.isArray(data)) {
            // Validate basic structure of the first item (optional but good practice)
            // Replacing current data with imported data
            if (confirm(`确定要导入 ${data.length} 条卡片吗？这将覆盖当前数据！`)) {
              ideas.value = data
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            alert('无效的文件格式：应为卡片数组。')
            resolve(false)
          }
        } catch (error) {
          console.error('Import failed', error)
          alert('导入失败：无法解析 JSON 文件。')
          resolve(false)
        }
      }
      reader.onerror = () => {
        alert('读取文件失败。')
        resolve(false)
      }
      reader.readAsText(file)
    })
  }

  // Initialize
  loadIdeas()

  return {
    ideas,
    filter,
    filteredIdeas,
    allTags,
    stats,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleFavorite,
    exportData,
    importData
  }
})
