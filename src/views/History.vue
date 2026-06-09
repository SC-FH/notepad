<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import db, { TASK_STATUS, type Task } from '../db'
import PdfExportModal from '../components/PdfExportModal.vue'
import TaskTags from '../components/TaskTags.vue'
import { useLocale } from '../composables/useLocale'

const { t, currentLocale } = useLocale()

export interface DayGroup {
  date: string
  label: string
  isToday: boolean
  isYesterday: boolean
  tasks: Task[]
  total: number
  done: number
}

export type GroupedItem =
  | { type: 'group'; label: string }
  | { type: 'day' } & DayGroup

const allTasks = ref<Task[]>([])
const expandedDate = ref<string | null>(null)
const exportDay = ref<DayGroup | null>(null)   // day object passed to PdfExportModal

const loadTasks = async () => {
  allTasks.value = await db.tasks.toArray()
}

/* ---- date helpers ---- */

function startOfDay(d: Date): Date {
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t
}

function diffDays(a: Date, b: Date): number {
  const msDay = 86400000
  return Math.floor((a.getTime() - b.getTime()) / msDay)
}

function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function historyDateKey(task: Task): string {
  if (task.status === TASK_STATUS.COMPLETED && task.completedAt) {
    return localDateKey(new Date(task.completedAt))
  }
  return localDateKey(new Date(task.createdAt))
}

function groupLabel(isoKey: string): string | null {
  const today = startOfDay(new Date())
  const d = new Date(isoKey + 'T00:00:00')
  const diff = diffDays(today, d)
  if (diff <= 0) return null                  // today itself — no group header
  if (diff >= 1 && diff <= today.getDay()) return t('history.thisWeek')
  if (diff >= 1 && diff <= today.getDay() + 7) return t('history.lastWeek')
  return t('history.earlier')
}

/* ---- computed ---- */

const days = computed(() => {
  // Depend on locale so labels recompute when language changes
  void currentLocale.value
  const map: Record<string, DayGroup> = {}
  const todayDate = startOfDay(new Date())
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)

  allTasks.value.forEach(task => {
    const key = historyDateKey(task)
    const d = startOfDay(new Date(key + 'T00:00:00'))
    if (!map[key]) {
      map[key] = {
        date: key,
        label: formatDate(d),
        isToday: d.getTime() === todayDate.getTime(),
        isYesterday: d.getTime() === yesterdayDate.getTime(),
        tasks: [],
        total: 0,
        done: 0,
      }
    }
    map[key].tasks.push(task)
    map[key].total++
    if (task.status === TASK_STATUS.COMPLETED) map[key].done++
  })
  return Object.values(map)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
})

/** Insert group-header rows into the flat list so the template can iterate once */
const groupedDays = computed((): GroupedItem[] => {
  const result: GroupedItem[] = []
  let lastGroup: string | symbol = Symbol()
  days.value.forEach(day => {
    const g = groupLabel(day.date)
    if (g && g !== lastGroup) {
      result.push({ type: 'group', label: g })
      lastGroup = g
    }
    result.push({ type: 'day', ...day })
  })
  return result
})

function formatDate(d: Date): string {
  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.getTime() === today.getTime()) return t('history.today')
  if (d.getTime() === yesterday.getTime()) return t('history.yesterday')
  return d.toLocaleDateString(currentLocale.value, { month: 'long', day: 'numeric', weekday: 'short' })
}

const toggleExpand = (date: string): void => {
  expandedDate.value = expandedDate.value === date ? null : date
}

const rate = (day: DayGroup): number => day.total === 0 ? 0 : Math.round((day.done / day.total) * 100)

onMounted(loadTasks)
</script>

<template>
  <div class="history-page">
    <!-- ─── Header ─────────────────────────────────────── -->
    <div class="page-head">
      <div class="page-head-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div>
        <h2 class="page-title">{{ t('history.title') }}</h2>
        <p class="page-sub">{{ t('history.subtitle') }}</p>
      </div>
    </div>

    <!-- ─── Empty state ─────────────────────────────────── -->
    <div v-if="days.length === 0" class="empty-state">
      <div class="empty-icon-wrap" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <p class="empty-title">{{ t('history.emptyTitle') }}</p>
      <p class="empty-hint">{{ t('history.emptyHint') }}</p>
    </div>

    <!-- ─── Day list ─────────────────────────────────────── -->
    <div v-else class="day-list">
      <template v-for="item in groupedDays" :key="item.type === 'group' ? 'g-' + item.label : item.date">

        <!-- group separator -->
        <div v-if="item.type === 'group'" class="group-label">
          <span class="group-label-text">{{ item.label }}</span>
          <span class="group-label-line"></span>
        </div>

        <!-- day card -->
        <div
          v-else
          class="day-card"
          :class="{ expanded: expandedDate === item.date }"
          role="button"
          :aria-expanded="expandedDate === item.date"
          :aria-label="`${item.label} — ${t('history.taskCompletion', { done: item.done, total: item.total })}`"
          tabindex="0"
          @click="toggleExpand(item.date)"
          @keydown.enter="toggleExpand(item.date)"
          @keydown.space.prevent="toggleExpand(item.date)"
        >
          <div class="day-row">
            <div class="day-left">
              <span class="day-name">{{ item.label }}</span>
              <span v-if="item.isToday" class="badge badge--today">{{ t('history.todayBadge') }}</span>
              <span v-else-if="item.isYesterday" class="badge badge--yesterday">{{ t('history.yesterdayBadge') }}</span>
              <span class="day-date">{{ item.date }}</span>
            </div>
            <div class="day-right">
              <div class="mini-track">
                <div
                  class="mini-fill"
                  :style="{ width: rate(item) + '%' }"
                ></div>
              </div>
              <span class="day-fraction">{{ item.done }}/{{ item.total }}</span>
              <button
                class="export-btn"
                @click.stop="exportDay = item"
                :aria-label="t('history.exportPdf')"
                :title="t('history.exportPdf')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <span class="expand-arrow" :class="{ open: expandedDate === item.date }" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
          </div>

          <!-- expandable detail -->
          <div class="day-detail-wrap" :class="{ open: expandedDate === item.date }">
            <div class="day-detail">
              <div
                v-for="task in item.tasks"
                :key="task.id"
                class="task-item"
              >
                <span :class="['status-dot', task.status]"></span>
                <div class="task-main">
                  <span :class="['task-text', { done: task.status === TASK_STATUS.COMPLETED }]">
                    {{ task.title }}
                  </span>
                  <TaskTags :category="task.category" :priority="task.priority" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- ─── PDF Export Modal ─────────────────────────────── -->
    <PdfExportModal
      :visible="exportDay !== null"
      :day="exportDay"
      @close="exportDay = null"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

