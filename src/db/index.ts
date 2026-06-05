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

/** Data shape emitted by TaskForm */
export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'completedAt'>
