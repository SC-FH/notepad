<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, LineElement, PointElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import db, { TASK_STATUS, type Task } from '../db'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'

ChartJS.register(
  CategoryScale, LinearScale, LineElement, PointElement,
  ArcElement, Tooltip, Legend, Filler
)

const tasks = ref<Task[]>([])
const loadTasks = async (): Promise<void> => { tasks.value = await db.tasks.toArray() }

// Track theme and locale changes so chart colors/labels recompute
const { currentScheme } = useTheme()
const { t, currentLocale } = useLocale()

// Resolve CSS custom properties to computed color values for Chart.js
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const stats = computed(() => {
  const total = tasks.value.length
  const done = tasks.value.filter(t => t.status === TASK_STATUS.COMPLETED).length
  const active = tasks.value.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length
  const rate = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, active, rate }
})

const trend = computed(() => {
  // Read currentScheme and locale to trigger recomputation on change
  void currentScheme.value
  void currentLocale.value
  const labels = [], created = [], completed = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
    created.push(tasks.value.filter(t => { const td = new Date(t.createdAt); return td >= d && td < next }).length)
    completed.push(tasks.value.filter(t => { if (!t.completedAt) return false; const td = new Date(t.completedAt!); return td >= d && td < next }).length)
  }
  const blue = cssVar('--blue')
  const green = cssVar('--green')
  return {
    labels,
    datasets: [
      {
        label: t('stats.trendCreated'),
        data: created,
        borderColor: blue,
        backgroundColor: blue + '14',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: blue,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: t('stats.trendCompleted'),
        data: completed,
        borderColor: green,
        backgroundColor: green + '14',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: green,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }
})

const trendOpts = computed(() => {
  void currentScheme.value
  const ink4 = cssVar('--ink-4') || '#94a3b8'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: { padding: 14, boxWidth: 8, boxHeight: 8, font: { size: 11, family: 'Source Serif 4, Georgia, serif' } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10 }, color: ink4 },
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: ink4 },
        border: { display: false },
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
  }
})

const statusData = computed(() => {
  void currentScheme.value
  void currentLocale.value
  const counts = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
  tasks.value.forEach(t => { counts[t.status]++ })
  return {
    labels: [t('db.status.pending'), t('db.status.in_progress'), t('db.status.completed'), t('db.status.cancelled')],
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [
        cssVar('--ink-4'),
        cssVar('--blue'),
        cssVar('--green'),
        cssVar('--red'),
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }
})

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  cutout: '68%',
  layout: {
    padding: { top: 8, bottom: 8 },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 14,
        boxWidth: 8,
        boxHeight: 8,
        font: { size: 11, family: 'Source Serif 4, Georgia, serif' },
      },
    },
  },
}

const streak = computed(() => {
  const doneDates = new Set(
    tasks.value.filter(t => t.completedAt).map(t => new Date(t.completedAt!).toISOString().slice(0, 10))
  )
  let count = 0
  const d = new Date(); d.setHours(0, 0, 0, 0)
  while (doneDates.has(d.toISOString().slice(0, 10))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
})

onMounted(loadTasks)
</script>

<template>
  <div>
    <div class="page-head">
      <div class="page-head-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>
      <div>
        <h2 class="page-title">{{ t('stats.title') }}</h2>
        <p class="page-sub">{{ t('stats.subtitle') }}</p>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-grid" role="list" :aria-label="t('stats.ariaOverview')">
      <div class="summary-card summary-card--amber" role="listitem">
        <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div class="summary-num">{{ stats.total }}</div>
        <div class="summary-label">{{ t('stats.totalTasks') }}</div>
      </div>
      <div class="summary-card summary-card--blue" role="listitem">
        <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <div class="summary-num">{{ stats.active }}</div>
        <div class="summary-label">{{ t('stats.inProgress') }}</div>
      </div>
      <div class="summary-card summary-card--green" role="listitem">
        <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div class="summary-num">{{ stats.done }}</div>
        <div class="summary-label">{{ t('stats.completed') }}</div>
      </div>
      <div class="summary-card summary-card--purple" role="listitem">
        <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <div class="summary-num">{{ streak }}</div>
        <div class="summary-label">{{ t('stats.streak') }}</div>
      </div>
    </div>

    <!-- Completion Rate -->
    <div class="rate-banner">
      <div class="rate-label">{{ t('stats.completionRate') }}</div>
      <div class="rate-value" :aria-label="`${t('stats.completionRate')} ${stats.rate}%`">
        {{ stats.rate }}<span class="rate-pct">%</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="chart-stack">
      <div class="chart-card">
        <div class="chart-head">
          <svg class="chart-head-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span class="chart-title">{{ t('stats.trend7d') }}</span>
        </div>
        <div class="chart-body">
          <Line :data="trend" :options="trendOpts" />
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-head">
          <svg class="chart-head-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          <span class="chart-title">{{ t('stats.statusDistribution') }}</span>
        </div>
        <div class="donut-wrap">
          <Doughnut :data="statusData" :options="doughnutOpts" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

// ── Page Head ───────────────────────────────────────────
.page-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-7);
}