/* ═══════════════════════════════════════════════════════
   Page layout
   ═══════════════════════════════════════════════════════ */

.history-page {
  --h-gap:       var(--space-6);
  --card-pad:    var(--space-5);
  --card-radius: var(--radius-lg);
  width: min(100%, 880px);
  margin: 0 auto;
}

/* ─── Header ──────────────────────────────────────────── */

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
  border-radius: var(--radius);
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

/* ═══════════════════════════════════════════════════════
   Empty state
   ═══════════════════════════════════════════════════════ */

.empty-state {
  text-align: center;
  padding: var(--space-10) var(--space-6);
}

.empty-icon-wrap {
  display: inline-grid;
  place-items: center;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-xl);
  background: var(--cream-dark);
  color: var(--ink-4);
  margin-bottom: var(--space-5);

  @include mobile {
    width: 80px;
    height: 80px;

    svg {
      width: 48px;
      height: 48px;
    }
  }
}

.empty-title {
  font-family: $font-display;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: var(--space-2);
}

.empty-hint {
  font-size: 14px;
  color: var(--ink-3);
}

/* ═══════════════════════════════════════════════════════
   Group separator label
   ═══════════════════════════════════════════════════════ */

.group-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
  margin-bottom: var(--space-2);
  padding: 0 var(--space-1);
}

.group-label:first-child {
  margin-top: 0;
}

.group-label-text {
  font-family: $font-ui;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-4);
  white-space: nowrap;

  @include mobile {
    font-size: 12px;
  }
}

.group-label-line {
  flex: 1;
  height: 1px;
  background: var(--paper-line);
}

/* ═══════════════════════════════════════════════════════
   Day list & cards
   ═══════════════════════════════════════════════════════ */

.day-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day-card {
  padding: var(--card-pad) var(--card-pad) var(--card-pad) var(--space-6);
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: var(--card-radius);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);

  &:hover {
    background: var(--cream);
    border-color: var(--accent-muted);
  }

  &.expanded {
    border-color: var(--accent);
  }

  @include mobile {
    padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  }
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  @include mobile {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
}

.day-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex: 1;
  overflow: hidden;

  @include mobile {
    flex-wrap: wrap;
    gap: var(--space-2);
    overflow: visible;
  }
}

.day-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  overflow-wrap: anywhere;
}

/* ─── Badges ──────────────────────────────────────────── */

.badge {
  display: inline-block;
  font-family: $font-ui;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge--today {
  background: var(--amber-subtle);
  color: var(--amber);
}

.badge--yesterday {
  background: var(--gray-100);
  color: var(--gray-500);
}

.day-date {
  font-size: 12px;
  color: var(--ink-3);
  flex-shrink: 0;

  @include mobile {
    display: none;
  }
}

/* ─── Right side (progress + fraction + arrow) ────────── */

.day-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;

  @include mobile {
    width: 100%;
    gap: var(--space-2);
  }
}

.mini-track {
  width: 64px;
  height: 6px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;

  @include mobile {
    width: auto;
    flex: 1;
  }
}

.mini-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--green-light), var(--green));
  transition: width 0.4s var(--ease-out);
}

.day-fraction {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 600;
  min-width: 28px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-4);
  border-radius: var(--radius);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out),
              background var(--duration-fast) var(--ease-out);
  flex-shrink: 0;

  &:hover {
    color: var(--accent);
    background: var(--accent-subtle);
    border-color: var(--accent-muted);
  }
}

.expand-arrow {
  display: inline-flex;
  color: var(--ink-4);
  transition: transform var(--duration-normal) var(--ease-out);
  &.open { transform: rotate(180deg); }
}

/* ═══════════════════════════════════════════════════════
   Expandable detail panel
   ═══════════════════════════════════════════════════════ */

.day-detail-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-out);
  overflow: hidden;

  &.open {
    grid-template-rows: 1fr;
  }
}

.day-detail {
  min-height: 0;
  overflow: hidden;
}

/* inner content fades in only when open */
.day-detail-wrap.open .day-detail {
  animation: detailFadeIn var(--duration-slow) var(--ease-out) forwards;
}

@keyframes detailFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* nested task list card */
.day-detail {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--paper-line);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  background: var(--cream);
  border: 1px solid transparent;
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);

  &:hover {
    background: var(--cream-dark);
    border-color: var(--paper-line);
  }
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 9px;

  &.pending     { background: var(--ink-4); }
  &.in_progress { background: var(--accent); }
  &.completed   { background: var(--green); }
  &.cancelled   { background: var(--red); }
}

.task-main {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

.task-text {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  font-size: 14px;
  color: var(--ink);
  overflow-wrap: anywhere;

  &.done {
    text-decoration: line-through;
    color: var(--ink-3);
  }
}
</style>
