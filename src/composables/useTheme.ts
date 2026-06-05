import { ref, onMounted } from 'vue'

// ── Type Definitions ──────────────────────────────────────

interface ColorPalette {
  [key: string]: string
}

export interface ColorScheme {
  id: string
  name: string
  preview: string
  light: ColorPalette
  dark: ColorPalette
}

// ── Color Scheme Definitions ──────────────────────────────
//
// Surfaces stay neutral; each scheme changes accent tokens only.
// This keeps the app readable while still giving a clear color choice.

interface SchemeSeed {
  id: string
  name: string
  preview: string
  hover: string
  light: string
  muted: string
  subtle: string
  surface: string
  surfaceAlt: string
  paper: string
  border: string
  topbarBg: string
  topbarBorder: string
  glassBg: string
  glassBorder: string
  dark: string
  darkHover: string
  darkLight: string
  darkMuted: string
  darkSubtle: string
  darkSurface: string
  darkSurfaceAlt: string
  darkPaper: string
  darkBorder: string
  darkTopbarBg: string
  darkTopbarBorder: string
  darkGlassBg: string
  darkGlassBorder: string
}

const lightBase: ColorPalette = {
  '--cream':'#f6f7f9','--cream-dark':'#eceff3','--paper-line':'#d8dee8','--paper':'#ffffff',
  '--ink':'#111827','--ink-2':'#334155','--ink-3':'#64748b','--ink-4':'#94a3b8',
  '--gray-50':'#f8fafc','--gray-100':'#f1f5f9','--gray-200':'#e2e8f0','--gray-300':'#cbd5e1','--gray-400':'#94a3b8','--gray-500':'#64748b','--gray-600':'#475569','--gray-700':'#334155','--gray-800':'#1e293b','--gray-900':'#0f172a',
  '--glass-bg':'rgba(248,250,252,0.88)','--glass-border':'rgba(203,213,225,0.68)','--topbar-bg':'rgba(248,250,252,0.92)','--topbar-border':'rgba(203,213,225,0.7)',
  '--green':'#16a34a','--green-light':'#22c55e','--green-subtle':'#ecfdf3',
  '--amber':'#d97706','--amber-subtle':'#fffbeb',
  '--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2',
  '--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff',
  '--purple':'#9333ea','--purple-subtle':'#faf5ff',
}

const darkBase: ColorPalette = {
  '--cream':'#111827','--cream-dark':'#0b1220','--paper-line':'#253244','--paper':'#151e2c',
  '--ink':'#e5e7eb','--ink-2':'#cbd5e1','--ink-3':'#94a3b8','--ink-4':'#64748b',
  '--gray-50':'#151e2c','--gray-100':'#0f172a','--gray-200':'#1a2638','--gray-300':'#2e3e52','--gray-400':'#4a5a70','--gray-500':'#6a7a8e','--gray-600':'#8a9aaa','--gray-700':'#aabac8','--gray-800':'#c8d4de','--gray-900':'#e2e8f0',
  '--glass-bg':'rgba(17,24,39,0.9)','--glass-border':'rgba(148,163,184,0.16)','--topbar-bg':'rgba(17,24,39,0.92)','--topbar-border':'rgba(51,65,85,0.72)',
  '--green':'#4ade80','--green-light':'#86efac','--green-subtle':'rgba(74,222,128,0.12)',
  '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)',
  '--red':'#f87171','--red-light':'#fca5a5','--red-subtle':'rgba(248,113,113,0.12)',
  '--blue':'#38bdf8','--blue-light':'#7dd3fc','--blue-subtle':'rgba(56,189,248,0.12)',
  '--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
}

