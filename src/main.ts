import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { initTheme } from './composables/useTheme'
import './styles/index.scss'

// Initialize theme before mount so CSS variables are set
// before first paint (avoids flash of default ocean).
initTheme()

// Set lang attribute from saved locale (avoids mismatch with hardcoded value)
const LOCALE_KEY = 'notepad-locale'
const savedLocale = localStorage.getItem(LOCALE_KEY) || 'zh-CN'
document.documentElement.setAttribute('lang', savedLocale)

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
