import { createRouter, createWebHistory } from 'vue-router'
import Today from '../views/Today.vue'
import History from '../views/History.vue'
import Stats from '../views/Stats.vue'

const routes = [
  { path: '/', component: Today },
  { path: '/history', component: History },
  { path: '/stats', component: Stats },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
