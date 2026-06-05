<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import db, { TASK_STATUS, type Task } from '../db'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'

const { t, currentLocale } = useLocale()
const { PRIORITY_LABELS } = useLabels()

const router = useRouter()
const tasks = ref<Task[]>([])

const loadTasks = async (): Promise<void> => {
  tasks.value = await db.tasks.toArray()
}

const stats = computed(() => {
  const all = tasks.value
  const total = all.length
  const completed = all.filter(t => t.status === TASK_STATUS.COMPLETED).length
  const inProgress = all.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length
  const pending = all.filter(t => t.status === TASK_STATUS.PENDING).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, inProgress, pending, rate }
})

const todayTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tasks.value.filter(t => {
    const d = new Date(t.createdAt)
    return d >= today && d < tomorrow
  })
})

const todayRate = computed(() => {
  if (todayTasks.value.length === 0) return 0
  const done = todayTasks.value.filter(t => t.status === TASK_STATUS.COMPLETED).length
  return Math.round((done / todayTasks.value.length) * 100)
})

const recentTasks = computed(() => {
  return [...tasks.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

const progressBarStyle = computed(() => ({
  width: `${stats.value.rate}%`,
}))

const todayBarStyle = computed(() => ({
  width: `${todayRate.value}%`,
}))

onMounted(loadTasks)
</script>

<template>
  <div>
    <div class="page-header">
      <h2>{{ t('dashboard.title') }}</h2>
      <p>{{ new Date().toLocaleDateString(currentLocale, { month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--accent-subtle); color: var(--accent)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">{{ t('dashboard.allTasks') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--green-subtle); color: var(--green)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">{{ t('dashboard.completed') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--blue-subtle); color: var(--blue)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.inProgress }}</div>
        <div class="stat-label">{{ t('dashboard.inProgress') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--amber-subtle); color: var(--amber)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6c0 1.887.87 3.568 2.225 4.662C7.593 13.82 8 14.548 8 15.308V17a1 1 0 001 1h2a1 1 0 001-1v-1.692c0-.76.407-1.488 1.775-2.646A6 6 0 0010 2z"/></svg>
        </div>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">{{ t('dashboard.pending') }}</div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Today progress -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">{{ t('dashboard.todayProgress') }}</span>
          <span class="today-rate">{{ todayRate }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="todayBarStyle"></div>
        </div>
        <div v-if="todayTasks.length" class="today-list">
          <div v-for="task in todayTasks.slice(0, 5)" :key="task.id" class="today-item">
            <span :class="['dot', task.status]"></span>
            <span class="today-title">{{ task.title }}</span>
          </div>
          <p v-if="todayTasks.length > 5" class="more-hint">{{ t('dashboard.moreItems', { count: todayTasks.length - 5 }) }}</p>
        </div>
        <p v-else class="empty-text">{{ t('dashboard.noTodayTasks') }}</p>
      </div>

      <!-- Overall rate -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">{{ t('dashboard.overallRate') }}</span>
        </div>
        <div class="rate-display">
          <div class="rate-num">{{ stats.rate }}<span class="rate-unit">%</span></div>
          <div class="progress-bar" style="margin-top: 12px">
            <div class="progress-fill green" :style="progressBarStyle"></div>
          </div>
          <p class="rate-desc">{{ t('dashboard.itemsCompleted', { done: stats.completed, total: stats.total }) }}</p>
        </div>
      </div>

      <!-- Recent -->
      <div class="card recent-card">
        <div class="card-header">
          <span class="card-title">{{ t('dashboard.recentTasks') }}</span>
          <button class="btn btn-ghost btn-sm" @click="router.push('/tasks')">{{ t('dashboard.viewAll') }}</button>
        </div>
        <div v-if="recentTasks.length" class="task-list">
          <div
            v-for="task in recentTasks"
            :key="task.id"
            :class="['task-item', { completed: task.status === TASK_STATUS.COMPLETED }]"
          >
            <div :class="['task-checkbox', { checked: task.status === TASK_STATUS.COMPLETED }]">
              <svg v-if="task.status === TASK_STATUS.COMPLETED" width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span :class="['badge', `badge-${task.priority}`]">{{ PRIORITY_LABELS[task.priority] }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-text">{{ t('dashboard.noTasks') }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @include mobile { grid-template-columns: 1fr; }
}

.today-rate {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.progress-bar {
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;

  @media (prefers-color-scheme: dark) { background: var(--border-d); }
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.5s ease;

  &.green { background: var(--green); }
}

.today-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

  &.pending { background: var(--gray-300); }
  &.in_progress { background: var(--blue); }
  &.completed { background: var(--green); }
  &.cancelled { background: var(--red); }
}

.today-title {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (prefers-color-scheme: dark) { color: var(--text-d); }
}

.more-hint {
  font-size: 12px;
  color: var(--text-3);
  padding-top: 4px;
}

.empty-text {
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
  padding: 24px 0;
}

.rate-display {
  text-align: center;
  padding: 12px 0;
}

.rate-num {
  font-size: 40px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  letter-spacing: -1px;

  @media (prefers-color-scheme: dark) { color: var(--text-d); }
}

.rate-unit {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-3);
  margin-left: 2px;
}

.rate-desc {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 8px;
}

.recent-card {
  grid-column: 1 / -1;
}
</style>
