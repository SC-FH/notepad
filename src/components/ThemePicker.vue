<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

const { schemes, currentScheme, isDark, setScheme, toggleDark, currentMeta } = useTheme()
const open = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

const toggle = (): void => { open.value = !open.value }

const select = (id: string): void => {
  setScheme(id)
  open.value = false
}

// Close on outside click
const onClickOutside = (e: MouseEvent): void => {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<template>
  <div ref="pickerRef" class="theme-picker">
    <div class="picker-actions">
      <!-- Dark mode toggle -->
      <button
        class="picker-btn"
        :title="isDark ? '切换为浅色模式' : '切换为深色模式'"
        :aria-label="isDark ? '切换为浅色模式' : '切换为深色模式'"
        @click="toggleDark"
      >
        <!-- Sun icon (light mode) -->
        <svg v-if="isDark" class="picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <!-- Moon icon (dark mode) -->
        <svg v-else class="picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <!-- Color scheme picker -->
      <button
        class="picker-btn"
        :title="`配色方案: ${currentMeta().name}`"
        aria-label="选择配色方案"
        @click="toggle"
      >
        <svg class="picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="12" r="2.5" />
          <circle cx="8" cy="18" r="2.5" />
          <circle cx="16" cy="18" r="2.5" />
        </svg>
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="open" class="picker-dropdown" role="listbox" aria-label="配色方案列表">
        <div class="picker-header">配色方案</div>
        <button
          v-for="scheme in schemes"
          :key="scheme.id"
          class="picker-option"
          :class="{ active: currentScheme === scheme.id }"
          role="option"
          :aria-selected="currentScheme === scheme.id"
          @click="select(scheme.id)"
        >
          <span class="option-swatch" :style="{ background: scheme.preview }" />
          <span class="option-name">{{ scheme.name }}</span>
          <svg v-if="currentScheme === scheme.id" class="option-check" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.theme-picker {
  position: relative;
}

.picker-actions {
  display: flex;
  gap: var(--space-1);
}

.picker-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--cream);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-3);
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: var(--cream-dark);
    color: var(--accent);
  }

  &:active {
    transform: scale(0.95);
  }
}

.picker-icon {
  width: 18px;
  height: 18px;
}

// ── Dropdown ──────────────────────────────────────────────
.picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.picker-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-4);
  padding: var(--space-2) var(--space-3);
  font-family: $font-ui;
}

.picker-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: $font-ui;

  &:hover {
    background: var(--cream);
  }

  &.active {
    background: var(--accent-subtle);
  }
}

.option-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.option-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.option-check {
  width: 16px;
  height: 16px;
  color: var(--accent);
  flex-shrink: 0;
}

// ── Transition ────────────────────────────────────────────
.dropdown-enter-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.dropdown-leave-active {
  transition:
    opacity 0.15s ease-in,
    transform 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
