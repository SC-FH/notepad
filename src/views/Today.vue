<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue'
import db, {
  TASK_STATUS,
  TASK_CATEGORY,
  type Task,
  type TaskStatus,
  type TaskCategory,
  type TaskFormData,
} from '../db'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'
import TaskForm from '../components/TaskForm.vue'
import TaskTags from '../components/TaskTags.vue'

const { t, currentLocale } = useLocale()
const { CATEGORY_LABELS } = useLabels()

const tasks = ref<Task[]>([])
const newTitle = ref('')
const selectedCategory = ref<TaskCategory>(TASK_CATEGORY.WORK)
const inputRef = ref<HTMLInputElement | null>(null)
const editingId = ref<number | null>(null)
const editText = ref('')
const editRef = ref<HTMLInputElement | null>(null)
const removingId = ref<number | null>(null)
const showForm = ref(false)
const editingTask = ref<Task | null>(null)

const setEditRef = (el: Element | ComponentPublicInstance | null): void => {
  editRef.value = el instanceof HTMLInputElement ? el : null
}

// Reactive date — updates on midnight crossover via visibilitychange
const today = ref(startOfDay(new Date()))
const todayStr = computed(() => today.value.toISOString().slice(0, 10))

function startOfDay(d: Date): Date {
  d.setHours(0, 0, 0, 0)
  return d
}

function refreshDate(): void {
  const now = startOfDay(new Date())
  if (now.getTime() !== today.value.getTime()) {
    today.value = now
    loadTasks()
  }
}

let visibilityHandler: (() => void) | null = null
const todayDay = computed(() => today.value.toLocaleDateString(currentLocale.value, { day: 'numeric' }))
const todayMonthWeekday = computed(() => today.value.toLocaleDateString(currentLocale.value, {
  month: 'long',
  weekday: 'long',
}))

const loadTasks = async (): Promise<void> => {
  const all = await db.tasks.toArray()
  const todayMs = today.value.getTime()
  tasks.value = all
    .filter(task => {
      // 当天创建的任务全部显示
      const d = new Date(task.createdAt)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() === todayMs) return true
      // 往日未完成的任务顺延到今天
      if (task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.IN_PROGRESS) return true
      // 今天完成的往日任务也显示（避免刷新后消失）
      if (task.status === TASK_STATUS.COMPLETED && task.completedAt) {
        const c = new Date(task.completedAt)
        c.setHours(0, 0, 0, 0)
        return c.getTime() === todayMs
      }
      // 今天取消的往日任务也显示
      if (task.status === TASK_STATUS.CANCELLED && task.completedAt) {
        const c = new Date(task.completedAt)
        c.setHours(0, 0, 0, 0)
        return c.getTime() === todayMs
      }
      return false
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

const pending = computed(() => tasks.value.filter(task => task.status === TASK_STATUS.PENDING))
const inProgress = computed(() => tasks.value.filter(task => task.status === TASK_STATUS.IN_PROGRESS))
const done = computed(() => tasks.value.filter(task => task.status === TASK_STATUS.COMPLETED))
const cancelled = computed(() => tasks.value.filter(task => task.status === TASK_STATUS.CANCELLED))
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
    category: selectedCategory.value,
    dueDate: todayStr.value,
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

const formatTime = (isoStr: string): string => {
  if (!isoStr) return ""
  return new Date(isoStr).toLocaleTimeString(currentLocale.value, { hour: "2-digit", minute: "2-digit" })
}

const restoreTask = async (task: Task): Promise<void> => {
  await db.tasks.update(task.id!, { status: TASK_STATUS.PENDING, completedAt: null })
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
  if (task.id === undefined || editingId.value === task.id) return
  editingId.value = task.id
  editText.value = task.title
  nextTick(() => editRef.value?.focus())
}

const saveEdit = async (task: Task): Promise<void> => {
  if (task.id === undefined || editingId.value !== task.id) return
  const title = editText.value.trim()
  if (title && title !== task.title) {
    await db.tasks.update(task.id, { title })
  }
  editingId.value = null
  await loadTasks()
}

const cancelEdit = () => { editingId.value = null }

const cancelTask = async (task: Task): Promise<void> => {
  await db.tasks.update(task.id!, {
    status: TASK_STATUS.CANCELLED,
    completedAt: new Date().toISOString(),
  })
  await loadTasks()
}

const openEditForm = (task: Task): void => {
  editingTask.value = { ...task }
  showForm.value = true
}

const closeForm = (): void => {
  showForm.value = false
  editingTask.value = null
}

const handleSave = async (taskData: TaskFormData): Promise<void> => {
  if (editingTask.value) {
    await db.tasks.update(editingTask.value.id!, taskData)
  }
  await loadTasks()
  closeForm()
}

const onKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addTask()
  }
}

