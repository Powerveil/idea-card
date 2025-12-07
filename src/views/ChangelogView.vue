<script setup lang="ts">
import { changelogs } from '../data/changelog'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const getCategoryType = (category: string) => {
  switch (category) {
    case 'Feature': return 'success'
    case 'Fix': return 'danger'
    case 'Style': return 'primary'
    case 'Refactor': return 'warning'
    default: return 'info'
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
  <el-container class="changelog-container">
    <el-header height="auto" class="page-header">
      <el-page-header @back="router.push('/')">
        <template #content>
          <span class="text-large font-600 mr-3"> 更新日志 </span>
        </template>
      </el-page-header>
    </el-header>

    <el-main>
      <el-timeline>
        <el-timeline-item
          v-for="log in changelogs"
          :key="log.id"
          :timestamp="log.date"
          placement="top"
          :type="getCategoryType(log.category)"
          size="large"
        >
          <el-card class="log-card">
            <div class="log-header">
              <el-tag :type="getCategoryType(log.category)" effect="dark">
                {{ getCategoryLabel(log.category) }}
              </el-tag>
              <el-tag v-if="log.version" effect="plain" type="info" size="small">{{ log.version }}</el-tag>
              <span v-if="log.author" class="author-text">by {{ log.author }}</span>
            </div>
            <p class="log-content">{{ log.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-main>
  </el-container>
</template>

<style scoped>
.changelog-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  padding-bottom: 20px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.author-text {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.log-content {
  margin: 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
