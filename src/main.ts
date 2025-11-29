import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { onCLS, onFID, onLCP } from 'web-vitals'
import './style.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'

// Performance Monitoring
function sendToAnalytics(metric: any) {
  // In production, send to an endpoint. Here we log.
  if (import.meta.env.PROD) {
    console.log('[Web Vitals]', metric)
  }
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView }
  ]
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
