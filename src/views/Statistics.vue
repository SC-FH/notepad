<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import db, {
  TASK_STATUS,
  TASK_CATEGORY,
  type Task,
} from '../db'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'

const { t, currentLocale } = useLocale()
const { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } = useLabels()

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

const tasks = ref<Task[]>([])
const period = ref<string>('week')

const loadTasks = async (): Promise<void> => { tasks.value = await db.tasks.toArray() }

// Chart colors
const colors: Record<string, string> = {
  accent: '#6366f1',
  green: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
  gray: '#d1d5db',
}

// Trend
const trendData = computed(() => {
  const days = period.value === 'week' ? 7 : 30
  const labels = [], created = [], completed = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)

    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
    created.push(tasks.value.filter(t => {
      const td = new Date(t.createdAt)
      return td >= d && td < next
    }).length)
    completed.push(tasks.value.filter(t => {
      if (!t.completedAt) return false
      const td = new Date(t.completedAt)
      return td >= d && td < next
    }).length)
  }

  return {
    labels,
    datasets: [
      {
        label: t('statistics.trendCreated'),
        data: created,
        borderColor: colors.blue,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: t('statistics.trendCompleted'),
        data: completed,
        borderColor: colors.green,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }
})

const trendOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } },
    },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } }, border: { display: false } },
  },
  interaction: { intersect: false, mode: 'index' as const },
}

// Status doughnut
const statusData = computed(() => {
  const counts: Record<string, number> = {}
  Object.values(TASK_STATUS).forEach(s => { counts[s] = 0 })
  tasks.value.forEach(t => { counts[t.status]++ })
  return {
    labels: Object.values(STATUS_LABELS.value),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [colors.gray, colors.blue, colors.green, colors.red],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }
})

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { position: 'bottom' as const, labels: { padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } } },
  },
}

// Category bar
const categoryData = computed(() => {
  const counts: Record<string, number> = {}
  Object.values(TASK_CATEGORY).forEach(c => { counts[c] = 0 })
  tasks.value.forEach(t => { counts[t.category]++ })
  return {
    labels: Object.values(CATEGORY_LABELS.value),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [colors.blue, colors.accent, '#06b6d4', colors.amber, colors.gray],
      borderRadius: 4,
      borderSkipped: false,
      maxBarThickness: 32,
    }],
  }
})

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } }, border: { display: false } },
  },
}

// Priority doughnut
const priorityData = computed(() => {
  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 }
  tasks.value.forEach(t => { counts[t.priority]++ })
  return {
    labels: Object.values(PRIORITY_LABELS.value),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [colors.green, colors.blue, colors.amber, colors.red],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }
})

// Stats
const stats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter(t => t.status === TASK_STATUS.COMPLETED).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const doneTasks = tasks.value.filter(t => t.completedAt && t.createdAt)
  let avgTime = '--'
  if (doneTasks.length > 0) {
    const hrs = doneTasks.reduce((s, t) => s + (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 3600000, 0) / doneTasks.length
    avgTime = hrs < 1 ? `${Math.round(hrs * 60)}m` : hrs < 24 ? `${Math.round(hrs)}h` : `${Math.round(hrs / 24)}d`
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const todayNew = tasks.value.filter(t => { const d = new Date(t.createdAt); return d >= today && d < tomorrow }).length
  const todayDone = tasks.value.filter(t => { if (!t.completedAt) return false; const d = new Date(t.completedAt!); return d >= today && d < tomorrow }).length

  return { total, completed, rate, avgTime, todayNew, todayDone }
})

onMounted(loadTasks)
</script>

<template>
  <div>
    <div class="page-header">
      <h2>{{ t('statistics.title') }}</h2>
      <p>{{ t('statistics.subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--accent-subtle); color: var(--accent)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
        </div>
        <div class="stat-value">{{ stats.rate }}%</div>
        <div class="stat-label">{{ t('statistics.completionRate') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--green-subtle); color: var(--green)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.avgTime }}</div>
        <div class="stat-label">{{ t('statistics.avgTime') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--blue-subtle); color: var(--blue)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.todayNew }}</div>
        <div class="stat-label">{{ t('statistics.todayNew') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--green-subtle); color: var(--green)">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stat-value">{{ stats.todayDone }}</div>
        <div class="stat-label">{{ t('statistics.todayDone') }}</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="card chart-card wide">
        <div class="card-header">
          <span class="card-title">{{ t('statistics.trend') }}</span>
          <div class="period-toggle">
            <button
              :class="['btn btn-sm', period === 'week' ? 'btn-primary' : 'btn-ghost']"
              @click="period = 'week'"
            >{{ t('statistics.days7') }}</button>
            <button
              :class="['btn btn-sm', period === 'month' ? 'btn-primary' : 'btn-ghost']"
              @click="period = 'month'"
            >{{ t('statistics.days30') }}</button>
          </div>
        </div>
        <div class="chart-container">
          <Line :data="trendData" :options="trendOpts" />
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <span class="card-title">{{ t('statistics.status') }}</span>
        </div>
        <div class="chart-container">
          <Doughnut :data="statusData" :options="doughnutOpts" />
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <span class="card-title">{{ t('statistics.category') }}</span>
        </div>
        <div class="chart-container">
          <Bar :data="categoryData" :options="barOpts" />
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <span class="card-title">{{ t('statistics.priority') }}</span>
        </div>
        <div class="chart-container">
          <Doughnut :data="priorityData" :options="doughnutOpts" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.chart-card {
  min-height: 320px;

  &.wide {
    grid-column: 1 / -1;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }

  @include mobile {
    grid-template-columns: 1fr;
  }
}
</style>
