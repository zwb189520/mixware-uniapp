import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExploreStore = defineStore('explore', () => {
  const currentTab = ref('daily')
  const keyword = ref('')
  const showSearch = ref(false)
  const hotTags = ref([])
  const dailyModels = ref([])
  const hotModels = ref([])
  const categoryModels = ref([])
  const loading = ref(false)

  const dailyLeftList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 0))
  const dailyRightList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 1))
  const hotLeftList = computed(() => hotModels.value.filter((_, i) => i % 2 === 0))
  const hotRightList = computed(() => hotModels.value.filter((_, i) => i % 2 === 1))
  const categoryLeftList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 0))
  const categoryRightList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 1))

  function setCurrentTab(tab) {
    currentTab.value = tab
  }

  function setKeyword(value) {
    keyword.value = value
  }

  function setShowSearch(value) {
    showSearch.value = value
  }

  function setHotTags(tags) {
    hotTags.value = tags
  }

  function setDailyModels(models) {
    dailyModels.value = models
    saveToStorage()
  }

  function setHotModels(models) {
    hotModels.value = models
    saveToStorage()
  }

  function setCategoryModels(models) {
    categoryModels.value = models
    saveToStorage()
  }

  function setLoading(value) {
    loading.value = value
  }

  function saveToStorage() {
    try {
      uni.setStorageSync('exploreData', {
        dailyModels: dailyModels.value,
        hotModels: hotModels.value,
        categoryModels: categoryModels.value,
        hotTags: hotTags.value
      })
    } catch (e) {
      console.warn('保存探索数据到本地存储失败:', e)
    }
  }

  function initFromStorage() {
    try {
      const storedData = uni.getStorageSync('exploreData')
      if (storedData) {
        if (storedData.dailyModels) dailyModels.value = storedData.dailyModels
        if (storedData.hotModels) hotModels.value = storedData.hotModels
        if (storedData.categoryModels) categoryModels.value = storedData.categoryModels
        if (storedData.hotTags) hotTags.value = storedData.hotTags
      }
    } catch (e) {
      console.warn('从本地存储加载探索数据失败:', e)
    }
  }

  return {
    currentTab,
    keyword,
    showSearch,
    hotTags,
    dailyModels,
    hotModels,
    categoryModels,
    loading,
    dailyLeftList,
    dailyRightList,
    hotLeftList,
    hotRightList,
    categoryLeftList,
    categoryRightList,
    setCurrentTab,
    setKeyword,
    setShowSearch,
    setHotTags,
    setDailyModels,
    setHotModels,
    setCategoryModels,
    setLoading,
    initFromStorage
  }
})
