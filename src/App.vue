<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ThemePicker from './components/ThemePicker.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { useTheme } from './composables/useTheme'
import { useLocale } from './composables/useLocale'

const route = useRoute()
const tabsRef = ref<HTMLElement | null>(null)
const tabRefs = ref<any[]>([])
const sliderStyle = ref<Record<string, string>>({})

// Initialize theme system
const { currentScheme } = useTheme()
const { t, currentLocale } = useLocale()

const tabs = computed(() => [
  {
    path: '/',
    label: t('nav.today'),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>`,
  },
  {
    path: '/history',
    label: t('nav.history'),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,
  },
  {
    path: '/stats',
    label: t('nav.stats'),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`,
  },
])

function setTabRef(el: any, index: number): void {
  if (el) tabRefs.value[index] = el
}

function getEl(ref: any): HTMLElement | null {
  // router-link is a component — get its root DOM element
  return ref?.$el || ref
}

function updateSlider(): void {
  const activeIndex = tabs.value.findIndex((tab) => tab.path === route.path)
  const el = getEl(tabRefs.value[activeIndex])
  const container = tabsRef.value
  if (!el || !container || typeof el.getBoundingClientRect !== 'function') return

  const containerRect = container.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  sliderStyle.value = {
    width: `${elRect.width}px`,
    transform: `translateX(${elRect.left - containerRect.left}px)`,
  }
}

watch(() => route.path, () => nextTick(updateSlider))
watch(currentLocale, () => nextTick(updateSlider))
onMounted(() => {
  updateSlider()
  window.addEventListener('resize', updateSlider)
})
onUnmounted(() => window.removeEventListener('resize', updateSlider))
</script>

<template>
  <div class="app">
    <header class="topbar" role="banner">
      <div class="topbar-inner">
        <div class="brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span class="brand-text">{{ t('common.appName') }}</span>
        </div>
        <div class="topbar-right">
          <nav ref="tabsRef" class="tabs" role="navigation" :aria-label="t('nav.navAria')">
            <div class="tabs-slider" :style="sliderStyle" aria-hidden="true" />
            <router-link
              v-for="(tab, i) in tabs"
              :key="tab.path"
              :ref="(el) => setTabRef(el, i)"
              :to="tab.path"
              :class="['tab', { active: route.path === tab.path }]"
              :aria-current="route.path === tab.path ? 'page' : undefined"
            >
              <span class="tab-icon" v-html="tab.icon" aria-hidden="true" />
              <span class="tab-label">{{ tab.label }}</span>
            </router-link>
          </nav>
          <LanguageSwitcher />
          <ThemePicker />
          <a
            class="github-link"
            href="https://github.com/SC-FH/notepad"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            :aria-label="t('nav.githubAria')"
          >
            <svg class="github-icon" viewBox="0 0 19 19" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <main class="content" role="main">
      <router-view v-slot="{ Component, route: viewRoute }">
        <transition name="page-fade" mode="out-in">
          <div :key="viewRoute.path" class="page-wrapper">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use './styles/variables' as *;
@use './styles/mixins' as *;

// ── Design tokens (local) ───────────────────────────────
$topbar-h: 56px;
$topbar-blur: 12px;
$content-max: 720px;

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// ── Top bar ──────────────────────────────────────────────
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--topbar-bg);
  backdrop-filter: blur($topbar-blur);
  -webkit-backdrop-filter: blur($topbar-blur);
  border-bottom: 1px solid var(--topbar-border);
}

.topbar-inner {
  max-width: $content-max;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: $topbar-h;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @include mobile {
    padding: 0 var(--space-4);
  }
}

// ── Brand ────────────────────────────────────────────────
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.brand-icon {
  width: 22px;
  height: 22px;
  color: var(--accent);
  flex-shrink: 0;
}

.brand-text {
  font-family: $font-display;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.5px;
}

// ── Top bar right section ────────────────────────────────
.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

// ── GitHub link ───────────────────────────────────────────
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: var(--ink-3);
  text-decoration: none;
  transition: color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out);
  flex-shrink: 0;

  &:hover {
    color: var(--ink);
    background: var(--cream);
  }
}

.github-icon {
  width: 18px;
  height: 18px;
}

// ── Tab bar ──────────────────────────────────────────────
.tabs {
  position: relative;
  display: flex;
  gap: var(--space-1);
  background: var(--cream);
  padding: 3px;
  border-radius: var(--radius);
}

.tabs-slider {
  position: absolute;
  top: 3px;
  left: 0;
  height: calc(100% - 6px);
  background: var(--paper);
  border-radius: 6px;
  box-shadow: 0 1px 3px var(--paper-shadow);
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 0;
}

.tab {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-3);
  text-decoration: none;
  transition: color var(--duration-normal) var(--ease-out);
  font-family: $font-ui;
  white-space: nowrap;

  &:hover {
    color: var(--ink-2);
  }

  &.active {
    color: var(--accent);
  }
}

// ── Tab icon (visible on mobile, hidden on desktop) ──────
.tab-icon {
  display: none;
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }

  @include mobile {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ── Content area ─────────────────────────────────────────
.content {
  flex: 1;
  max-width: $content-max;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-7) var(--space-6) var(--space-11);

  @include mobile {
    padding: var(--space-5) var(--space-4) var(--space-10);
  }
}

// ── Page transition: fade + micro-displacement ───────────
.page-wrapper {
  will-change: opacity, transform;
}

.page-fade-enter-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-fade-leave-active {
  transition:
    opacity 0.18s ease-in,
    transform 0.18s ease-in;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
