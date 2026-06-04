import Dexie, { type Table } from 'dexie'

// ── Task Interface ────────────────────────────────────────

export interface Task {
  id?: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  dueDate: string | null
  createdAt: string
  completedAt: string | null
}

// ── Database ──────────────────────────────────────────────

class NotepadDB extends Dexie {
  tasks!: Table<Task, number>

  constructor() {
    super('NotepadDB')
    this.version(1).stores({
      tasks: '++id, title, status, priority, category, createdAt, completedAt, dueDate',
    })
  }
}

const db = new NotepadDB()
export default db

// ── Task Status Constants ─────────────────────────────────

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]

export const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  STUDY: 'study',
  HEALTH: 'health',
  OTHER: 'other',
} as const

export type TaskCategory = (typeof TASK_CATEGORY)[keyof typeof TASK_CATEGORY]

// ── Label Maps ────────────────────────────────────────────

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUS.PENDING]: '待办',
  [TASK_STATUS.IN_PROGRESS]: '进行中',
  [TASK_STATUS.COMPLETED]: '已完成',
  [TASK_STATUS.CANCELLED]: '已取消',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: '低',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.HIGH]: '高',
  [TASK_PRIORITY.URGENT]: '紧急',
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  [TASK_CATEGORY.WORK]: '工作',
  [TASK_CATEGORY.PERSONAL]: '个人',
  [TASK_CATEGORY.STUDY]: '学习',
  [TASK_CATEGORY.HEALTH]: '健康',
  [TASK_CATEGORY.OTHER]: '其他',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: '#52c41a',
  [TASK_PRIORITY.MEDIUM]: '#1890ff',
  [TASK_PRIORITY.HIGH]: '#fa8c16',
  [TASK_PRIORITY.URGENT]: '#f5222d',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TASK_STATUS.PENDING]: '#d9d9d9',
  [TASK_STATUS.IN_PROGRESS]: '#1890ff',
  [TASK_STATUS.COMPLETED]: '#52c41a',
  [TASK_STATUS.CANCELLED]: '#ff4d4f',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TASK_CATEGORY.WORK]: '#1890ff',
  [TASK_CATEGORY.PERSONAL]: '#722ed1',
  [TASK_CATEGORY.STUDY]: '#13c2c2',
  [TASK_CATEGORY.HEALTH]: '#eb2f96',
  [TASK_CATEGORY.OTHER]: '#8c8c8c',
}
