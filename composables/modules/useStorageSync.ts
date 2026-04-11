import { ref, computed } from 'vue'

/**
 * 通用的存储同步 Hook
 * 用于 Pinia Store 中的本地存储管理
 *
 * @param {String} storageKey - 本地存储的 key
 * @param {Object} initialState - 初始状态对象
 * @returns {Object} 包含状态和方法的对象
 *
 * @example
 * const { state, initFromStorage, saveToStorage, clearStorage } = useStorageSync('userData', {
 *   name: '',
 *   age: 0
 * })
 */
export function useStorageSync<T extends Record<string, any>>(storageKey: string, initialState: T = {} as T) {
  const state = ref<T>({ ...initialState } as T)

  const initFromStorage = (): void => {
    try {
      const storedData = uni.getStorageSync(storageKey)
      if (storedData) {
        state.value = { ...state.value, ...storedData } as T
      }
    } catch (e) {
      console.warn(`从本地存储加载 ${storageKey} 失败:`, e)
    }
  }

  const saveToStorage = (): void => {
    try {
      uni.setStorageSync(storageKey, state.value)
    } catch (e) {
      console.warn(`保存 ${storageKey} 到本地存储失败:`, e)
    }
  }

  const clearStorage = (): void => {
    try {
      uni.removeStorageSync(storageKey)
      state.value = { ...initialState } as T
    } catch (e) {
      console.warn(`清除 ${storageKey} 失败:`, e)
    }
  }

  const updateAndSave = (updates: Partial<T>): void => {
    state.value = { ...state.value, ...updates }
    saveToStorage()
  }

  const reset = (): void => {
    state.value = { ...initialState }
    saveToStorage()
  }

  return {
    state,
    initFromStorage,
    saveToStorage,
    clearStorage,
    updateAndSave,
    reset
  }
}
