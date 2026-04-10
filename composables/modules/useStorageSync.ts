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
export function useStorageSync(storageKey, initialState = {}) {
  // 创建响应式状态
  const state = ref({ ...initialState })

  /**
   * 从本地存储初始化状态
   */
  const initFromStorage = () => {
    try {
      const storedData = uni.getStorageSync(storageKey)
      if (storedData) {
        // 合并存储的数据和初始状态
        state.value = { ...state.value, ...storedData }
      }
    } catch (e) {
      console.warn(`从本地存储加载 ${storageKey} 失败:`, e)
    }
  }

  /**
   * 保存状态到本地存储
   */
  const saveToStorage = () => {
    try {
      uni.setStorageSync(storageKey, state.value)
    } catch (e) {
      console.warn(`保存 ${storageKey} 到本地存储失败:`, e)
    }
  }

  /**
   * 清除本地存储
   */
  const clearStorage = () => {
    try {
      uni.removeStorageSync(storageKey)
      state.value = { ...initialState }
    } catch (e) {
      console.warn(`清除 ${storageKey} 失败:`, e)
    }
  }

  /**
   * 更新状态并保存到本地存储
   * @param {Object} updates - 要更新的字段
   */
  const updateAndSave = updates => {
    state.value = { ...state.value, ...updates }
    saveToStorage()
  }

  /**
   * 重置状态到初始值
   */
  const reset = () => {
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
