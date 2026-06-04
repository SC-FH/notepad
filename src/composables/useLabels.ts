import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY } from '../db'
import type { TaskStatus, TaskPriority, TaskCategory } from '../db'

export function useLabels() {
  const { t } = useI18n()

  const STATUS_LABELS = computed<Record<TaskStatus, string>>(() => ({
    [TASK_STATUS.PENDING]: t('db.status.pending'),
    [TASK_STATUS.IN_PROGRESS]: t('db.status.in_progress'),
    [TASK_STATUS.COMPLETED]: t('db.status.completed'),
    [TASK_STATUS.CANCELLED]: t('db.status.cancelled'),
  }))

  const PRIORITY_LABELS = computed<Record<TaskPriority, string>>(() => ({
    [TASK_PRIORITY.LOW]: t('db.priority.low'),
    [TASK_PRIORITY.MEDIUM]: t('db.priority.medium'),
    [TASK_PRIORITY.HIGH]: t('db.priority.high'),
    [TASK_PRIORITY.URGENT]: t('db.priority.urgent'),
  }))

  const CATEGORY_LABELS = computed<Record<TaskCategory, string>>(() => ({
    [TASK_CATEGORY.WORK]: t('db.category.work'),
    [TASK_CATEGORY.PERSONAL]: t('db.category.personal'),
    [TASK_CATEGORY.STUDY]: t('db.category.study'),
    [TASK_CATEGORY.HEALTH]: t('db.category.health'),
    [TASK_CATEGORY.OTHER]: t('db.category.other'),
  }))

  return { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS }
}
