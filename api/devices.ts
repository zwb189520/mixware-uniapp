import { get, put, post, del } from './request'
import type { ApiResponse, Device, PaginatedData } from '@/types/api'
import { useUserStore } from '@/stores/index.ts'

interface DeviceRecord {
  deviceId: string
  deviceName: string
  bindTime: string
  deviceState: string
  isDefault: boolean
}

interface MappedDevice extends Device {
  id: string
  name: string
  deviceStatus: number
  status: number
  bindTime?: string
  isDefault?: boolean
}

export function getDeviceList(): Promise<ApiResponse<{ records: MappedDevice[] }>> {
  const userStore = useUserStore()
  const userId = userStore.userId
  if (!userId) return Promise.reject(new Error('未登录'))
  return getUserDeviceList(userId).then((res) => {
    const rawData = res.data
    let records: Device[] = []
    if (Array.isArray(rawData)) {
      records = rawData
    } else if (rawData && typeof rawData === 'object' && 'records' in rawData) {
      records = (rawData as { records: Device[] }).records
    }
    return {
      ...res,
      data: {
        records: records.map((item): MappedDevice => ({
          id: item.deviceId,
          deviceId: item.deviceId,
          name: item.deviceName || '',
          deviceName: item.deviceName || '',
          bindTime: (item as DeviceRecord).bindTime,
          deviceState: item.deviceState || '',
          deviceStatus: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
          status: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
          isDefault: (item as DeviceRecord).isDefault
        }))
      }
    }
  })
}

export function updateDeviceInfo(deviceUpdateDTO: Record<string, unknown>): Promise<ApiResponse<Device>> {
  return put<Device>('/devices/update', deviceUpdateDTO)
}

export function updateDeviceStatus(deviceId: string, deviceStatus: string): Promise<ApiResponse<null>> {
  return put<null>(`/devices/status/${deviceId}`, { deviceStatus })
}

export function getDeviceStatus(deviceId: string): Promise<ApiResponse<Device>> {
  return get<Device>(`/devices/status/${deviceId}`)
}

export function parseSnCode(snCode: string): Promise<ApiResponse<{ deviceType: string; deviceId: string }>> {
  return post<{ deviceType: string; deviceId: string }>('/devices/parseSnCode', { snCode })
}

export function setDefaultDevice(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/devices/default/${deviceId}`, {})
}

export function createDevice(deviceCreateDTO: Record<string, unknown>): Promise<ApiResponse<Device>> {
  return post<Device>('/devices/create', deviceCreateDTO)
}

export function bindDevice(bindRequest: Record<string, unknown>, options: Record<string, unknown> = {}): Promise<ApiResponse<Device>> {
  return post<Device>('/devices/bind', bindRequest, { ...options, timeout: 120000 })
}

export function getDevicesPage(params: Record<string, unknown>): Promise<ApiResponse<PaginatedData<Device>>> {
  const userStore = useUserStore()
  const userId = params.userId || userStore.userId
  return get<PaginatedData<Device>>('/devices/page', { ...params, userId })
}

export function getDeviceInfo(deviceId: string): Promise<ApiResponse<Device>> {
  return get<Device>(`/devices/info/${deviceId}`)
}

export function getUserDeviceList(userId: string): Promise<ApiResponse<Device[]>> {
  return get<Device[]>(`/devices/getUserDevice/${userId}`)
}

export function getDefaultDevice(): Promise<ApiResponse<Device>> {
  return get<Device>('/devices/default')
}

export function deleteDevice(deviceId: string): Promise<ApiResponse<null>> {
  return del<null>(`/devices/delete/${deviceId}`)
}

export function batchDeleteDevices(deviceIds: string[]): Promise<ApiResponse<null>> {
  return del<null>('/devices/batch', deviceIds as unknown as Record<string, unknown>)
}