onMounted(() => {
  loadTasks()
  visibilityHandler = refreshDate
  document.addEventListener('visibilitychange', visibilityHandler)
})
onUnmounted(() => {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
  }
})
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
      <label for="task-input" class="sr-only">{{ t('today.addTask') }}</label>
      <div class="input-wrapper">
        <label for="task-category" class="sr-only">{{ t('form.categoryLabel') }}</label>
        <select
          id="task-category"
          v-model="selectedCategory"
          class="quick-category-select"
          :aria-label="t('form.categoryLabel')"
        >
          <option v-for="(label, value) in CATEGORY_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <span class="input-icon" aria-hidden="true">+</span>
        <input
          id="task-input"
          ref="inputRef"
          v-model="newTitle"
          class="note-input"
          :placeholder="t('today.placeholder')"
          :aria-label="t('today.addTask')"
          @keydown="onKeydown"
        />
      </div>
    </div>

    <!-- Pending -->
    <section v-if="pending.length > 0" class="section">
      <div class="section-label">
        <span class="badge badge-pending">{{ t('today.pending') }} <span class="badge-count">{{ pending.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in pending"
          :key="task.id"
          class="task-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring pending-ring" :aria-label="t('today.markInProgress', { title: task.title })" @click="cycleStatus(task)">
            <span class="ring-inner"></span>
          </button>
          <div class="task-content" @click="startEdit(task)">
            <template v-if="editingId === task.id">
              <input
                :ref="setEditRef"
                v-model="editText"
                class="edit-field"
                @click.stop
                @keydown.enter.prevent="saveEdit(task)"
                @keydown.escape="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
            <template v-else>
              <span class="task-text">{{ task.title }}</span>
              <TaskTags :category="task.category" :priority="task.priority" />
            </template>
          </div>
          <button class="action-btn edit-btn" :aria-label="t('form.editTask')" @click.stop="openEditForm(task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn cancel-btn" :aria-label="t('today.markCancelled', { title: task.title })" @click.stop="cancelTask(task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </button>
          <button class="action-btn remove-btn" :aria-label="t('today.deleteTask', { title: task.title })" @click.stop="remove(task.id!)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
        <span class="badge badge-active">{{ t('today.inProgress') }} <span class="badge-count">{{ inProgress.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in inProgress"
          :key="task.id"
          class="task-item active-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring active-ring" :aria-label="t('today.markCompleted', { title: task.title })" @click="cycleStatus(task)">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
            </svg>
          </button>
          <div class="task-content" @click="startEdit(task)">
            <template v-if="editingId === task.id">
              <input
                :ref="setEditRef"
                v-model="editText"
                class="edit-field"
                @click.stop
                @keydown.enter.prevent="saveEdit(task)"
                @keydown.escape="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
            <template v-else>
              <span class="task-text active-text">{{ task.title }}</span>
              <TaskTags :category="task.category" :priority="task.priority" />
            </template>
          </div>
          <button class="action-btn edit-btn" :aria-label="t('form.editTask')" @click.stop="openEditForm(task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn cancel-btn" :aria-label="t('today.markCancelled', { title: task.title })" @click.stop="cancelTask(task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </button>
          <button class="action-btn remove-btn" :aria-label="t('today.deleteTask', { title: task.title })" @click.stop="remove(task.id!)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
        <span class="badge badge-done">{{ t('today.completed') }} <span class="badge-count">{{ done.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in done"
          :key="task.id"
          class="task-item done-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring done-ring" :aria-label="t('today.markPending', { title: task.title })" @click="cycleStatus(task)">
            <svg class="check-svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="task-content task-content-static">
            <span class="task-text strike">
              <span class="strike-inner">{{ task.title }}</span>
            </span>
            <TaskTags :category="task.category" :priority="task.priority" />
            <span v-if="task.completedAt" class="task-time">{{ formatTime(task.completedAt!) }}</span>
          </div>
          <button class="action-btn edit-btn" :aria-label="t('form.editTask')" @click.stop="openEditForm(task)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn remove-btn" :aria-label="t('today.deleteTask', { title: task.title })" @click.stop="remove(task.id!)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Cancelled -->
    <section v-if="cancelled.length > 0" class="section">
      <div class="section-label">
        <span class="badge badge-cancelled">{{ t('db.status.cancelled') }} <span class="badge-count">{{ cancelled.length }}</span></span>
      </div>
      <div class="task-list">
        <div
          v-for="task in cancelled"
          :key="task.id"
          class="task-item cancelled-item"
          :class="{ 'task-removing': removingId === task.id }"
        >
          <button class="ring cancelled-ring" :aria-label="t('today.markPending', { title: task.title })" @click="restoreTask(task)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
            </svg>
          </button>
          <div class="task-content task-content-static">
            <span class="task-text cancelled-text">{{ task.title }}</span>
            <TaskTags :category="task.category" :priority="task.priority" />
          </div>
          <button class="action-btn remove-btn" :aria-label="t('today.deleteTask', { title: task.title })" @click.stop="remove(task.id!)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
      <p class="empty-title">{{ t('today.emptyTitle') }}</p>
      <p class="empty-sub">{{ t('today.emptyHint') }}</p>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showForm" class="modal-overlay" @click.self="closeForm" role="dialog" aria-modal="true" :aria-label="editingTask ? t('form.editTask') : t('form.newTask')">
          <transition name="modal">
            <TaskForm
              v-if="showForm"
              :task="editingTask"
              @save="handleSave"
              @cancel="closeForm"
            />
          </transition>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

// ── CSS Custom Properties (on component root, not :root) ──
.notepad {
  --today-date-size: 48px;
  --today-date-meta-size: 15px;
  --today-progress-h: 8px;
  --today-card-bg: var(--paper);
  --today-card-hover-bg: var(--cream);
  --today-card-hover-y: 0;
  --today-card-shadow: none;
  --today-card-shadow-hover: none;
  --today-card-border: 1px solid var(--paper-line);
  --today-checkbox-size: 26px;
  --today-divider-color: var(--ink-4);
  --today-input-shadow: none;
  --today-input-focus-glow: 0 0 0 3px var(--accent-subtle);
  --today-gap-xs: 4px;
  --today-gap-sm: 8px;
  --today-gap-md: 16px;
  --today-gap-lg: 24px;
  --today-gap-xl: 32px;
  --today-radius: #{$radius};
  --today-radius-lg: #{$radius-lg};
  width: min(100%, 720px);
  margin: 0 auto;
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
  letter-spacing: 0;

  @include mobile {
    font-size: 36px;
  }
}

.date-meta {
  font-family: $font-body;
  font-size: var(--today-date-meta-size);
  color: var(--ink-3);
  font-weight: 500;

  @include mobile {
    font-size: 13px;
  }
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
  height: 1px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 1px;
    background: var(--paper-line);
    opacity: 1;
    border-radius: 1px;
  }

  &::after {
    display: none;
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
  background: var(--accent);
  border-radius: var(--today-progress-h);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  &::after {
    display: none;
  }

  &.progress-complete {
    background: var(--green);
    animation: none;
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
  background: var(--paper);
  border: 1px solid var(--paper-line);
  padding: var(--space-2);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  border-radius: var(--radius-lg);
  overflow: visible;

  &:focus-within {
    border-color: var(--accent-muted);
    box-shadow: var(--today-input-shadow), var(--today-input-focus-glow);
    background: var(--paper);
  }

  @include mobile {
    flex-wrap: wrap;
    align-items: stretch;
    padding: 8px;
  }
}

.quick-category-select {
  flex: 0 0 auto;
  min-width: 128px;
  height: 44px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--paper-line);
  border-radius: var(--radius);
  color: var(--ink-2);
  background-color: var(--paper);
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 2L6 6L10.5 2' stroke='%2364748b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px 8px;
  appearance: none;
  outline: none;
  cursor: pointer;
  font-family: $font-ui;
  font-size: 13px;
  font-weight: 700;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);

  &:hover {
    border-color: var(--accent-muted);
    background-color: var(--cream);
  }

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-subtle);
  }

  @include mobile {
    width: 100%;
    min-width: 0;
    height: 44px;
    font-size: 16px;
  }
}

.input-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: $font-ui;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-subtle);
  line-height: 1;
  user-select: none;
  flex-shrink: 0;
}

.note-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  font-family: $font-body;
  color: var(--ink);
  background: transparent;
  padding: 2px 0;
  line-height: 1.6;

  &::placeholder {
    color: var(--ink-3);
    font-style: italic;
  }

  @include mobile {
    font-size: 16px; // prevent iOS zoom on focus
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
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border-radius: $radius-full;
  font-family: $font-ui;

  @include mobile {
    font-size: 12px;
    padding: 3px 10px;
  }
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: $radius-full;
  background: rgba(0, 0, 0, 0.08);
  font-size: 11px;
  padding: 0 5px;

  @include mobile {
    font-size: 11px;
    min-width: 20px;
    height: 20px;
  }
}

.badge-pending {
  color: var(--ink-2);
  background: var(--cream-dark);
}

.badge-active {
  color: var(--accent);
  background: var(--accent-subtle);
  .badge-count { background: var(--accent-subtle); }
}

.badge-done {
  color: var(--green);
  background: var(--green-subtle);
  .badge-count { background: var(--green-subtle); }
}

.badge-cancelled {
  color: var(--red);
  background: var(--red-subtle);
  .badge-count { background: var(--red-subtle); }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

// ── Task item (card style) ────────────────────────────
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--today-radius);
  background: var(--today-card-bg);
  border: var(--today-card-border);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    opacity 0.3s ease;

  &:hover {
    background: var(--today-card-hover-bg);
    border-color: var(--accent-muted);
  }
}

