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

  // Load from local storage AND server
  const loadIdeas = async () => {
    let loadedFromServer = false
    
    // Try loading from server first (source of truth for persistence across restarts)
    try {
      const res = await fetch('/api/data')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          ideas.value = data
          loadedFromServer = true
          console.log('已从本地文件加载数据')
        }
      }
    } catch (e) {
      // Ignore network errors, fallback to local storage
    }

    // Fallback to local storage if server didn't provide data
    if (!loadedFromServer) {
      const stored = localStorage.getItem('idea-cards-data')
      if (stored) {
        try {
          ideas.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse ideas', e)
        }
      }
    }
  }

  // Save to local storage AND server
  watch(ideas, async (newVal) => {
    // 1. Local Storage
    localStorage.setItem('idea-cards-data', JSON.stringify(newVal))
    
    // 2. Server Persistence (Local File)
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVal)
      })
    } catch (e) {
      // Silent fail for server sync (might be offline or prod build)
      // console.warn('Failed to sync with server persistence')
    }
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

  const importData = async (selectedItems: Idea[]) => {
    if (selectedItems.length > 0) {
      // Generate new IDs for imported items to avoid ID conflicts
      const newItemsWithIds = selectedItems.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: item.createdAt || Date.now() // Keep original date if exists, else use now
      }))
      
      // Append new items instead of replacing
      ideas.value = [...newItemsWithIds, ...ideas.value]
      return true
    }
    return false
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
