import Dexie from 'dexie'

const db = new Dexie('NotepadDB')

db.version(1).stores({
  tasks: '++id, title, status, priority, category, createdAt, completedAt, dueDate',
})

export default db

// Task status constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

export const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  STUDY: 'study',
  HEALTH: 'health',
  OTHER: 'other',
}

export const STATUS_LABELS = {
  [TASK_STATUS.PENDING]: '待办',
  [TASK_STATUS.IN_PROGRESS]: '进行中',
  [TASK_STATUS.COMPLETED]: '已完成',
  [TASK_STATUS.CANCELLED]: '已取消',
}

export const PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: '低',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.HIGH]: '高',
  [TASK_PRIORITY.URGENT]: '紧急',
}

export const CATEGORY_LABELS = {
  [TASK_CATEGORY.WORK]: '工作',
  [TASK_CATEGORY.PERSONAL]: '个人',
  [TASK_CATEGORY.STUDY]: '学习',
  [TASK_CATEGORY.HEALTH]: '健康',
  [TASK_CATEGORY.OTHER]: '其他',
}

export const PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: '#52c41a',
  [TASK_PRIORITY.MEDIUM]: '#1890ff',
  [TASK_PRIORITY.HIGH]: '#fa8c16',
  [TASK_PRIORITY.URGENT]: '#f5222d',
}

export const STATUS_COLORS = {
  [TASK_STATUS.PENDING]: '#d9d9d9',
  [TASK_STATUS.IN_PROGRESS]: '#1890ff',
  [TASK_STATUS.COMPLETED]: '#52c41a',
  [TASK_STATUS.CANCELLED]: '#ff4d4f',
}

export const CATEGORY_COLORS = {
  [TASK_CATEGORY.WORK]: '#1890ff',
  [TASK_CATEGORY.PERSONAL]: '#722ed1',
  [TASK_CATEGORY.STUDY]: '#13c2c2',
  [TASK_CATEGORY.HEALTH]: '#eb2f96',
  [TASK_CATEGORY.OTHER]: '#8c8c8c',
}