.active-item {
  background: var(--accent-subtle);
  border-left: 3px solid var(--accent);
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
    background: var(--accent);
    transform-origin: top;
    animation: border-expand 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  &:hover {
    background: var(--accent-subtle);
    border-color: var(--accent);
  }
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
  min-width: var(--today-checkbox-size);
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
  border-color: var(--accent);
  background: var(--accent-subtle);
  transform: scale(1.05);
}

.active-ring {
  color: var(--accent);
  .ring-inner {
    border-color: var(--accent);
    background: var(--accent);
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
  overflow: visible;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--today-gap-sm);
}

.task-content-static {
  cursor: default;
}

.task-time {
  font-family: $font-ui;
  font-size: 11px;
  color: var(--ink-4);
  white-space: nowrap;
}

.task-text {
  display: block;
  flex: 1 1 260px;
  min-width: 0;
  max-width: 100%;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
  overflow-wrap: anywhere;

  &.active-text {
    font-weight: 600;
    color: var(--accent);
  }

  &.strike {
    color: var(--ink-3);
    position: relative;
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

  @include mobile {
    font-size: 16px; // prevent iOS zoom
  }
}

// ── Action buttons (edit, cancel, delete) ─────────────
.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius;
  flex-shrink: 0;
  padding: 0;

  svg {
    transition: transform 0.2s ease;
  }
}

