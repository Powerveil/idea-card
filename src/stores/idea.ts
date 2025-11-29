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

  // Initialize
  loadIdeas()

  return {
    ideas,
    filter,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleFavorite,
    filteredIdeas,
    allTags,
    stats
  }
})
