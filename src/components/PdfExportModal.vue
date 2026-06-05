<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { TASK_STATUS } from '../db'
import { useLocale } from '../composables/useLocale'
import { useLabels } from '../composables/useLabels'
import type { DayGroup } from '../views/History.vue'

const { t, currentLocale } = useLocale()
const { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } = useLabels()

const props = defineProps<{
  visible: boolean
  day: DayGroup | null
}>()

const emit = defineEmits<{
  close: []
}>()

/* ═══════════════════════════════════════════════════════
   Section toggles
   ═══════════════════════════════════════════════════════ */
const customTitle = ref('')
const sections = ref<Record<string, boolean>>({
  title: true,
  summary: true,
  taskList: true,
  priority: false,
  category: false,
  footer: true,
})

const statusFilter = ref<Record<string, boolean>>({
  completed: true,
  in_progress: true,
  pending: true,
  cancelled: false,
})

const statusFilterLabels = computed(() => ({
  completed: t('db.status.completed'),
  in_progress: t('db.status.in_progress'),
  pending: t('db.status.pending'),
  cancelled: t('db.status.cancelled'),
}))

watch(() => props.visible, (v) => {
  if (v && props.day) {
    customTitle.value = t('pdf.taskReport', { date: props.day.date })
    sections.value = { title: true, summary: true, taskList: true, priority: false, category: false, footer: true }
    statusFilter.value = { completed: true, in_progress: true, pending: true, cancelled: false }
  }
})

/* ═══════════════════════════════════════════════════════
   Filtered tasks & stats
   ═══════════════════════════════════════════════════════ */
const filteredTasks = computed(() => {
  if (!props.day) return []
  return props.day.tasks.filter(t => statusFilter.value[t.status])
})

const totalAll = computed(() => props.day ? props.day.tasks.length : 0)

const dayStats = computed(() => {
  if (!props.day) return { total: 0, done: 0, rate: 0 }
  const tasks = props.day.tasks
  const total = tasks.length
  const done = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length
  const rate = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, rate }
})

/* ═══════════════════════════════════════════════════════
   Build PDF HTML
   ═══════════════════════════════════════════════════════ */
