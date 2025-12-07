<script setup lang="ts">
import { changelogs } from '../data/changelog'
import { useRouter } from 'vue-router'

const router = useRouter()

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Feature': return 'var(--success)'
    case 'Fix': return 'var(--danger)'
    case 'Style': return 'var(--primary-color)'
    case 'Refactor': return 'var(--warning)'
    default: return 'var(--text-secondary)'
  }
}

const getCategoryLabel = (category: string) => {
    switch (category) {
    case 'Feature': return '✨ 新功能'
    case 'Fix': return '🐛 修复'
    case 'Style': return '🎨 样式'
    case 'Refactor': return '♻️ 重构'
    case 'Docs': return '📝 文档'
    default: return '🔧 其他'
  }
}
</script>

<template>
  <div class="container changelog-page">
    <header class="page-header">
      <button class="btn btn-secondary" @click="router.push('/')">← 返回首页</button>
      <h1>更新日志</h1>
    </header>

    <div class="timeline">
      <div v-for="log in changelogs" :key="log.id" class="timeline-item">
        <div class="timeline-date">{{ log.date }}</div>
        <div class="timeline-point"></div>
        <div class="timeline-content card" :style="{ borderLeftColor: getCategoryColor(log.category) }">
          <div class="content-header">
            <span 
              class="category-badge" 
              :style="{ backgroundColor: getCategoryColor(log.category) }"
            >
              {{ getCategoryLabel(log.category) }}
            </span>
            <span v-if="log.version" class="version-tag">{{ log.version }}</span>
            <span v-if="log.author" class="author-tag">by {{ log.author }}</span>
          </div>
          <p class="log-text">{{ log.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.changelog-page {
  max-width: 800px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-main);
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 150px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.timeline-date {
  width: 130px;
  text-align: right;
  padding-right: 20px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding-top: 5px;
}

.timeline-point {
  width: 12px;
  height: 12px;
  background: var(--card-bg);
  border: 3px solid var(--primary-color);
  border-radius: 50%;
  position: absolute;
  left: 145px;
  top: 8px;
  z-index: 2;
}

.timeline-content {
  flex: 1;
  margin-left: 30px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s;
  border-left: 4px solid transparent;
}

.timeline-content:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.content-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.category-badge {
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.version-tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
}

.author-tag {
  color: #999;
  font-size: 0.8rem;
  margin-left: auto;
}

.log-text {
  color: var(--text-main);
  line-height: 1.6;
}

.btn-secondary {
  background: #e9ecef;
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #dee2e6;
}

@media (max-width: 600px) {
  .timeline::before {
    left: 20px;
  }
  
  .timeline-date {
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
    padding-left: 50px;
  }
  
  .timeline-item {
    flex-direction: column;
  }
  
  .timeline-point {
    left: 15px;
    top: 35px; /* Adjust based on date height - rough estimate */
  }
  
  .timeline-content {
    margin-left: 50px;
  }
}
</style>
