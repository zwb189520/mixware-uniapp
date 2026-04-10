// @ts-nocheck
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorageSync } from '../../composables/modules/useStorageSync'

export const useExploreStore = defineStore('explore', () => {
  // 基础状态
  const currentTab = ref('daily')
  const keyword = ref('')
  const showSearch = ref(false)
  const hotTags = ref([])
  const dailyModels = ref([])
  const hotModels = ref([])
  const categoryModels = ref([])
  const loading = ref(false)

  // 使用通用 Hook 管理存储
  const {
    state: storageState,
    initFromStorage,
    saveToStorage
  } = useStorageSync('exploreData', {
    dailyModels: [],
    hotModels: [],
    categoryModels: [],
    hotTags: []
  })

  // 计算属性 - 瀑布流布局
  const dailyLeftList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 0))
  const dailyRightList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 1))
  const hotLeftList = computed(() => hotModels.value.filter((_, i) => i % 2 === 0))
  const hotRightList = computed(() => hotModels.value.filter((_, i) => i % 2 === 1))
  const categoryLeftList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 0))
  const categoryRightList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 1))

  // 设置方法
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
    storageState.value.hotTags = tags
  }

  function setDailyModels(models) {
    dailyModels.value = models
    storageState.value.dailyModels = models
    persistToStorage()
  }

  function setHotModels(models) {
    hotModels.value = models
    storageState.value.hotModels = models
    persistToStorage()
  }

  function setCategoryModels(models) {
    categoryModels.value = models
    storageState.value.categoryModels = models
    persistToStorage()
  }

  function setLoading(value) {
    loading.value = value
  }

  function updateModelLike(modelId, isLiked, likes) {
    const updateInList = list => {
      const model = list.find(m => m.id === modelId)
      if (model) {
        model.isLiked = isLiked
        model.likes = likes
      }
    }
    updateInList(dailyModels.value)
    updateInList(hotModels.value)
    updateInList(categoryModels.value)
  }

  // 保存到本地存储
  function persistToStorage() {
    storageState.value = {
      dailyModels: dailyModels.value,
      hotModels: hotModels.value,
      categoryModels: categoryModels.value,
      hotTags: hotTags.value
    }
    saveToStorage()
  }

  // 清除所有数据
  function clearAll() {
    dailyModels.value = []
    hotModels.value = []
    categoryModels.value = []
    hotTags.value = []
    storageState.value = {
      dailyModels: [],
      hotModels: [],
      categoryModels: [],
      hotTags: []
    }
  }

  return {
    // 状态
    currentTab,
    keyword,
    showSearch,
    hotTags,
    dailyModels,
    hotModels,
    categoryModels,
    loading,
    // 计算属性
    dailyLeftList,
    dailyRightList,
    hotLeftList,
    hotRightList,
    categoryLeftList,
    categoryRightList,
    // 方法
    setCurrentTab,
    setKeyword,
    setShowSearch,
    setHotTags,
    setDailyModels,
    setHotModels,
    setCategoryModels,
    setLoading,
    updateModelLike,
    persistToStorage,
    clearAll,
    initFromStorage
  }
})