function buildPdfHtml(): string {
  if (!props.day) return ''
  const s = sections.value
  const stats = dayStats.value
  const tasks = filteredTasks.value
  let html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;color:#134e4a;padding:40px 48px;max-width:680px;">`

  if (s.title) {
    const title = customTitle.value || t('pdf.taskReport', { date: props.day.date })
    html += `<div style="text-align:center;margin-bottom:28px;">
      <h1 style="font-size:24px;font-weight:700;color:#0d9488;margin:0 0 6px 0;letter-spacing:0.5px;">${title}</h1>
      <p style="font-size:13px;color:#6b7280;margin:0;">${props.day.date}</p>
    </div>`
  }

  if (s.summary) {
    html += `<div style="display:flex;justify-content:center;gap:40px;padding:18px 24px;background:#f0fdfa;border-radius:10px;margin-bottom:28px;">
      <div style="text-align:center;"><div style="font-size:26px;font-weight:700;color:#0d9488;">${stats.total}</div><div style="font-size:12px;color:#6b7280;margin-top:2px;">${t('pdf.totalTasks')}</div></div>
      <div style="text-align:center;"><div style="font-size:26px;font-weight:700;color:#16a34a;">${stats.done}</div><div style="font-size:12px;color:#6b7280;margin-top:2px;">${t('pdf.completedLabel')}</div></div>
      <div style="text-align:center;"><div style="font-size:26px;font-weight:700;color:#0d9488;">${stats.rate}%</div><div style="font-size:12px;color:#6b7280;margin-top:2px;">${t('pdf.completionRate')}</div></div>
    </div>`
  }

  if (s.taskList && tasks.length > 0) {
    let ths = `<th style="padding:10px 12px;text-align:left;font-weight:600;color:#0d9488;border-bottom:2px solid #99f6e4;">${t('pdf.colTask')}</th>
      <th style="padding:10px 12px;text-align:left;font-weight:600;color:#0d9488;border-bottom:2px solid #99f6e4;white-space:nowrap;">${t('pdf.colStatus')}</th>`
    if (s.priority) ths += `<th style="padding:10px 12px;text-align:left;font-weight:600;color:#0d9488;border-bottom:2px solid #99f6e4;white-space:nowrap;">${t('pdf.colPriority')}</th>`
    if (s.category) ths += `<th style="padding:10px 12px;text-align:left;font-weight:600;color:#0d9488;border-bottom:2px solid #99f6e4;white-space:nowrap;">${t('pdf.colCategory')}</th>`

    const rows = tasks.map(task => {
      const isDone = task.status === TASK_STATUS.COMPLETED
      const statusLabel = STATUS_LABELS.value[task.status] || task.status
      const statusColor = isDone ? '#16a34a' : task.status === TASK_STATUS.IN_PROGRESS ? '#0284c7' : task.status === TASK_STATUS.CANCELLED ? '#dc2626' : '#9ca3af'
      let tds = `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};margin-right:8px;vertical-align:middle;"></span>
        <span style="vertical-align:middle;">${task.title}</span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;white-space:nowrap;">${statusLabel}</td>`
      if (s.priority) tds += `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;white-space:nowrap;">${PRIORITY_LABELS.value[task.priority] || task.priority || '—'}</td>`
      if (s.category) tds += `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;white-space:nowrap;">${CATEGORY_LABELS.value[task.category] || task.category || '—'}</td>`
      return `<tr>${tds}</tr>`
    }).join('')

    html += `<table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#f0fdfa;">${ths}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  }

  if (s.footer) {
    html += `<div style="margin-top:36px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
      ${t('pdf.generatedAt', { time: new Date().toLocaleString(currentLocale.value) })}
    </div>`
  }

  html += `</div>`
  return html
}

/* ═══════════════════════════════════════════════════════
   Export
   ═══════════════════════════════════════════════════════ */
const exporting = ref(false)
const previewBoxRef = ref<HTMLElement | null>(null)

const handleExport = async (): Promise<void> => {
  if (!props.day || exporting.value || !previewBoxRef.value) return
  exporting.value = true
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const el = previewBoxRef.value
    const filename = `${customTitle.value || t('pdf.taskReport', { date: props.day.date })}.pdf`
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 6, width: 794, windowWidth: 794, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save()
  } catch (err) {
    console.error('PDF export failed:', err)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-panel" @click.stop>
          <!-- ─── header ─── -->
          <div class="modal-header">
            <h3 class="modal-title">{{ t('pdf.title') }}</h3>
            <button class="modal-close" @click="emit('close')" :aria-label="t('pdf.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <!-- ─── content: left-right layout ─── -->
          <div class="modal-content">
            <!-- LEFT: preview -->
            <div class="preview-pane">
              <div class="preview-label">{{ t('pdf.livePreview') }}</div>
              <div class="preview-box" ref="previewBoxRef">
                <div v-html="buildPdfHtml()"></div>
              </div>
            </div>

            <!-- RIGHT: options -->
            <div class="opt-pane">
              <!-- title -->
              <div class="opt-group">
                <label class="opt-label">{{ t('pdf.customTitle') }}</label>
                <input v-model="customTitle" type="text" class="opt-input" :placeholder="t('pdf.titlePlaceholder')" />
              </div>

              <!-- section toggles -->
              <div class="opt-group">
                <label class="opt-label">{{ t('pdf.moduleSelection') }}</label>
                <div class="toggle-grid">
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.titleSection') }}</span>
                    <button class="toggle" :class="{ on: sections.title }" @click="sections.title = !sections.title" role="switch" :aria-checked="sections.title"><span class="toggle-knob"></span></button>
                  </div>
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.summarySection') }}</span>
                    <button class="toggle" :class="{ on: sections.summary }" @click="sections.summary = !sections.summary" role="switch" :aria-checked="sections.summary"><span class="toggle-knob"></span></button>
                  </div>
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.taskListSection') }}</span>
                    <button class="toggle" :class="{ on: sections.taskList }" @click="sections.taskList = !sections.taskList" role="switch" :aria-checked="sections.taskList"><span class="toggle-knob"></span></button>
                  </div>
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.showPriority') }}</span>
                    <button class="toggle" :class="{ on: sections.priority }" @click="sections.priority = !sections.priority" role="switch" :aria-checked="sections.priority"><span class="toggle-knob"></span></button>
                  </div>
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.showCategory') }}</span>
                    <button class="toggle" :class="{ on: sections.category }" @click="sections.category = !sections.category" role="switch" :aria-checked="sections.category"><span class="toggle-knob"></span></button>
                  </div>
                  <div class="toggle-row">
                    <span class="toggle-text">{{ t('pdf.footerSection') }}</span>
                    <button class="toggle" :class="{ on: sections.footer }" @click="sections.footer = !sections.footer" role="switch" :aria-checked="sections.footer"><span class="toggle-knob"></span></button>
                  </div>
                </div>
              </div>

              <!-- status filter -->
              <div class="opt-group" v-if="sections.taskList">
                <label class="opt-label">{{ t('pdf.statusFilter') }}</label>
                <div class="status-chips">
                  <button
                    v-for="(label, key) in statusFilterLabels"
                    :key="key"
                    class="chip"
                    :class="{ active: statusFilter[key] }"
                    @click="statusFilter[key] = !statusFilter[key]"
                  >
                    <span class="chip-dot" :class="key"></span>
                    {{ label }}
                  </button>
                </div>
              </div>

              <!-- task count -->
              <div class="opt-hint" v-if="sections.taskList">{{ t('pdf.selectedTasks', { count: filteredTasks.length, total: totalAll }) }}</div>
              <div class="opt-hint" v-else-if="!sections.title && !sections.summary && !sections.taskList && !sections.footer">{{ t('pdf.atLeastOneModule') }}</div>
            </div>
          </div>

          <!-- ─── footer ─── -->
          <div class="modal-footer">
            <button class="btn btn--ghost" @click="emit('close')">{{ t('common.cancel') }}</button>
            <button
              class="btn btn--primary"
              :disabled="exporting || (sections.taskList && filteredTasks.length === 0) || (!sections.title && !sections.summary && !sections.taskList && !sections.footer)"
              @click="handleExport"
            >
              {{ exporting ? t('pdf.exporting') : t('pdf.exportPdf') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  padding: var(--space-4);

  @include mobile {
    padding: var(--space-2);
  }
}

.modal-panel {
  width: 100%;
  max-width: 880px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-xl);
  overflow: hidden;

  @include mobile {
    max-height: 95vh;
    border-radius: var(--radius-lg);
  }
}

/* ─── header ─── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--paper-line);
  flex-shrink: 0;

  @include mobile {
    padding: var(--space-3) var(--space-4);
  }
}

.modal-title {
  font-family: $font-display;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--ink-3);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  &:hover { background: var(--cream); }
}

/* ─── content: left-right ─── */
.modal-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @include mobile {
    flex-direction: column;
    overflow-y: auto;
  }
}

/* ─── right pane: options ─── */
.opt-pane {
  width: 300px;
  flex-shrink: 0;
  padding: var(--space-5) var(--space-6);
  overflow-y: auto;
  border-left: 1px solid var(--paper-line);

  @include mobile {
    width: 100%;
    padding: var(--space-4);
    border-left: none;
    border-top: 1px solid var(--paper-line);
    overflow-y: visible;
  }
}

.opt-group {
  margin-bottom: var(--space-5);
}

.opt-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: var(--space-2);
}

.opt-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
  color: var(--ink);
  background: var(--cream);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-out);
  box-sizing: border-box;
  &:focus { border-color: var(--accent); }
}

/* ─── toggle grid ─── */
.toggle-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px var(--space-3);
  border-radius: var(--radius);
  background: var(--cream);
  transition: background var(--duration-fast) var(--ease-out);
  &:hover { background: var(--cream-dark); }
}

.toggle-text {
  font-size: 13px;
  color: var(--ink);
}

/* ─── toggle switch ─── */
.toggle {
  position: relative;
  width: 38px;
  height: 20px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--gray-200);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  flex-shrink: 0;

  &.on { background: var(--accent); }
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform var(--duration-fast) var(--ease-out);
}

.toggle.on .toggle-knob {
  transform: translateX(18px);
}

/* ─── status chips ─── */
.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink-3);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);

  &.active {
    border-color: var(--accent);
    background: var(--accent-subtle);
    color: var(--accent);
  }
  &:hover { border-color: var(--accent); }
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  &.completed   { background: var(--green); }
  &.in_progress { background: var(--blue); }
  &.pending     { background: var(--ink-4); }
  &.cancelled   { background: var(--red); }
}

.opt-hint {
  font-size: 12px;
  color: var(--ink-4);
  margin-top: var(--space-1);
}

/* ─── left pane: preview ─── */
.preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-5) var(--space-6);
  overflow: hidden;

  @include mobile {
    padding: var(--space-4);
    min-height: 240px;
  }
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.preview-box {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-lg);
  background: #f8f8f8;

  @include mobile {
    min-height: 200px;
  }
}

/* ─── footer ─── */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--paper-line);
  flex-shrink: 0;

  @include mobile {
    padding: var(--space-3) var(--space-4);
  }
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

.btn--ghost {
  background: transparent;
  color: var(--ink-3);
  &:hover { background: var(--cream); }
}

.btn--primary {
  background: var(--accent);
  color: white;
  &:hover { background: var(--accent-hover); }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ─── transitions ─── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform var(--duration-normal) var(--ease-out),
              opacity var(--duration-normal) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}
</style>
