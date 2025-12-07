<script setup lang="ts">
import { computed } from 'vue'
import { useIdeaStore } from '../stores/idea'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useIdeaStore()
const stats = computed(() => store.inspirationStats)

const getMaxVal = (arr: [string, number][]) => {
  if (arr.length === 0) return 1
  return Math.max(...arr.map(i => i[1]))
}

const timeMax = computed(() => getMaxVal(stats.value.time))
const sourceMax = computed(() => getMaxVal(stats.value.source))
const moodMax = computed(() => getMaxVal(stats.value.mood))

const visible = computed({
  get: () => props.show,
  set: (val) => {
    if (!val) emit('close')
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="📊 个人灵感模式分析"
    width="800px"
    destroy-on-close
    align-center
  >
    <div class="modal-body">
      <div class="analysis-section">
        <h3>⏰ 灵感时刻</h3>
        <p class="section-desc">分析你最容易产生灵感的时间段</p>
        <div class="chart-container">
          <div v-for="[label, count] in stats.time" :key="label" class="chart-row">
            <div class="row-label">{{ label }}</div>
            <div class="row-bar-wrapper">
              <el-progress 
                :percentage="(count / timeMax * 100) || 0" 
                :stroke-width="15"
                :show-text="false"
                :color="'#4a90e2'"
              />
            </div>
            <div class="row-value">{{ count }}</div>
          </div>
        </div>
      </div>

      <el-row :gutter="20" class="analysis-grid">
        <el-col :span="12">
          <div class="analysis-section">
            <h3>📍 灵感来源</h3>
            <div class="chart-container">
              <el-empty v-if="stats.source.length === 0" description="暂无数据" :image-size="60" />
              <div v-else v-for="[label, count] in stats.source.slice(0, 5)" :key="label" class="chart-row small">
                <div class="row-label">{{ label }}</div>
                <div class="row-bar-wrapper">
                  <el-progress 
                    :percentage="(count / sourceMax * 100) || 0" 
                    :stroke-width="10"
                    :show-text="false"
                    status="success"
                  />
                </div>
                <div class="row-value">{{ count }}</div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="analysis-section">
            <h3>🥰 心情分布</h3>
            <div class="chart-container">
              <el-empty v-if="stats.mood.length === 0" description="暂无数据" :image-size="60" />
              <div v-else v-for="[label, count] in stats.mood.slice(0, 5)" :key="label" class="chart-row small">
                <div class="row-label emoji-label">{{ label }}</div>
                <div class="row-bar-wrapper">
                  <el-progress 
                    :percentage="(count / moodMax * 100) || 0" 
                    :stroke-width="10"
                    :show-text="false"
                    status="warning"
                  />
                </div>
                <div class="row-value">{{ count }}</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<style scoped>
.modal-body {
  padding: 10px;
}

.analysis-section {
  margin-bottom: 30px;
}

.analysis-grid .analysis-section {
  background: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 8px;
  height: 100%;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: var(--el-text-color-primary);
}

.section-desc {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-label {
  width: 50px;
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  text-align: right;
}

.chart-row.small .row-label {
  width: 70px; /* More space for source/mood names */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-bar-wrapper {
  flex: 1;
}

.row-value {
  width: 30px;
  text-align: left;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.emoji-label {
  font-size: 1.2rem;
}
</style>
