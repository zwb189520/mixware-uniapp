import { ref } from 'vue'

/**
 * 请求相关组合式函数
 * @returns {Object} 请求相关方法和状态
 */
export function useRequest() {
  const loading = ref(false)
  const error = ref(null)
  
  const executeRequest = async (requestFunction, ...args) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await requestFunction(...args)
      return result
    } catch (err) {
      error.value = err
      console.error('请求失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const resetError = () => {
    error.value = null
  }
  
  return {
    loading,
    error,
    executeRequest,
    resetError
  }
}