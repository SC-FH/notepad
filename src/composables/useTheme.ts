import { ref, computed, onMounted } from 'vue'

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
// Each scheme provides full light + dark palettes.
// All tokens per scheme:
//   accent:   primary / hover / light / muted / subtle
//   green:    done-state (mapped to accent per scheme)
//   surface:  cream / cream-dark / paper-line
//   text:     ink / ink-2 / ink-3 / ink-4
//   gray:     50..900 (functional neutrals)
//   glass:    glass-bg / glass-border / topbar-bg / topbar-border
//
// ink-3/ink-4: muted tint (readable as text, usable as decorative fill)
// cream vs cream-dark: clear hover feedback
// gray-300+: true neutrals for borders, icons, functional UI

export const schemes: ColorScheme[] = [
  {
    id: 'teal', name: '翠墨', preview: '#0d9488',
    light: {
      '--accent':'#0d9488','--accent-hover':'#0f766e','--accent-light':'#14b8a6','--accent-muted':'#5eead4','--accent-subtle':'#f0fdfa',
      '--green':'#0d9488','--green-light':'#14b8a6','--green-subtle':'#f0fdfa',
      '--cream':'#f0fdfa','--cream-dark':'#d5f5f0','--paper-line':'#b8ece4',
      '--ink':'#134e4a','--ink-2':'#115e59','--ink-3':'#5a9e96','--ink-4':'#a3d5cf',
      '--gray-50':'#f0fdfa','--gray-100':'#e0f8f4','--gray-200':'#ccfbf1','--gray-300':'#b0c4c0','--gray-400':'#8aa8a3','--gray-500':'#6b8f8a','--gray-600':'#527570','--gray-700':'#3d5c58','--gray-800':'#2a4240','--gray-900':'#1a2d2b',
      '--glass-bg':'rgba(240,253,250,0.82)','--glass-border':'rgba(200,235,228,0.5)','--topbar-bg':'rgba(240,253,250,0.9)','--topbar-border':'rgba(184,236,228,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#2dd4bf','--accent-hover':'#5eead4','--accent-light':'#14b8a6','--accent-muted':'#0d9488','--accent-subtle':'rgba(45,212,191,0.1)',
      '--green':'#2dd4bf','--green-light':'#2dd4bf','--green-subtle':'rgba(45,212,191,0.1)',
      '--cream':'#0a2f2c','--cream-dark':'#061f1d','--paper-line':'#1a4a46',
      '--ink':'#e8f5f3','--ink-2':'#b8dcd7','--ink-3':'#6fb3ac','--ink-4':'#3d7a74',
      '--gray-50':'#0d3330','--gray-100':'#0a2a28','--gray-200':'#163e3b','--gray-300':'#2a5855','--gray-400':'#4a7874','--gray-500':'#6a9692','--gray-600':'#8ab4b0','--gray-700':'#acd0cc','--gray-800':'#ceeae7','--gray-900':'#e8f5f3',
      '--glass-bg':'rgba(10,47,44,0.85)','--glass-border':'rgba(45,212,191,0.12)','--topbar-bg':'rgba(10,47,44,0.9)','--topbar-border':'rgba(26,74,70,0.6)',
      '--paper':'#0d3330',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'ocean', name: '海洋', preview: '#2563eb',
    light: {
      '--accent':'#2563eb','--accent-hover':'#1d4ed8','--accent-light':'#3b82f6','--accent-muted':'#93c5fd','--accent-subtle':'#eff6ff',
      '--green':'#2563eb','--green-light':'#3b82f6','--green-subtle':'#eff6ff',
      '--cream':'#f0f5ff','--cream-dark':'#dbe8fc','--paper-line':'#bfdbfe',
      '--ink':'#1e3a5f','--ink-2':'#1e40af','--ink-3':'#5b7faa','--ink-4':'#a3bdd9',
      '--gray-50':'#f0f5ff','--gray-100':'#e0ecff','--gray-200':'#dbeafe','--gray-300':'#b0bec5','--gray-400':'#8a9baa','--gray-500':'#6b7d8d','--gray-600':'#526370','--gray-700':'#3d4b57','--gray-800':'#2a3540','--gray-900':'#1a232e',
      '--glass-bg':'rgba(240,245,255,0.82)','--glass-border':'rgba(191,219,254,0.5)','--topbar-bg':'rgba(240,245,255,0.9)','--topbar-border':'rgba(191,219,254,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#60a5fa','--accent-hover':'#93c5fd','--accent-light':'#3b82f6','--accent-muted':'#2563eb','--accent-subtle':'rgba(96,165,250,0.1)',
      '--green':'#60a5fa','--green-light':'#60a5fa','--green-subtle':'rgba(96,165,250,0.1)',
      '--cream':'#0c1a2e','--cream-dark':'#081424','--paper-line':'#1a3050',
      '--ink':'#e0ecf8','--ink-2':'#b0c8e0','--ink-3':'#6a8fbc','--ink-4':'#3a5f8a',
      '--gray-50':'#0f1f35','--gray-100':'#0b1829','--gray-200':'#162a46','--gray-300':'#2a4466','--gray-400':'#4a6488','--gray-500':'#6a84a8','--gray-600':'#8aa4c4','--gray-700':'#aac4de','--gray-800':'#cadef0','--gray-900':'#e0ecf8',
      '--glass-bg':'rgba(12,26,46,0.85)','--glass-border':'rgba(96,165,250,0.12)','--topbar-bg':'rgba(12,26,46,0.9)','--topbar-border':'rgba(26,48,80,0.6)',
      '--paper':'#0f1f35',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'amber', name: '琥珀', preview: '#d97706',
    light: {
      '--accent':'#d97706','--accent-hover':'#b45309','--accent-light':'#f59e0b','--accent-muted':'#fcd34d','--accent-subtle':'#fffbeb',
      '--green':'#d97706','--green-light':'#f59e0b','--green-subtle':'#fffbeb',
      '--cream':'#fffcf0','--cream-dark':'#fef0c7','--paper-line':'#fde68a',
      '--ink':'#5c3a0a','--ink-2':'#92400e','--ink-3':'#a88a5a','--ink-4':'#d4bf8a',
      '--gray-50':'#fffcf0','--gray-100':'#fef8e0','--gray-200':'#fef3c7','--gray-300':'#c4b896','--gray-400':'#a09478','--gray-500':'#7d7260','--gray-600':'#635a4a','--gray-700':'#4a4338','--gray-800':'#342e24','--gray-900':'#201c14',
      '--glass-bg':'rgba(255,252,240,0.82)','--glass-border':'rgba(253,230,138,0.5)','--topbar-bg':'rgba(255,252,240,0.9)','--topbar-border':'rgba(253,230,138,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#fbbf24','--accent-hover':'#fcd34d','--accent-light':'#f59e0b','--accent-muted':'#d97706','--accent-subtle':'rgba(251,191,36,0.1)',
      '--green':'#fbbf24','--green-light':'#fbbf24','--green-subtle':'rgba(251,191,36,0.1)',
      '--cream':'#241a08','--cream-dark':'#1a1206','--paper-line':'#3d2e10',
      '--ink':'#f5ecd5','--ink-2':'#ddd0a8','--ink-3':'#a89870','--ink-4':'#786844',
      '--gray-50':'#2a2010','--gray-100':'#1e180c','--gray-200':'#342816','--gray-300':'#54442a','--gray-400':'#786444','--gray-500':'#9a8464','--gray-600':'#baa484','--gray-700':'#d4c4a4','--gray-800':'#e8dcc4','--gray-900':'#f5ecd5',
      '--glass-bg':'rgba(36,26,8,0.85)','--glass-border':'rgba(251,191,36,0.12)','--topbar-bg':'rgba(36,26,8,0.9)','--topbar-border':'rgba(61,46,16,0.6)',
      '--paper':'#2a2010',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'rose', name: '玫瑰', preview: '#e11d48',
    light: {
      '--accent':'#e11d48','--accent-hover':'#be123c','--accent-light':'#f43f5e','--accent-muted':'#fda4af','--accent-subtle':'#fff1f2',
      '--green':'#e11d48','--green-light':'#f43f5e','--green-subtle':'#fff1f2',
      '--cream':'#fff5f7','--cream-dark':'#ffe0e6','--paper-line':'#fecdd3',
      '--ink':'#5c0a1e','--ink-2':'#9f1239','--ink-3':'#b8607a','--ink-4':'#d9a3b5',
      '--gray-50':'#fff5f7','--gray-100':'#ffeef1','--gray-200':'#ffe4e8','--gray-300':'#b8a8ac','--gray-400':'#96888c','--gray-500':'#786a6e','--gray-600':'#5c5054','--gray-700':'#443a3e','--gray-800':'#30282c','--gray-900':'#1e181a',
      '--glass-bg':'rgba(255,245,247,0.82)','--glass-border':'rgba(254,205,211,0.5)','--topbar-bg':'rgba(255,245,247,0.9)','--topbar-border':'rgba(254,205,211,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#fb7185','--accent-hover':'#fda4af','--accent-light':'#f43f5e','--accent-muted':'#e11d48','--accent-subtle':'rgba(251,113,133,0.1)',
      '--green':'#fb7185','--green-light':'#fb7185','--green-subtle':'rgba(251,113,133,0.1)',
      '--cream':'#2a0e18','--cream-dark':'#1e0810','--paper-line':'#441828',
      '--ink':'#f8dce3','--ink-2':'#e4b8c4','--ink-3':'#b07888','--ink-4':'#7a4858',
      '--gray-50':'#301420','--gray-100':'#220c16','--gray-200':'#3c1828','--gray-300':'#5c2a3e','--gray-400':'#7e4458','--gray-500':'#a06474','--gray-600':'#be8494','--gray-700':'#d8a4b4','--gray-800':'#ecc4d0','--gray-900':'#f8dce3',
      '--glass-bg':'rgba(42,14,24,0.85)','--glass-border':'rgba(251,113,133,0.12)','--topbar-bg':'rgba(42,14,24,0.9)','--topbar-border':'rgba(68,24,40,0.6)',
      '--paper':'#301420',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'violet', name: '紫罗兰', preview: '#7c3aed',
    light: {
      '--accent':'#7c3aed','--accent-hover':'#6d28d9','--accent-light':'#8b5cf6','--accent-muted':'#c4b5fd','--accent-subtle':'#f5f3ff',
      '--green':'#7c3aed','--green-light':'#8b5cf6','--green-subtle':'#f5f3ff',
      '--cream':'#f8f5ff','--cream-dark':'#ede5fe','--paper-line':'#ddd6fe',
      '--ink':'#2e1065','--ink-2':'#5b21b6','--ink-3':'#7a62a8','--ink-4':'#b5a3d4',
      '--gray-50':'#f8f5ff','--gray-100':'#f0ecfe','--gray-200':'#ede9fe','--gray-300':'#b0a8c0','--gray-400':'#8a829a','--gray-500':'#6a627a','--gray-600':'#524a60','--gray-700':'#3c3648','--gray-800':'#2a2434','--gray-900':'#1a1622',
      '--glass-bg':'rgba(248,245,255,0.82)','--glass-border':'rgba(221,214,254,0.5)','--topbar-bg':'rgba(248,245,255,0.9)','--topbar-border':'rgba(221,214,254,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#a78bfa','--accent-hover':'#c4b5fd','--accent-light':'#8b5cf6','--accent-muted':'#7c3aed','--accent-subtle':'rgba(167,139,250,0.1)',
      '--green':'#a78bfa','--green-light':'#a78bfa','--green-subtle':'rgba(167,139,250,0.1)',
      '--cream':'#1a1030','--cream-dark':'#120a22','--paper-line':'#2e1a4e',
      '--ink':'#e8e0f5','--ink-2':'#c8b8e0','--ink-3':'#8a74b0','--ink-4':'#5a4880',
      '--gray-50':'#1e1438','--gray-100':'#16102a','--gray-200':'#281c44','--gray-300':'#402e64','--gray-400':'#604a84','--gray-500':'#8068a4','--gray-600':'#a088c0','--gray-700':'#c0a8d8','--gray-800':'#d8c8ea','--gray-900':'#e8e0f5',
      '--glass-bg':'rgba(26,16,48,0.85)','--glass-border':'rgba(167,139,250,0.12)','--topbar-bg':'rgba(26,16,48,0.9)','--topbar-border':'rgba(46,26,78,0.6)',
      '--paper':'#1e1438',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'forest', name: '森林', preview: '#16a34a',
    light: {
      '--accent':'#16a34a','--accent-hover':'#15803d','--accent-light':'#22c55e','--accent-muted':'#86efac','--accent-subtle':'#f0fdf4',
      '--green':'#16a34a','--green-light':'#22c55e','--green-subtle':'#f0fdf4',
      '--cream':'#f2fdf5','--cream-dark':'#d8f8e2','--paper-line':'#bbf7d0',
      '--ink':'#0a3d1a','--ink-2':'#166534','--ink-3':'#5a9a6e','--ink-4':'#a0cdaa',
      '--gray-50':'#f0fdf4','--gray-100':'#e2f8e8','--gray-200':'#dcfce7','--gray-300':'#a8b8ac','--gray-400':'#849488','--gray-500':'#667668','--gray-600':'#4e5c50','--gray-700':'#3a463c','--gray-800':'#28302a','--gray-900':'#18201a',
      '--glass-bg':'rgba(242,253,245,0.82)','--glass-border':'rgba(187,247,208,0.5)','--topbar-bg':'rgba(242,253,245,0.9)','--topbar-border':'rgba(187,247,208,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#4ade80','--accent-hover':'#86efac','--accent-light':'#22c55e','--accent-muted':'#16a34a','--accent-subtle':'rgba(74,222,128,0.1)',
      '--green':'#4ade80','--green-light':'#4ade80','--green-subtle':'rgba(74,222,128,0.1)',
      '--cream':'#0a2010','--cream-dark':'#06160a','--paper-line':'#163820',
      '--ink':'#ddf5e5','--ink-2':'#b0d8bc','--ink-3':'#6aaa7e','--ink-4':'#3a7a50',
      '--gray-50':'#0e2818','--gray-100':'#0a1e10','--gray-200':'#143020','--gray-300':'#264a34','--gray-400':'#406a4e','--gray-500':'#608a6a','--gray-600':'#80a888','--gray-700':'#a0c4a8','--gray-800':'#c4dcc8','--gray-900':'#ddf5e5',
      '--glass-bg':'rgba(10,32,16,0.85)','--glass-border':'rgba(74,222,128,0.12)','--topbar-bg':'rgba(10,32,16,0.9)','--topbar-border':'rgba(22,56,32,0.6)',
      '--paper':'#0e2818',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
  {
    id: 'slate', name: '石板', preview: '#475569',
    light: {
      '--accent':'#475569','--accent-hover':'#334155','--accent-light':'#64748b','--accent-muted':'#94a3b8','--accent-subtle':'#f8fafc',
      '--green':'#475569','--green-light':'#64748b','--green-subtle':'#f8fafc',
      '--cream':'#f8fafc','--cream-dark':'#e8ecf0','--paper-line':'#e2e8f0',
      '--ink':'#0f172a','--ink-2':'#334155','--ink-3':'#64748b','--ink-4':'#94a3b8',
      '--gray-50':'#f8fafc','--gray-100':'#f1f5f9','--gray-200':'#e2e8f0','--gray-300':'#cbd5e1','--gray-400':'#94a3b8','--gray-500':'#64748b','--gray-600':'#475569','--gray-700':'#334155','--gray-800':'#1e293b','--gray-900':'#0f172a',
      '--glass-bg':'rgba(248,250,252,0.82)','--glass-border':'rgba(226,232,240,0.5)','--topbar-bg':'rgba(248,250,252,0.9)','--topbar-border':'rgba(226,232,240,0.55)',
      '--paper':'#ffffff',
      '--amber':'#d97706','--amber-subtle':'#fffbeb','--red':'#dc2626','--red-light':'#ef4444','--red-subtle':'#fef2f2','--blue':'#0284c7','--blue-light':'#0ea5e9','--blue-subtle':'#f0f9ff','--purple':'#9333ea','--purple-subtle':'#faf5ff',
    },
    dark: {
      '--accent':'#94a3b8','--accent-hover':'#cbd5e1','--accent-light':'#64748b','--accent-muted':'#475569','--accent-subtle':'rgba(148,163,184,0.1)',
      '--green':'#94a3b8','--green-light':'#94a3b8','--green-subtle':'rgba(148,163,184,0.1)',
      '--cream':'#111827','--cream-dark':'#0c1220','--paper-line':'#1e293b',
      '--ink':'#e2e8f0','--ink-2':'#cbd5e1','--ink-3':'#7a8694','--ink-4':'#4a5568',
      '--gray-50':'#151e2c','--gray-100':'#0f172a','--gray-200':'#1a2638','--gray-300':'#2e3e52','--gray-400':'#4a5a70','--gray-500':'#6a7a8e','--gray-600':'#8a9aaa','--gray-700':'#aabac8','--gray-800':'#c8d4de','--gray-900':'#e2e8f0',
      '--glass-bg':'rgba(17,24,39,0.85)','--glass-border':'rgba(148,163,184,0.1)','--topbar-bg':'rgba(17,24,39,0.9)','--topbar-border':'rgba(30,41,59,0.6)',
      '--paper':'#151e2c',
      '--amber':'#fbbf24','--amber-subtle':'rgba(251,191,36,0.12)','--red':'#f87171','--red-light':'#f87171','--red-subtle':'rgba(248,113,113,0.12)','--blue':'#38bdf8','--blue-light':'#38bdf8','--blue-subtle':'rgba(56,189,248,0.12)','--purple':'#c084fc','--purple-subtle':'rgba(192,132,252,0.12)',
    },
  },
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
