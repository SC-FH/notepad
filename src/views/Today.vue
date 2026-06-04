<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import db, { TASK_STATUS, type Task, type TaskStatus } from '../db'

const tasks = ref<Task[]>([])
const newTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const editingId = ref<number | null>(null)
const editText = ref('')
const editRef = ref<HTMLInputElement | null>(null)
const removingId = ref<number | null>(null)

const today = new Date()
today.setHours(0, 0, 0, 0)
const todayStr = today.toISOString().slice(0, 10)
const todayLabel = today.toLocaleDateString('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})
const todayDay = today.toLocaleDateString('zh-CN', { day: 'numeric' })
const todayMonthWeekday = today.toLocaleDateString('zh-CN', {
  month: 'long',
  weekday: 'long',
})

const loadTasks = async (): Promise<void> => {
  const all = await db.tasks.toArray()
  tasks.value = all
    .filter(t => {
      const d = new Date(t.createdAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

const pending = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.PENDING))
const inProgress = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.IN_PROGRESS))
const done = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.COMPLETED))
const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((done.value.length / tasks.value.length) * 100)
})
const isComplete = computed(() => progress.value === 100 && tasks.value.length > 0)

const addTask = async (): Promise<void> => {
  const title = newTitle.value.trim()
  if (!title) return
  await db.tasks.add({
    title,
    description: '',
    status: TASK_STATUS.PENDING,
    priority: 'medium',
    category: 'other',
    dueDate: todayStr,
    createdAt: new Date().toISOString(),
    completedAt: null,
  })
  newTitle.value = ''
  await loadTasks()
  nextTick(() => inputRef.value?.focus())
}

const cycleStatus = async (task: Task): Promise<void> => {
  let newStatus: TaskStatus
  let completedAt: string | null = null
  if (task.status === TASK_STATUS.PENDING) {
    newStatus = TASK_STATUS.IN_PROGRESS
  } else if (task.status === TASK_STATUS.IN_PROGRESS) {
    newStatus = TASK_STATUS.COMPLETED
    completedAt = new Date().toISOString()
  } else {
    newStatus = TASK_STATUS.PENDING
  }
  await db.tasks.update(task.id!, { status: newStatus, completedAt })
  await loadTasks()
}

const remove = async (id: number | undefined): Promise<void> => {
  if (id === undefined) return
  removingId.value = id
  // Wait for the fade-out animation to finish
  await new Promise(resolve => setTimeout(resolve, 300))
  await db.tasks.delete(id)
  removingId.value = null
  await loadTasks()
}

const startEdit = (task: Task): void => {
  editingId.value = task.id ?? null
  editText.value = task.title
  nextTick(() => editRef.value?.focus())
}

const saveEdit = async (task: Task): Promise<void> => {
  const title = editText.value.trim()
  if (title && title !== task.title) {
    await db.tasks.update(task.id!, { title })
  }
  editingId.value = null
  await loadTasks()
}

const cancelEdit = () => { editingId.value = null }

const onKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addTask()
  }
}

onMounted(loadTasks)
</script>

