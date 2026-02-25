import { useLanguageStore } from '@/stores'
import { computed, onMounted } from 'vue'

/**
 * 语言相关组合式函数
 * @returns {Object} 语言相关方法和状态
 */
export function useLanguage() {
  const languageStore = useLanguageStore()
  
  const language = computed(() => languageStore.language)
  const texts = computed(() => languageStore.texts.profile || languageStore.texts.settings || languageStore.texts)
  const languageLabel = computed(() => languageStore.language === 'en' ? 'English' : '中文')
  
  const loadLanguage = () => {
    languageStore.loadLanguage()
  }
  
  const setLanguage = (lang) => {
    languageStore.setLanguage(lang)
  }
  
  const showLanguageSelector = () => {
    const options = ['中文', 'English']
    return new Promise((resolve) => {
      uni.showActionSheet({
        itemList: options,
        success: (res) => {
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