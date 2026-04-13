import { ref } from 'vue'

interface Device {
  id?: string | number
  deviceId?: string
  name?: string
  status?: string
  model?: string
  firmware?: string
}

export function useDevice() {
  const devices = ref<Device[]>([])
  const currentDevice = ref<Device | null>(null)
  const loading = ref(false)

  const fetchDevices = async (apiFunction: () => Promise<Device[]>): Promise<Device[]> => {
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

  const setCurrentDevice = (device: Device): void => {
    currentDevice.value = device
  }

  const getDeviceById = (deviceId: string | number): Device | undefined => {
    return devices.value.find(device => device.id === deviceId || device.deviceId === deviceId)
  }

  const clearDevices = (): void => {
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
