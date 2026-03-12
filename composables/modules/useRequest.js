import { ref } from 'vue'

/**
 * 请求相关组合式函数
 * 注意：request.js 已经提供了 showLoading 参数，建议直接使用 request 函数
 * 本 composable 仅在需要额外的错误处理或状态管理时使用
 * @returns {Object} 错误状态和重置方法
 */
export function useRequest() {
  const error = ref(null)
  
  const resetError = () => {
    error.value = null
  }
  
  return {
    error,
    resetError
  }
}