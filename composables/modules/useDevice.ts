import { ref } from 'vue'

/**
 * 设备相关组合式函数
 * @returns {Object} 设备相关方法和状态
 */
export function useDevice() {
  const devices = ref([])
  const currentDevice = ref(null)
  const loading = ref(false)

  const fetchDevices = async apiFunction => {
    loading.value = true
    try {
      const result = await apiFunction()
      devices.value = result || []
      return result
    } catch (error) {
      console.error('获取设备列表失败:', error)
      devices.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const setCurrentDevice = device => {
    currentDevice.value = device
  }

  const getDeviceById = deviceId => {
    return devices.value.find(device => device.id === deviceId || device.deviceId === deviceId)
  }

  const clearDevices = () => {
    devices.value = []
    currentDevice.value = null
  }

  return {
    devices,
    currentDevice,
    loading,
    fetchDevices,
    setCurrentDevice,
    getDeviceById,
    clearDevices
  }
}