<template>
  <div class="notepad">
    <!-- Date Block -->
    <div class="date-block">
      <div class="date-display">
        <span class="date-day">{{ todayDay }}</span>
        <span class="date-meta">{{ todayMonthWeekday }}</span>
      </div>
      <span v-if="tasks.length > 0" class="date-count">
        {{ done.length }} / {{ tasks.length }}
      </span>
      <!-- Hand-drawn decorative separator -->
      <div class="hand-drawn-divider"></div>
    </div>

    <!-- Progress -->
    <div v-if="tasks.length > 0" class="progress-wrap">
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{ 'progress-complete': isComplete }"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <span class="progress-label">{{ progress }}%</span>
    </div>

    <!-- Input -->
    <div class="input-area">
      <label for="task-input" class="sr-only">添加新任务</label>
      <div class="input-wrapper">
        <span class="input-icon" aria-hidden="true">+</span>
        <input
          id="task-input"
          ref="inputRef"
          v-model="newTitle"
          class="note-input"
          placeholder="写下今天的任务..."
          aria-label="添加新任务"
          @keydown="onKeydown"
        />
      </div>
    </div>

    <!-- Pending -->
    <section v-if="pending.length > 0" class="section">
      <div class="section-label">
        <span class="badge badge-pending">待办 <span class="badge-count">{{ pending.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in pending"
          :key="task.id"
          class="task-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring pending-ring" :aria-label="`标记 '${task.title}' 为进行中`" @click="cycleStatus(task)">
            <span class="ring-inner"></span>
          </button>
          <div class="task-content" @click="startEdit(task)">
            <template v-if="editingId === task.id">
              <input
                ref="editRef"
                v-model="editText"
                class="edit-field"
                @keydown.enter="saveEdit(task)"
                @keydown.escape="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
            <template v-else>
              <span class="task-text">{{ task.title }}</span>
            </template>
          </div>
          <button class="remove-btn" :aria-label="`删除任务 '${task.title}'`" @click="remove(task.id!)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- In progress -->
    <section v-if="inProgress.length > 0" class="section">
      <div class="section-label">
        <span class="badge badge-active">进行中 <span class="badge-count">{{ inProgress.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in inProgress"
          :key="task.id"
          class="task-item active-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring active-ring" :aria-label="`标记 '${task.title}' 为已完成`" @click="cycleStatus(task)">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
            </svg>
          </button>
          <div class="task-content" @click="startEdit(task)">
            <template v-if="editingId === task.id">
              <input
                ref="editRef"
                v-model="editText"
                class="edit-field"
                @keydown.enter="saveEdit(task)"
                @keydown.escape="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
            <template v-else>
              <span class="task-text active-text">{{ task.title }}</span>
            </template>
          </div>
          <button class="remove-btn" :aria-label="`删除任务 '${task.title}'`" @click="remove(task.id!)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Done -->
    <section v-if="done.length > 0" class="section">
      <div class="section-label">
        <span class="badge badge-done">已完成 <span class="badge-count">{{ done.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in done"
          :key="task.id"
          class="task-item done-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring done-ring" :aria-label="`标记 '${task.title}' 为待办`" @click="cycleStatus(task)">
            <svg class="check-svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <span class="task-text strike">
            <span class="strike-inner">{{ task.title }}</span>
          </span>
          <button class="remove-btn" :aria-label="`删除任务 '${task.title}'`" @click="remove(task.id!)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Empty -->
    <div v-if="tasks.length === 0" class="empty-state" role="status">
      <div class="empty-notebook">
        <div class="notebook-cover">
          <div class="notebook-spine"></div>
          <div class="notebook-page">
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
            <div class="notebook-line short"></div>
          </div>
          <div class="notebook-binding">
            <div class="binding-ring"></div>
            <div class="binding-ring"></div>
            <div class="binding-ring"></div>
          </div>
        </div>
      </div>
      <p class="empty-title">今天还没有记录</p>
      <p class="empty-sub">在上方输入开始写...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

// ── CSS Custom Properties (on component root, not :root) ──
.notepad {
  --today-date-size: 48px;
  --today-date-meta-size: 15px;
  --today-progress-h: 8px;
  --today-card-bg: transparent;
  --today-card-hover-bg: var(--cream-dark);
  --today-card-hover-y: 0;
  --today-card-shadow: none;
  --today-card-shadow-hover: none;
  --today-card-border: none;
  --today-checkbox-size: 24px;
  --today-divider-color: var(--ink-4);
  --today-input-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.04);
  --today-input-focus-glow: 0 0 0 3px var(--accent-subtle);
  --today-gap-xs: 4px;
  --today-gap-sm: 8px;
  --today-gap-md: 16px;
  --today-gap-lg: 24px;
  --today-gap-xl: 32px;
  --today-radius: #{$radius};
  --today-radius-lg: #{$radius-lg};
}

// ── Date Block ────────────────────────────────────────
.date-block {
  display: flex;
  flex-direction: column;
  gap: var(--today-gap-sm);
  margin-bottom: var(--today-gap-lg);
  position: relative;
}

.date-display {
  display: flex;
  align-items: baseline;
  gap: var(--today-gap-md);
}

.date-day {
  font-family: $font-display;
  font-size: var(--today-date-size);
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -1px;
}

.date-meta {
  font-family: $font-body;
  font-size: var(--today-date-meta-size);
  color: var(--ink-3);
  font-weight: 500;
}

.date-count {
  align-self: flex-start;
  font-size: 13px;
  color: var(--ink-3);
  font-weight: 600;
  font-family: $font-body;
  margin-top: var(--today-gap-xs);
}

// Hand-drawn decorative separator (CSS only)
.hand-drawn-divider {
  margin-top: var(--today-gap-sm);
  height: 6px;
  position: relative;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      var(--today-divider-color) 0px,
      var(--today-divider-color) 8px,
      transparent 8px,
      transparent 12px
    );
    opacity: 0.4;
    border-radius: 1px;
    // Slight wavy effect via clip-path
    clip-path: polygon(
      0% 40%, 3% 60%, 6% 35%, 10% 55%, 14% 30%, 18% 60%,
      22% 35%, 26% 55%, 30% 40%, 34% 60%, 38% 30%, 42% 55%,
      46% 40%, 50% 60%, 54% 35%, 58% 55%, 62% 30%, 66% 60%,
      70% 40%, 74% 55%, 78% 35%, 82% 60%, 86% 40%, 90% 55%,
      94% 35%, 98% 55%, 100% 40%,
      100% 100%, 0% 100%
    );
  }

  // A second layer with slight offset for hand-drawn feel
  &::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 3px;
    width: calc(100% - 8px);
    height: 1.5px;
    background: repeating-linear-gradient(
      90deg,
      var(--today-divider-color) 0px,
      var(--today-divider-color) 5px,
      transparent 5px,
      transparent 9px
    );
    opacity: 0.2;
    border-radius: 1px;
  }
}

// ── Progress ──────────────────────────────────────────
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--today-gap-lg);
}

