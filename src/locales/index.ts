import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const LOCALE_KEY = 'notepad-locale'

function getInitialLocale(): string {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved === 'en-US' || saved === 'zh-CN') return saved
  return 'zh-CN'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
