import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { initTheme } from './composables/useTheme'
import './styles/index.scss'

// Initialize theme before mount so CSS variables are set
// before first paint (avoids flash of default ocean).
initTheme()

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
