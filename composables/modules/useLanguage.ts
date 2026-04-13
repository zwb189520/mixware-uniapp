import { useLanguageStore } from '@/stores'
import { computed, onMounted } from 'vue'

export function useLanguage() {
  const languageStore = useLanguageStore()

  const language = computed(() => languageStore.language)
  const texts = computed(
    () => languageStore.texts.profile || languageStore.texts.settings || languageStore.texts
  )
  const languageLabel = computed(() => (languageStore.language === 'en' ? 'English' : '中文'))

  const loadLanguage = (): void => {
    languageStore.loadLanguage()
  }

  const setLanguage = (lang: string): void => {
    languageStore.setLanguage(lang)
  }

  const showLanguageSelector = (): Promise<string | undefined> => {
    const options = ['中文', 'English']
    return new Promise(resolve => {
      uni.showActionSheet({
        itemList: options,
        success: (res: { tapIndex: number }) => {
          if (typeof res.tapIndex === 'number') {
            const lang = res.tapIndex === 1 ? 'en' : 'zh'
            setLanguage(lang)
            resolve(lang)
          }
        }
      })
    })
  }

  onMounted(() => {
    loadLanguage()
  })

  return {
    language,
    texts,
    languageLabel,
    loadLanguage,
    setLanguage,
    showLanguageSelector
  }
}
