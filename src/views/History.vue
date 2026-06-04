<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import db, { TASK_STATUS, type Task } from '../db'
import PdfExportModal from '../components/PdfExportModal.vue'

export interface DayGroup {
  date: string
  label: string
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

function groupLabel(isoKey: string): string | null {
  const today = startOfDay(new Date())
  const d = new Date(isoKey + 'T00:00:00')
  const diff = diffDays(today, d)
  if (diff <= 0) return null                  // today itself — no group header
  if (diff >= 1 && diff <= today.getDay()) return '本周'
  if (diff >= 1 && diff <= today.getDay() + 7) return '上周'
  return '更早'
}

/* ---- computed ---- */

const days = computed(() => {
  const map: Record<string, DayGroup> = {}
  allTasks.value.forEach(t => {
    const d = startOfDay(new Date(t.createdAt))
    const key = d.toISOString().slice(0, 10)
    if (!map[key]) {
      map[key] = { date: key, label: formatDate(d), tasks: [], total: 0, done: 0 }
    }
    map[key].tasks.push(t)
    map[key].total++
    if (t.status === TASK_STATUS.COMPLETED) map[key].done++
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
  if (d.getTime() === today.getTime()) return '今天'
  if (d.getTime() === yesterday.getTime()) return '昨天'
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekday}`
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
        <h2 class="page-title">历史记录</h2>
        <p class="page-sub">查看往日任务</p>
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
      <p class="empty-title">还没有任何记录</p>
      <p class="empty-hint">完成任务后，这里会展示你的历史进度</p>
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
          :aria-label="`${item.label} — ${item.done}/${item.total} 任务完成`"
          tabindex="0"
          @click="toggleExpand(item.date)"
          @keydown.enter="toggleExpand(item.date)"
          @keydown.space.prevent="toggleExpand(item.date)"
        >
          <div class="day-row">
            <div class="day-left">
              <span class="day-name">{{ item.label }}</span>
              <span v-if="item.label === '今天'" class="badge badge--today">今日</span>
              <span v-else-if="item.label === '昨天'" class="badge badge--yesterday">昨日</span>
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
                aria-label="导出 PDF"
                title="导出 PDF"
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
                <span :class="['task-text', { done: task.status === TASK_STATUS.COMPLETED }]">
                  {{ task.title }}
                </span>
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
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-4);
  white-space: nowrap;
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
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
  will-change: transform;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &.expanded {
    border-color: var(--accent-subtle);
    box-shadow: var(--shadow-md);
  }
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.day-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.day-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}

/* ─── Badges ──────────────────────────────────────────── */

.badge {
  display: inline-block;
  font-family: $font-ui;
  font-size: 11px;
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
}

/* ─── Right side (progress + fraction + arrow) ────────── */

.day-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.mini-track {
  width: 64px;
  height: 6px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
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
  width: 28px;
  height: 28px;
  border: none;
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
  align-items: center;
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

  &.pending     { background: var(--ink-4); }
  &.in_progress { background: var(--blue); }
  &.completed   { background: var(--green); }
  &.cancelled   { background: var(--red); }
}

.task-text {
  font-size: 14px;
  color: var(--ink);

  &.done {
    text-decoration: line-through;
    color: var(--ink-3);
  }
}
</style>
