import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorageSync } from '../../composables/modules/useStorageSync'

interface Model {
  id: string | number
  isLiked?: boolean
  likes?: number
  [key: string]: any
}

interface StorageState {
  dailyModels: Model[]
  hotModels: Model[]
  categoryModels: Model[]
  hotTags: string[]
}

export const useExploreStore = defineStore('explore', () => {
  const currentTab = ref<string>('daily')
  const keyword = ref<string>('')
  const showSearch = ref<boolean>(false)
  const hotTags = ref<string[]>([])
  const dailyModels = ref<Model[]>([])
  const hotModels = ref<Model[]>([])
  const categoryModels = ref<Model[]>([])
  const loading = ref<boolean>(false)

  const {
    state: storageState,
    initFromStorage,
    saveToStorage
  } = useStorageSync<StorageState>('exploreData', {
    dailyModels: [],
    hotModels: [],
    categoryModels: [],
    hotTags: []
  })

  const dailyLeftList = computed(() => dailyModels.value.filter((_: Model, i: number) => i % 2 === 0))
  const dailyRightList = computed(() => dailyModels.value.filter((_: Model, i: number) => i % 2 === 1))
  const hotLeftList = computed(() => hotModels.value.filter((_: Model, i: number) => i % 2 === 0))
  const hotRightList = computed(() => hotModels.value.filter((_: Model, i: number) => i % 2 === 1))
  const categoryLeftList = computed(() => categoryModels.value.filter((_: Model, i: number) => i % 2 === 0))
  const categoryRightList = computed(() => categoryModels.value.filter((_: Model, i: number) => i % 2 === 1))

  function setCurrentTab(tab: string): void {
    currentTab.value = tab
  }

  function setKeyword(value: string): void {
    keyword.value = value
  }

  function setShowSearch(value: boolean): void {
    showSearch.value = value
  }

  function setHotTags(tags: string[]): void {
    hotTags.value = tags
    storageState.value.hotTags = tags
  }

  function setDailyModels(models: Model[]): void {
    dailyModels.value = models
    storageState.value.dailyModels = models
    persistToStorage()
  }

  function setHotModels(models: Model[]): void {
    hotModels.value = models
    storageState.value.hotModels = models
    persistToStorage()
  }

  function setCategoryModels(models: Model[]): void {
    categoryModels.value = models
    storageState.value.categoryModels = models
    persistToStorage()
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function updateModelLike(modelId: string | number, isLiked: boolean, likes: number): void {
    const updateInList = (list: Model[]) => {
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

  function persistToStorage(): void {
    storageState.value = {
      dailyModels: dailyModels.value,
      hotModels: hotModels.value,
      categoryModels: categoryModels.value,
      hotTags: hotTags.value
    }
    saveToStorage()
  }

  function clearAll(): void {
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
