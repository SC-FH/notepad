import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const LOCALE_KEY = 'notepad-locale'

export function useLocale() {
  const { locale, t } = useI18n()

  const currentLocale = computed(() => locale.value)

  const setLocale = (lang: 'zh-CN' | 'en-US'): void => {
    locale.value = lang
    localStorage.setItem(LOCALE_KEY, lang)
    document.documentElement.setAttribute('lang', lang)
  }

  const toggleLocale = (): void => {
    setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
  }

  const isChinese = computed(() => locale.value === 'zh-CN')

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    isChinese,
    t,
  }
}