.progress-track {
  flex: 1;
  height: var(--today-progress-h);
  background: var(--paper-line);
  border-radius: var(--today-progress-h);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--green-light));
  border-radius: var(--today-progress-h);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  // Shimmer overlay
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.25) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: progress-shimmer 2s ease-in-out infinite;
  }

  &.progress-complete {
    background: linear-gradient(90deg, var(--green), var(--green-light));
    animation: progress-pulse 2s ease-in-out infinite;
  }
}

@keyframes progress-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 var(--green-subtle);
  }
  50% {
    opacity: 0.85;
    box-shadow: 0 0 8px 2px var(--green-subtle);
  }
}

.progress-label {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 700;
  min-width: 36px;
  text-align: right;
  font-family: $font-ui;
}

// ── Input ─────────────────────────────────────────────
.input-area {
  margin-bottom: var(--today-gap-lg);
  padding-bottom: var(--today-gap-lg);
  border-bottom: 1px dashed var(--paper-line);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--today-gap-sm);
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 10px;
  transition: box-shadow 0.25s ease;
  border-radius: var(--radius-xl);
  overflow: hidden;

  &:focus-within {
    box-shadow: var(--today-input-shadow), var(--today-input-focus-glow);
    background: var(--paper);
  }
}

.input-icon {
  font-size: 20px;
  font-weight: 300;
  color: var(--ink-3);
  line-height: 1;
  user-select: none;
  transition: color 0.2s ease;
  flex-shrink: 0;

  .input-wrapper:focus-within & {
    color: var(--accent);
  }
}

.note-input {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  font-size: 15px;
  font-family: $font-body;
  color: var(--ink);
  background: transparent;
  padding: 2px 0;
  line-height: 1.6;

  &::placeholder {
    color: var(--ink-3);
    font-style: italic;
  }
}

// ── Sections ──────────────────────────────────────────
.section {
  margin-bottom: var(--today-gap-lg);
}

.section-label {
  margin-bottom: var(--today-gap-sm);
  padding-left: 2px;
}

// Badge (pill shape)
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: $radius-full;
  font-family: $font-ui;
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: $radius-full;
  background: rgba(0, 0, 0, 0.08);
  font-size: 10px;
  padding: 0 5px;
}

.badge-pending {
  color: var(--ink-2);
  background: var(--cream-dark);
}

.badge-active {
  color: var(--blue);
  background: var(--blue-subtle);
  .badge-count { background: var(--blue-subtle); }
}

.badge-done {
  color: var(--green);
  background: var(--green-subtle);
  .badge-count { background: var(--green-subtle); }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

// ── Task item (card style) ────────────────────────────
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--today-radius);
  background: var(--today-card-bg);
  transition:
    background 0.15s ease,
    opacity 0.3s ease;

  &:hover {
    background: var(--today-card-hover-bg);
    .remove-btn { opacity: 1; }
  }
}