.task-item:hover .action-btn { opacity: 1; }

@media (hover: hover) and (pointer: fine) {
  .action-btn {
    opacity: 0.28;
  }
}

@include mobile {
  .task-item {
    gap: var(--space-2);
    padding: 10px;
  }

  .task-item .action-btn { opacity: 0.78; }
  .task-item:hover .action-btn { opacity: 1; }

  .task-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding-top: 5px;
  }

  .task-text {
    flex-basis: auto;
  }
}

.edit-btn:hover {
  color: var(--accent);
  background: var(--accent-subtle);
  border-color: var(--accent-muted);
  svg { transform: scale(1.1); }
}

.cancel-btn:hover {
  color: var(--amber);
  background: var(--amber-subtle);
  border-color: var(--amber);
  svg { transform: scale(1.1); }
}

.remove-btn:hover {
  color: var(--red);
  background: var(--red-subtle);
  border-color: var(--red);
  svg { transform: scale(1.1); }
}

.cancelled-item {
  opacity: 0.45;
  &:hover { opacity: 0.7; }
}

.cancelled-text {
  color: var(--ink-3);
  text-decoration: line-through;
  text-decoration-color: var(--ink-4);
}

.cancelled-ring {
  color: var(--ink-4);
  opacity: 0.6;
  &:hover {
    opacity: 1;
    color: var(--accent);
  }
}

// ── Modal ─────────────────────────────────────────────
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
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
  animation: none;
}

.notebook-cover {
  width: 80px;
  height: 100px;
  background: linear-gradient(135deg, var(--cream-dark), var(--gray-200));
  border-radius: 4px 10px 10px 4px;
  position: relative;
  box-shadow: var(--shadow-md);
  overflow: hidden;

  @include mobile {
    width: 64px;
    height: 80px;
  }
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