function makeScheme(seed: SchemeSeed): ColorScheme {
  return {
    id: seed.id,
    name: seed.name,
    preview: seed.preview,
    light: {
      ...lightBase,
      '--cream': seed.surface,
      '--cream-dark': seed.surfaceAlt,
      '--paper-line': seed.border,
      '--paper': seed.paper,
      '--gray-50': seed.paper,
      '--gray-100': seed.surface,
      '--gray-200': seed.surfaceAlt,
      '--gray-300': seed.border,
      '--glass-bg': seed.glassBg,
      '--glass-border': seed.glassBorder,
      '--topbar-bg': seed.topbarBg,
      '--topbar-border': seed.topbarBorder,
      '--accent': seed.preview,
      '--accent-hover': seed.hover,
      '--accent-light': seed.light,
      '--accent-muted': seed.muted,
      '--accent-subtle': seed.subtle,
    },
    dark: {
      ...darkBase,
      '--cream': seed.darkSurface,
      '--cream-dark': seed.darkSurfaceAlt,
      '--paper-line': seed.darkBorder,
      '--paper': seed.darkPaper,
      '--gray-50': seed.darkPaper,
      '--gray-100': seed.darkSurface,
      '--gray-200': seed.darkSurfaceAlt,
      '--gray-300': seed.darkBorder,
      '--glass-bg': seed.darkGlassBg,
      '--glass-border': seed.darkGlassBorder,
      '--topbar-bg': seed.darkTopbarBg,
      '--topbar-border': seed.darkTopbarBorder,
      '--accent': seed.dark,
      '--accent-hover': seed.darkHover,
      '--accent-light': seed.darkLight,
      '--accent-muted': seed.darkMuted,
      '--accent-subtle': seed.darkSubtle,
    },
  }
}

