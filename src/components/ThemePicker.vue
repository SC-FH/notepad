<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTheme, type ColorScheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'

const { schemes, currentScheme, isDark, setScheme, toggleDark } = useTheme()
const { t } = useLocale()
const open = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

const activeScheme = computed(() => schemes.find(scheme => scheme.id === currentScheme.value) || schemes[0])
const activeSchemeName = computed(() => t('theme.' + activeScheme.value.id) || activeScheme.value.name)

const toggle = (): void => { open.value = !open.value }

const select = (id: string): void => {
  setScheme(id)
  open.value = false
}

function swatchStyle(scheme: ColorScheme): Record<string, string> {
  return {
    background: `linear-gradient(135deg, ${scheme.preview} 0 38%, ${scheme.light['--accent-muted']} 38% 68%, ${scheme.light['--cream-dark']} 68% 100%)`,
  }
}

const onClickOutside = (e: MouseEvent): void => {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<template>
  <div ref="pickerRef" class="theme-picker" @keydown.escape.stop="open = false">
    <div class="picker-actions">
      <button
        type="button"
        class="picker-btn"
        :title="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
        :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
        @click="toggleDark"
      >
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
        <svg v-else class="picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <button
        type="button"
        class="picker-btn scheme-trigger"
        :title="`${t('theme.colorScheme')}: ${activeSchemeName}`"
        :aria-label="t('theme.selectScheme')"
        aria-haspopup="listbox"
        :aria-expanded="open"
        @click="toggle"
      >
        <span class="trigger-swatch" :style="swatchStyle(activeScheme)" aria-hidden="true" />
        <span class="trigger-label">{{ activeSchemeName }}</span>
        <svg class="trigger-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="5 8 10 13 15 8" />
        </svg>
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="open" class="picker-dropdown" role="listbox" :aria-label="t('theme.schemeList')">
        <div class="picker-header">{{ t('theme.colorScheme') }}</div>
        <div class="color-list">
          <button
            v-for="scheme in schemes"
            :key="scheme.id"
            type="button"
            class="picker-option"
            :class="{ active: currentScheme === scheme.id }"
            role="option"
            :aria-selected="currentScheme === scheme.id"
            @click="select(scheme.id)"
          >
            <span class="option-swatch" :style="swatchStyle(scheme)" aria-hidden="true" />
            <span class="option-name">{{ t('theme.' + scheme.id) }}</span>
            <svg v-if="currentScheme === scheme.id" class="option-check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
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
  min-width: 40px;
  height: 40px;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-2);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
  padding: 0;
  touch-action: manipulation;

  &:hover {
    border-color: var(--accent-muted);
    background: var(--cream);
    color: var(--accent);
  }

  &:active {
    background: var(--cream-dark);
  }
}

.picker-icon {
  width: 18px;
  height: 18px;
}

.scheme-trigger {
  justify-content: flex-start;
  gap: var(--space-2);
  min-width: 116px;
  padding: 0 var(--space-3);
}

.trigger-swatch,
.option-swatch {
  display: block;
  border: 1px solid rgba(15, 23, 42, 0.14);
  flex-shrink: 0;
}

.trigger-swatch {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
}

.trigger-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-2);
  line-height: 1;
  white-space: nowrap;
}

.trigger-chevron {
  width: 14px;
  height: 14px;
  color: var(--ink-4);
  flex-shrink: 0;
}

.picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(292px, calc(100vw - 32px));
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  z-index: 100;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.16);
}

.picker-header {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-4);
  padding: 0 0 var(--space-2);
  font-family: $font-ui;
}

.color-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.picker-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 44px;
  padding: var(--space-2);
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: var(--radius);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
  font-family: $font-ui;
  touch-action: manipulation;

  &:hover {
    background: var(--cream);
    border-color: var(--accent-muted);
  }

  &.active {
    background: var(--accent-subtle);
    border-color: var(--accent);
  }
}

.option-swatch {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
}

.option-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  text-align: left;
}

.option-check {
  width: 16px;
  height: 16px;
  color: var(--accent);
  flex-shrink: 0;
}

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

@media (max-width: 760px) {
  .scheme-trigger {
    justify-content: center;
    min-width: 40px;
    width: 40px;
    padding: 0;
  }

  .trigger-label,
  .trigger-chevron {
    display: none;
  }
}

@media (max-width: 420px) {
  .picker-btn {
    min-width: 36px;
    width: 36px;
    height: 36px;
  }

  .picker-actions {
    gap: 3px;
  }

  .picker-dropdown {
    right: 0;
  }

  .color-list {
    grid-template-columns: 1fr;
  }
}
</style>
