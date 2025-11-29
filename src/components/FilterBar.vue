<script setup lang="ts">
import { useIdeaStore } from '../stores/idea'
import { storeToRefs } from 'pinia'

const store = useIdeaStore()
const { filter, allTags } = storeToRefs(store)

const COLORS = [
  { value: '#ffffff', name: '白色' },
  { value: '#fff3cd', name: '黄色' },
  { value: '#d4edda', name: '绿色' },
  { value: '#f8d7da', name: '红色' },
  { value: '#d1ecf1', name: '蓝色' },
  { value: '#e2e3e5', name: '灰色' },
  { value: '#e8daef', name: '紫色' }
]
</script>

<template>
  <section class="controls">
    <div class="search-box">
      <input type="text" v-model="filter.search" placeholder="搜索标题或内容...">
    </div>
    <div class="filter-group">
      <select v-model="filter.color">
        <option value="all">所有颜色</option>
        <option v-for="c in COLORS" :key="c.value" :value="c.value" :style="{ backgroundColor: c.value }">
          {{ c.name }}
        </option>
      </select>
      <select v-model="filter.tag">
        <option value="all">所有标签</option>
        <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  background: var(--card-bg);
  padding: 15px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}
</style>