export const schemes: ColorScheme[] = [
  makeScheme({
    id: 'teal',
    name: '翠墨',
    preview: '#0d9488',
    hover: '#0f766e',
    light: '#14b8a6',
    muted: '#5eead4',
    subtle: '#d9f7f2',
    surface: '#eefaf8',
    surfaceAlt: '#d8f2ef',
    paper: '#fbfffe',
    border: '#b8dfda',
    topbarBg: 'rgba(238,250,248,0.94)',
    topbarBorder: 'rgba(13,148,136,0.22)',
    glassBg: 'rgba(251,255,254,0.9)',
    glassBorder: 'rgba(13,148,136,0.2)',
    dark: '#2dd4bf',
    darkHover: '#5eead4',
    darkLight: '#14b8a6',
    darkMuted: '#0d9488',
    darkSubtle: 'rgba(45,212,191,0.14)',
    darkSurface: '#08201e',
    darkSurfaceAlt: '#061816',
    darkPaper: '#0d2a27',
    darkBorder: '#164943',
    darkTopbarBg: 'rgba(8,32,30,0.94)',
    darkTopbarBorder: 'rgba(45,212,191,0.22)',
    darkGlassBg: 'rgba(13,42,39,0.9)',
    darkGlassBorder: 'rgba(45,212,191,0.18)',
  }),
  makeScheme({
    id: 'ocean',
    name: '海洋',
    preview: '#2563eb',
    hover: '#1d4ed8',
    light: '#3b82f6',
    muted: '#93c5fd',
    subtle: '#dbeafe',
    surface: '#eef5ff',
    surfaceAlt: '#dbeafe',
    paper: '#fbfdff',
    border: '#bfdbfe',
    topbarBg: 'rgba(238,245,255,0.94)',
    topbarBorder: 'rgba(37,99,235,0.22)',
    glassBg: 'rgba(251,253,255,0.9)',
    glassBorder: 'rgba(37,99,235,0.18)',
    dark: '#60a5fa',
    darkHover: '#93c5fd',
    darkLight: '#3b82f6',
    darkMuted: '#2563eb',
    darkSubtle: 'rgba(96,165,250,0.14)',
    darkSurface: '#0b1224',
    darkSurfaceAlt: '#07101f',
    darkPaper: '#101d33',
    darkBorder: '#1d3b66',
    darkTopbarBg: 'rgba(11,18,36,0.94)',
    darkTopbarBorder: 'rgba(96,165,250,0.2)',
    darkGlassBg: 'rgba(16,29,51,0.9)',
    darkGlassBorder: 'rgba(96,165,250,0.16)',
  }),
  makeScheme({
    id: 'amber',
    name: '琥珀',
    preview: '#d97706',
    hover: '#b45309',
    light: '#f59e0b',
    muted: '#fcd34d',
    subtle: '#fef0c7',
    surface: '#fff8e6',
    surfaceAlt: '#fef0c7',
    paper: '#fffdf7',
    border: '#f5d48b',
    topbarBg: 'rgba(255,248,230,0.94)',
    topbarBorder: 'rgba(217,119,6,0.24)',
    glassBg: 'rgba(255,253,247,0.9)',
    glassBorder: 'rgba(217,119,6,0.18)',
    dark: '#fbbf24',
    darkHover: '#fcd34d',
    darkLight: '#f59e0b',
    darkMuted: '#d97706',
    darkSubtle: 'rgba(251,191,36,0.16)',
    darkSurface: '#231806',
    darkSurfaceAlt: '#1a1104',
    darkPaper: '#2b210f',
    darkBorder: '#5f4313',
    darkTopbarBg: 'rgba(35,24,6,0.94)',
    darkTopbarBorder: 'rgba(251,191,36,0.22)',
    darkGlassBg: 'rgba(43,33,15,0.9)',
    darkGlassBorder: 'rgba(251,191,36,0.17)',
  }),
  makeScheme({
    id: 'rose',
    name: '玫瑰',
    preview: '#e11d48',
    hover: '#be123c',
    light: '#f43f5e',
    muted: '#fda4af',
    subtle: '#ffe4ea',
    surface: '#fff1f4',
    surfaceAlt: '#ffe4ea',
    paper: '#fffafb',
    border: '#fecdd7',
    topbarBg: 'rgba(255,241,244,0.94)',
    topbarBorder: 'rgba(225,29,72,0.22)',
    glassBg: 'rgba(255,250,251,0.9)',
    glassBorder: 'rgba(225,29,72,0.18)',
    dark: '#fb7185',
    darkHover: '#fda4af',
    darkLight: '#f43f5e',
    darkMuted: '#e11d48',
    darkSubtle: 'rgba(251,113,133,0.15)',
    darkSurface: '#251018',
    darkSurfaceAlt: '#1c0a11',
    darkPaper: '#301722',
    darkBorder: '#713044',
    darkTopbarBg: 'rgba(37,16,24,0.94)',
    darkTopbarBorder: 'rgba(251,113,133,0.22)',
    darkGlassBg: 'rgba(48,23,34,0.9)',
    darkGlassBorder: 'rgba(251,113,133,0.17)',
  }),
  makeScheme({
    id: 'violet',
    name: '紫罗兰',
    preview: '#7c3aed',
    hover: '#6d28d9',
    light: '#8b5cf6',
    muted: '#c4b5fd',
    subtle: '#ede4ff',
    surface: '#f6f1ff',
    surfaceAlt: '#ede4ff',
    paper: '#fffbff',
    border: '#ddd6fe',
    topbarBg: 'rgba(246,241,255,0.94)',
    topbarBorder: 'rgba(124,58,237,0.2)',
    glassBg: 'rgba(255,251,255,0.9)',
    glassBorder: 'rgba(124,58,237,0.17)',
    dark: '#a78bfa',
    darkHover: '#c4b5fd',
    darkLight: '#8b5cf6',
    darkMuted: '#7c3aed',
    darkSubtle: 'rgba(167,139,250,0.15)',
    darkSurface: '#1c142b',
    darkSurfaceAlt: '#140d21',
    darkPaper: '#261b38',
    darkBorder: '#4c3578',
    darkTopbarBg: 'rgba(28,20,43,0.94)',
    darkTopbarBorder: 'rgba(167,139,250,0.22)',
    darkGlassBg: 'rgba(38,27,56,0.9)',
    darkGlassBorder: 'rgba(167,139,250,0.17)',
  }),
  makeScheme({
    id: 'forest',
    name: '森林',
    preview: '#16a34a',
    hover: '#15803d',
    light: '#22c55e',
    muted: '#86efac',
    subtle: '#dcf5e1',
    surface: '#effaf1',
    surfaceAlt: '#dcf5e1',
    paper: '#fbfffc',
    border: '#bbebc5',
    topbarBg: 'rgba(239,250,241,0.94)',
    topbarBorder: 'rgba(22,163,74,0.22)',
    glassBg: 'rgba(251,255,252,0.9)',
    glassBorder: 'rgba(22,163,74,0.18)',
    dark: '#4ade80',
    darkHover: '#86efac',
    darkLight: '#22c55e',
    darkMuted: '#16a34a',
    darkSubtle: 'rgba(74,222,128,0.15)',
    darkSurface: '#0c1f12',
    darkSurfaceAlt: '#07170d',
    darkPaper: '#112b19',
    darkBorder: '#285438',
    darkTopbarBg: 'rgba(12,31,18,0.94)',
    darkTopbarBorder: 'rgba(74,222,128,0.22)',
    darkGlassBg: 'rgba(17,43,25,0.9)',
    darkGlassBorder: 'rgba(74,222,128,0.17)',
  }),
  makeScheme({
    id: 'slate',
    name: '石板',
    preview: '#475569',
    hover: '#334155',
    light: '#64748b',
    muted: '#94a3b8',
    subtle: '#e2e8f0',
    surface: '#eef2f7',
    surfaceAlt: '#dbe2ea',
    paper: '#fbfcfe',
    border: '#c7d2df',
    topbarBg: 'rgba(238,242,247,0.94)',
    topbarBorder: 'rgba(71,85,105,0.22)',
    glassBg: 'rgba(251,252,254,0.9)',
    glassBorder: 'rgba(71,85,105,0.18)',
    dark: '#94a3b8',
    darkHover: '#cbd5e1',
    darkLight: '#64748b',
    darkMuted: '#475569',
    darkSubtle: 'rgba(148,163,184,0.14)',
    darkSurface: '#101722',
    darkSurfaceAlt: '#0b111a',
    darkPaper: '#172131',
    darkBorder: '#344154',
    darkTopbarBg: 'rgba(16,23,34,0.94)',
    darkTopbarBorder: 'rgba(148,163,184,0.2)',
    darkGlassBg: 'rgba(23,33,49,0.9)',
    darkGlassBorder: 'rgba(148,163,184,0.16)',
  }),
]

