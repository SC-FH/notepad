<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import db, {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
  type Task,
  type TaskStatus,
  type TaskCategory,
} from '../db'
import TaskForm from '../components/TaskForm.vue'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'

const { t } = useLocale()
const { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } = useLabels()

const tasks = ref<Task[]>([])
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const filterStatus = ref<string>('all')
const filterCategory = ref<string>('all')
const searchQuery = ref('')

const loadTasks = async (): Promise<void> => {
  tasks.value = await db.tasks.toArray()
}

const filteredTasks = computed(() => {
  let result = [...tasks.value]

  if (filterStatus.value !== 'all') {
    result = result.filter(t => t.status === filterStatus.value)
  }
  if (filterCategory.value !== 'all') {
    result = result.filter(t => t.category === filterCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    )
  }

  return result.sort((a, b) => {
    // Incomplete tasks first, then by date
    if (a.status === TASK_STATUS.COMPLETED && b.status !== TASK_STATUS.COMPLETED) return 1
    if (a.status !== TASK_STATUS.COMPLETED && b.status === TASK_STATUS.COMPLETED) return -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const taskCount = computed(() => filteredTasks.value.length)

const openAddForm = (): void => {
  editingTask.value = null
  showForm.value = true
}

const openEditForm = (task: Task): void => {
  editingTask.value = { ...task }
  showForm.value = true
}

const closeForm = (): void => {
  showForm.value = false
  editingTask.value = null
}

const handleSave = async (taskData: Record<string, any>): Promise<void> => {
  if (editingTask.value) {
    await db.tasks.update(editingTask.value.id!, taskData)
  } else {
    await db.tasks.add({
      ...taskData,
      createdAt: new Date().toISOString(),
      completedAt: null,
    } as Task)
  }
  await loadTasks()
  closeForm()
}

const toggleStatus = async (task: Task): Promise<void> => {
  const newStatus = task.status === TASK_STATUS.COMPLETED
    ? TASK_STATUS.PENDING
    : TASK_STATUS.COMPLETED
  await db.tasks.update(task.id!, {
    status: newStatus,
    completedAt: newStatus === TASK_STATUS.COMPLETED ? new Date().toISOString() : null,
  })
  await loadTasks()
}

const deleteTask = async (id: number): Promise<void> => {
  await db.tasks.delete(id)
  await loadTasks()
}

const updateStatus = async (task: Task, status: TaskStatus): Promise<void> => {
  await db.tasks.update(task.id!, {
    status,
    completedAt: status === TASK_STATUS.COMPLETED ? new Date().toISOString() : null,
  })
  await loadTasks()
}

const statusOptions = computed(() => [
  { value: 'all', label: t('tasks.allStatuses') },
  ...Object.entries(STATUS_LABELS.value).map(([value, label]) => ({ value, label })),
])

const categoryOptions = computed(() => [
  { value: 'all', label: t('tasks.allCategories') },
  ...Object.entries(CATEGORY_LABELS.value).map(([value, label]) => ({ value, label })),
])

onMounted(loadTasks)
</script>

<template>
  <div>
    <div class="page-header">
      <div class="header-row">
        <div>
          <h2>{{ t('tasks.title') }}</h2>
          <p>{{ t('tasks.taskCount', { count: taskCount }) }}</p>
        </div>
        <button class="btn btn-primary" @click="openAddForm">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          {{ t('tasks.create') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          :placeholder="t('tasks.search')"
        />
      </div>
      <select v-model="filterStatus" class="form-select toolbar-select">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <select v-model="filterCategory" class="form-select toolbar-select">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Task list -->
    <div v-if="filteredTasks.length > 0" class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        :class="['task-item', { completed: task.status === TASK_STATUS.COMPLETED }]"
      >
        <div
          :class="['task-checkbox', { checked: task.status === TASK_STATUS.COMPLETED }]"
          @click="toggleStatus(task)"
        >
          <svg v-if="task.status === TASK_STATUS.COMPLETED" width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </div>

        <div class="task-info" @click="openEditForm(task)">
          <div class="task-title">{{ task.title }}</div>
          <div v-if="task.description" class="task-desc">{{ task.description }}</div>
          <div class="task-meta">
            <span :class="['badge', `badge-${task.priority}`]">{{ PRIORITY_LABELS[task.priority] }}</span>
            <span :class="['badge', `badge-${task.category}`]" style="background: var(--accent-subtle); color: var(--accent)">{{ CATEGORY_LABELS[task.category] }}</span>
            <span v-if="task.dueDate" class="task-date">{{ task.dueDate }}</span>
          </div>
        </div>

        <div class="task-actions">
          <select
            :value="task.status"
            class="status-select"
            @change="updateStatus(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
          >
            <option v-for="(label, value) in STATUS_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <button class="btn btn-icon btn-danger-ghost" @click.stop="deleteTask(task.id!)" :title="t('tasks.deleteTitle')">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </div>
      <p>{{ searchQuery ? t('tasks.noMatch') : t('tasks.noTasks') }}</p>
      <button v-if="!searchQuery" class="btn btn-primary" style="margin-top: 12px" @click="openAddForm">
        {{ t('tasks.createFirst') }}
      </button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
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

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .search-box {
    flex: 1;
    min-width: 160px;

    @include mobile {
      min-width: 100%;
    }
  }

  .toolbar-select {
    width: auto;
    min-width: 100px;

    @include mobile {
      flex: 1;
      min-width: 0;
    }
  }
}

.task-info {
  cursor: pointer;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.task-actions {
  display: flex;
  gap: 2px;
  align-items: center;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;

  .task-item:hover & { opacity: 1; }

  @include mobile {
    opacity: 0.6;
    .task-item:hover & { opacity: 1; }
  }
}

.status-select {
  width: auto;
  min-width: 72px;
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;

  @media (prefers-color-scheme: dark) {
    background: var(--bg-d);
    border-color: var(--border-d);
    color: var(--text-d);
  }

  @include mobile {
    font-size: 14px;
    min-width: 64px;
    padding: 4px 6px;
  }
}

.task-date {
  font-size: 11px;
  color: var(--text-3);
}
</style>
