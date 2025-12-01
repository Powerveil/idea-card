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
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>📊 个人灵感模式分析</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="analysis-section">
          <h3>⏰ 灵感时刻</h3>
          <p class="section-desc">分析你最容易产生灵感的时间段</p>
          <div class="chart-container">
            <div v-for="[label, count] in stats.time" :key="label" class="chart-row">
              <div class="row-label">{{ label }}</div>
              <div class="row-bar-wrapper">
                <div 
                  class="row-bar time" 
                  :style="{ width: (count / timeMax * 100) + '%' }"
                ></div>
              </div>
              <div class="row-value">{{ count }}</div>
            </div>
          </div>
        </div>

        <div class="analysis-grid">
          <div class="analysis-section half">
            <h3>📍 灵感来源</h3>
            <div class="chart-container">
              <div v-if="stats.source.length === 0" class="empty-chart">暂无数据</div>
              <div v-for="[label, count] in stats.source.slice(0, 5)" :key="label" class="chart-row small">
                <div class="row-label">{{ label }}</div>
                <div class="row-bar-wrapper">
                  <div 
                    class="row-bar source" 
                    :style="{ width: (count / sourceMax * 100) + '%' }"
                  ></div>
                </div>
                <div class="row-value">{{ count }}</div>
              </div>
            </div>
          </div>

          <div class="analysis-section half">
            <h3>🥰 心情分布</h3>
            <div class="chart-container">
              <div v-if="stats.mood.length === 0" class="empty-chart">暂无数据</div>
              <div v-for="[label, count] in stats.mood.slice(0, 5)" :key="label" class="chart-row small">
                <div class="row-label emoji-label">{{ label }}</div>
                <div class="row-bar-wrapper">
                  <div 
                    class="row-bar mood" 
                    :style="{ width: (count / moodMax * 100) + '%' }"
                  ></div>
                </div>
                <div class="row-value">{{ count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
}

.analysis-section {
  margin-bottom: 30px;
}

.analysis-section h3 {
  font-size: 1.1rem;
  margin: 0 0 5px 0;
  color: var(--text-main);
}

.section-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0 0 15px 0;
}

.analysis-grid {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.analysis-section.half {
  flex: 1;
  min-width: 250px;
  margin-bottom: 0;
}

.chart-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.chart-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-row.small {
  margin-bottom: 8px;
}

.row-label {
  width: 100px;
  font-size: 0.9rem;
  color: #555;
}

.emoji-label {
  width: 40px;
  font-size: 1.2rem;
}

.row-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin: 0 10px;
  overflow: hidden;
}

.row-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.row-bar.time { background-color: #3498db; }
.row-bar.source { background-color: #2ecc71; }
.row-bar.mood { background-color: #e67e22; }

.row-value {
  width: 30px;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
}

.empty-chart {
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 20px 0;
}
</style>