.page-head-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--accent-subtle);
  color: var(--accent);
  flex-shrink: 0;
}

.page-title {
  font-family: $font-display;
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;

  @include mobile {
    font-size: 22px;
  }
}

.page-sub {
  font-size: 13px;
  color: var(--ink-3);
  margin-top: 2px;
}

// ── Summary Grid ────────────────────────────────────────
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-3;
  margin-bottom: $space-5;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-card {
  position: relative;
  text-align: center;
  padding: $space-5 $space-3 $space-4;
  border-radius: $radius;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-top: 4px solid var(--gray-300);
  box-shadow: $shadow-sm;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }

  // Color variants
  &--amber  { border-top-color: var(--amber); }
  &--blue   { border-top-color: var(--blue); }
  &--green  { border-top-color: var(--green); }
  &--purple { border-top-color: var(--purple); }
}

.summary-icon {
  display: block;
  width: 24px;
  height: 24px;
  margin: 0 auto var(--space-2);
  color: var(--ink-3);
}

.summary-num {
  font-family: $font-display;
  font-size: 34px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;

  @include mobile {
    font-size: 28px;
  }
}

.summary-card--amber  .summary-num { color: var(--amber); }
.summary-card--blue   .summary-num { color: var(--blue); }
.summary-card--green  .summary-num { color: var(--green); }
.summary-card--purple .summary-num { color: var(--purple); }

.summary-label {
  font-size: 12px;
  color: var(--ink-3);
  margin-top: $space-1;
  font-weight: 500;
}

// ── Rate Banner ─────────────────────────────────────────
.rate-banner {
  display: flex;
  align-items: baseline;
  gap: $space-3;
  padding: $space-5 $space-6;
  margin-bottom: $space-6;
  border-radius: $radius;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  box-shadow: $shadow-sm;

  @include mobile {
    padding: $space-4 $space-4;
  }
}

.rate-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-3);
  font-family: $font-body;
}

.rate-value {
  font-family: $font-display;
  font-size: 56px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;

  @include mobile {
    font-size: 40px;
  }
}

.rate-pct {
  font-size: 28px;
  margin-left: 2px;
  color: var(--accent-hover);
}

// ── Chart Cards ─────────────────────────────────────────
.chart-stack {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.chart-card {
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: $radius;
  padding: $space-5;
  box-shadow: $shadow-md;
  transition: box-shadow var(--duration-normal) var(--ease-out);

  &:hover {
    box-shadow: $shadow-lg;
  }
}

.chart-head {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-bottom: $space-4;
  padding-bottom: $space-3;
  border-bottom: 1px solid var(--paper-line);
}

.chart-head-icon {
  width: 18px;
  height: 18px;
  color: var(--ink-3);
  flex-shrink: 0;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
  font-family: $font-body;
}

.chart-body {
  height: 220px;
}

.donut-wrap {
  max-width: 320px;
  margin: 0 auto;
}
</style>
