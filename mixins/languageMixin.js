import { useLanguageStore } from '@/stores'

export default {
  data() {
    return {
      languageStore: null
    }
  },
  computed: {
    texts() {
      return this.languageStore?.texts || {}
    }
  },
  created() {
    this.languageStore = useLanguageStore()
  },
  mounted() {
    this.languageStore.loadLanguage()
  }
}