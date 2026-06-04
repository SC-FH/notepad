import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import './styles/index.scss'

// Initialize theme before mount so CSS variables are set
// before first paint (avoids flash of default teal).
initTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