.active-item {
  background: var(--blue-subtle);
  border-left: 3px solid var(--blue);
  position: relative;
  overflow: hidden;

  // Animated border that expands from top to bottom
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: var(--blue);
    transform-origin: top;
    animation: border-expand 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  &:hover { background: var(--blue-subtle); }
}

@keyframes border-expand {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.done-item {
  opacity: 0.55;

  &:hover { opacity: 0.75; }
}

// Fade-out animation for removing tasks
.task-removing {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  pointer-events: none;
}

// ── Ring (checkbox) — 24px circular ───────────────────
.ring {
  width: var(--today-checkbox-size);
  height: var(--today-checkbox-size);
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  border: none;
}

.ring-inner {
  width: calc(var(--today-checkbox-size) - 4px);
  height: calc(var(--today-checkbox-size) - 4px);
  border-radius: 50%;
  border: 2px solid var(--ink-3);
  transition: all 0.25s ease;
}

.pending-ring:hover .ring-inner {
  border-color: var(--blue);
  background: var(--blue-subtle);
  transform: scale(1.05);
}

.active-ring {
  color: var(--blue);
  .ring-inner {
    border-color: var(--blue);
    background: var(--blue);
    animation: ring-fill 0.3s ease forwards;
  }
}

@keyframes ring-fill {
  from {
    transform: scale(0.7);
    opacity: 0.5;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.done-ring {
  color: white;
  width: var(--today-checkbox-size);
  height: var(--today-checkbox-size);
  background: var(--green);
  border-radius: 50%;
  animation: check-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;

  .check-svg {
    animation: check-draw 0.3s ease 0.1s forwards;
    opacity: 0;
    transform: scale(0.5);
  }

  &:hover { background: var(--green); filter: brightness(0.9); }
}

@keyframes check-pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes check-draw {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

// ── Task text ─────────────────────────────────────────
.task-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.task-text {
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;

  &.active-text {
    font-weight: 600;
    color: var(--blue);
  }

  &.strike {
    color: var(--ink-3);
    position: relative;
    display: inline-block;
  }
}

// Animated strikethrough: left-to-right wipe
.strike .strike-inner {
  position: relative;
  display: inline;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1.5px;
    background: var(--ink-3);
    transform-origin: left center;
    animation: strike-wipe 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
}

@keyframes strike-wipe {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.edit-field {
  width: 100%;
  border: none;
  outline: none;
  font-size: 15px;
  font-family: $font-body;
  color: var(--ink);
  background: transparent;
  border-bottom: 1.5px solid var(--accent);
  padding: 2px 0;
}

// ── Remove button (trash icon) ────────────────────────
.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--ink-3);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  flex-shrink: 0;
  padding: 0;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--red);
    background: var(--red-subtle);
    svg { transform: scale(1.1); }
  }
}

// ── Empty state ───────────────────────────────────────
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

// CSS-drawn notebook illustration
.empty-notebook {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  animation: float 3.5s ease-in-out infinite;
}

.notebook-cover {
  width: 80px;
  height: 100px;
  background: linear-gradient(135deg, var(--cream-dark), var(--gray-200));
  border-radius: 4px 10px 10px 4px;
  position: relative;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.notebook-spine {
  position: absolute;
  left: 0;
  top: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(180deg, var(--accent), var(--accent-hover));
  border-radius: 4px 0 0 4px;
}

.notebook-page {
  position: absolute;
  left: 12px;
  top: 10px;
  right: 8px;
  bottom: 10px;
  background: var(--paper);
  border-radius: 2px 4px 4px 2px;
  padding: 10px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notebook-line {
  height: 2px;
  background: var(--paper-line);
  border-radius: 1px;
  opacity: 0.7;

  &.short { width: 60%; }
}

.notebook-binding {
  position: absolute;
  left: 6px;
  top: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
}

.binding-ring {
  width: 8px;
  height: 8px;
  border: 1.5px solid var(--ink-3);
  border-radius: 50%;
  background: transparent;
}

.empty-title {
  font-size: 17px;
  color: var(--ink-2);
  margin-bottom: 6px;
  font-weight: 600;
}

.empty-sub {
  font-size: 13px;
  color: var(--ink-3);
  font-style: italic;
}
</style>
