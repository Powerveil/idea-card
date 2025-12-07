<script setup lang="ts">
import { useIdeaStore } from '../stores/idea'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'

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
  <el-card shadow="hover" class="filter-card">
    <div class="controls">
      <div class="search-box">
        <el-input 
          v-model="filter.search" 
          placeholder="搜索标题或内容..." 
          :prefix-icon="Search"
          clearable
        />
      </div>
      <div class="filter-group">
        <el-select v-model="filter.color" placeholder="选择颜色" style="width: 140px;">
          <el-option label="所有颜色" value="all" />
          <el-option 
            v-for="c in COLORS" 
            :key="c.value" 
            :label="c.name" 
            :value="c.value"
          >
            <div class="color-option">
              <span class="color-dot" :style="{ backgroundColor: c.value }"></span>
              <span>{{ c.name }}</span>
            </div>
          </el-option>
        </el-select>
        
        <el-select v-model="filter.tag" placeholder="选择标签" style="width: 140px;">
          <el-option label="所有标签" value="all" />
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
