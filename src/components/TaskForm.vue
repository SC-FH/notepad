<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskCategory,
} from '../db'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'

const { t } = useLocale()
const { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } = useLabels()

const props = defineProps<{
  task: Task | null
}>()

const emit = defineEmits<{
  save: [data: Record<string, any>]
  cancel: []
}>()

const title = ref('')
const description = ref('')
const status = ref<TaskStatus>(TASK_STATUS.PENDING)
const priority = ref<TaskPriority>(TASK_PRIORITY.MEDIUM)
const category = ref<TaskCategory>(TASK_CATEGORY.OTHER)
const dueDate = ref('')

watch(() => props.task, (task) => {
  if (task) {
    title.value = task.title
    description.value = task.description || ''
    status.value = task.status
    priority.value = task.priority
    category.value = task.category
    dueDate.value = task.dueDate || ''
  } else {
    title.value = ''
    description.value = ''
    status.value = TASK_STATUS.PENDING
    priority.value = TASK_PRIORITY.MEDIUM
    category.value = TASK_CATEGORY.OTHER
    dueDate.value = ''
  }
}, { immediate: true })

const isEditing = computed(() => !!props.task)

const handleSave = (): void => {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('save', {
    title: trimmed,
    description: description.value.trim(),
    status: status.value,
    priority: priority.value,
    category: category.value,
    dueDate: dueDate.value || null,
  })
}

const onKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSave()
  }
  if (e.key === 'Escape') {
    emit('cancel')
  }
}
</script>

<template>
  <div class="task-form" @keydown="onKeydown">
    <h3 class="form-title">{{ isEditing ? t('form.editTask') : t('form.newTask') }}</h3>

    <div class="form-body">
      <!-- Title -->
      <div class="form-field">
        <label class="form-label">{{ t('form.titleLabel') }}</label>
        <input
          v-model="title"
          type="text"
          class="form-input"
          :placeholder="t('form.titlePlaceholder')"
          autofocus
        />
      </div>

      <!-- Description -->
      <div class="form-field">
        <label class="form-label">{{ t('form.descLabel') }}</label>
        <textarea
          v-model="description"
          class="form-textarea"
          :placeholder="t('form.descPlaceholder')"
          rows="2"
        ></textarea>
      </div>

      <!-- Row: Priority + Category -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">{{ t('form.priorityLabel') }}</label>
          <select v-model="priority" class="form-select">
            <option v-for="(label, value) in PRIORITY_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">{{ t('form.categoryLabel') }}</label>
          <select v-model="category" class="form-select">
            <option v-for="(label, value) in CATEGORY_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Row: Status + Due Date -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">{{ t('form.statusLabel') }}</label>
          <select v-model="status" class="form-select">
            <option v-for="(label, value) in STATUS_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">{{ t('form.dueDateLabel') }}</label>
          <input v-model="dueDate" type="date" class="form-input" />
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-ghost" @click="emit('cancel')">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" :disabled="!title.trim()" @click="handleSave">
        {{ t('form.save') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.task-form {
  width: 100%;
  max-width: 480px;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-xl);
  padding: var(--space-6);

  @include mobile {
    padding: var(--space-4);
    max-width: 100%;
    border-radius: var(--radius-lg);
  }
}

.form-title {
  font-family: $font-display;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 var(--space-5) 0;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: flex;
  gap: var(--space-4);

  .form-field { flex: 1; }

  @include mobile {
    flex-direction: column;
    gap: var(--space-3);
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
  font-family: $font-body;
  color: var(--ink);
  background: var(--cream);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-out);
  box-sizing: border-box;

  &:focus { border-color: var(--accent); }

  @include mobile {
    font-size: 16px; // prevent iOS zoom on focus
  }
}

.form-textarea {
  resize: vertical;
  min-height: 48px;
  line-height: 1.5;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--paper-line);
}

.btn {
  font-family: $font-ui;
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-3);
  &:hover { background: var(--cream); }
}

.btn-primary {
  background: var(--accent);
  color: white;
  &:hover { background: var(--accent-hover); }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