// ── Persistent State ──────────────────────────────────────

const SCHEME_KEY = 'notepad-theme'
const DARK_KEY = 'notepad-dark'

const currentScheme = ref<string>('ocean')
const isDark = ref<boolean>(false)

/** System preference */
function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Apply all CSS custom properties to :root using a <style> tag (most reliable) */
let styleEl: HTMLStyleElement | null = null
function applyColors(): void {
  const scheme = schemes.find(s => s.id === currentScheme.value) || schemes[0]
  const palette = isDark.value ? scheme.dark : scheme.light

  // Build CSS text — inline <style> overrides everything including @media rules
  let css = ':root{'
  for (const [prop, val] of Object.entries(palette)) {
    css += `${prop}:${val};`
  }
  css += '}'

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'theme-vars'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = css

  // Also set data attributes for any CSS that reads them
  document.documentElement.setAttribute('data-theme', currentScheme.value)
  document.documentElement.setAttribute('data-dark', String(isDark.value))
}

// ── Public API ────────────────────────────────────────────

/** Call before mount — sets initial theme from localStorage */
export function initTheme(): void {
  const savedScheme = localStorage.getItem(SCHEME_KEY)
  if (savedScheme && schemes.some(s => s.id === savedScheme)) {
    currentScheme.value = savedScheme
  }
  const savedDark = localStorage.getItem(DARK_KEY)
  isDark.value = savedDark !== null ? savedDark === 'true' : systemDark()
  applyColors()
}

/** Composable — reactive theme + dark mode controls */
export function useTheme() {
  const setScheme = (id: string): void => {
    currentScheme.value = id
    localStorage.setItem(SCHEME_KEY, id)
    applyColors()
  }

  const toggleDark = (): void => {
    isDark.value = !isDark.value
    localStorage.setItem(DARK_KEY, String(isDark.value))
    applyColors()
  }

  const setDark = (val: boolean): void => {
    isDark.value = val
    localStorage.setItem(DARK_KEY, String(val))
    applyColors()
  }

  const currentMeta = (): ColorScheme => schemes.find(s => s.id === currentScheme.value) || schemes[0]

  // Re-apply when system preference changes (only if user hasn't manually set)
  onMounted(() => {
    applyColors()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly chosen
      const savedDark = localStorage.getItem(DARK_KEY)
      if (savedDark === null) {
        isDark.value = e.matches
        applyColors()
      }
    })
  })

  return {
    schemes,
    currentScheme,
    isDark,
    setScheme,
    toggleDark,
    setDark,
    currentMeta,
  }
}
