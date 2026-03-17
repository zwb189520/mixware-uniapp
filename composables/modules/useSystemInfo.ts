import { ref, onMounted } from 'vue'

/**
 * 系统信息相关组合式函数
 * @returns {Object} 系统状态
 */
export function useSystemInfo() {
  const statusBarHeight = ref(0)

  const updateSystemInfo = () => {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight
  }

  onMounted(() => {
    updateSystemInfo()
  })

  return {
    statusBarHeight,
    updateSystemInfo
  }
}
