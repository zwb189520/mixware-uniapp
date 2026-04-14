import { get, put, post, del } from './request'
import type { ApiResponse, Device, PaginatedData, RequestData } from '@/types/api'
import { useUserStore } from '@/stores/index.ts'

interface DeviceRecord {
  deviceId: string
  deviceName: string
  bindTime: string
  deviceState: string
  isDefault: boolean
}

interface DeviceUpdateDTO {
  deviceId: string
  deviceName?: string
  deviceType?: string
}

interface BindDeviceRequest {
  deviceId: string
  deviceName?: string
  deviceType?: string
  snCode?: string
}

interface ParseSnResult {
  deviceType: string
  deviceId: string
}

export function getDeviceList(): Promise<ApiResponse<Device[]>> {
  const userStore = useUserStore()
  const userId = userStore.userId
  if (!userId) return Promise.reject(new Error('未登录'))
  return getUserDeviceList(userId).then((res) => {
    const rawData = res.data
    let records: DeviceRecord[] = []
    if (Array.isArray(rawData)) {
      records = rawData
    } else if (rawData && typeof rawData === 'object' && 'records' in rawData) {
      records = (rawData as { records: DeviceRecord[] }).records
    }
    return {
      ...res,
      data: records.map((item): Device => ({
        id: item.deviceId,
        deviceId: item.deviceId,
        name: item.deviceName || '',
        deviceName: item.deviceName || '',
        bindTime: item.bindTime,
        deviceState: item.deviceState || 'Offline',
        deviceStatus: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
        status: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
        isDefault: item.isDefault,
        deviceType: '',
        printState: 'Idle',
        progress: 0,
        printTimeHms: '',
        filamentLengthM: 0,
        firmwareVersion: '',
        lastOnline: ''
      }))
    }
  })
}

export function updateDeviceInfo(deviceUpdateDTO: DeviceUpdateDTO): Promise<ApiResponse<Device>> {
  return put<Device>('/devices/update', deviceUpdateDTO as unknown as RequestData)
}

export function updateDeviceStatus(deviceId: string, deviceStatus: string): Promise<ApiResponse<null>> {
  return put<null>(`/devices/status/${deviceId}`, { deviceStatus })
}

export function getDeviceStatus(deviceId: string): Promise<ApiResponse<Device>> {
  return get<Device>(`/devices/status/${deviceId}`)
}

export function parseSnCode(snCode: string): Promise<ApiResponse<ParseSnResult>> {
  return post<ParseSnResult>('/devices/parseSnCode', { snCode })
}

export function setDefaultDevice(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/devices/default/${deviceId}`, {})
}

export function createDevice(deviceCreateDTO: RequestData): Promise<ApiResponse<Device>> {
  return post<Device>('/devices/create', deviceCreateDTO)
}

export function bindDevice(bindRequest: BindDeviceRequest, options: RequestData = {}): Promise<ApiResponse<Device>> {
  return post<Device>('/devices/bind', bindRequest as unknown as RequestData, { ...options, timeout: 120000 })
}

export function getDevicesPage(params: RequestData): Promise<ApiResponse<PaginatedData<Device>>> {
  const userStore = useUserStore()
  const userId = params.userId || userStore.userId
  return get<PaginatedData<Device>>('/devices/page', { ...params, userId })
}

export function getDeviceInfo(deviceId: string): Promise<ApiResponse<Device>> {
  return get<Device>(`/devices/info/${deviceId}`)
}

export function getUserDeviceList(userId: string | number): Promise<ApiResponse<DeviceRecord[]>> {
  return get<DeviceRecord[]>(`/devices/getUserDevice/${userId}`)
}

export function getDefaultDevice(): Promise<ApiResponse<Device>> {
  return get<Device>('/devices/default')
}

export function deleteDevice(deviceId: string): Promise<ApiResponse<null>> {
  return del<null>(`/devices/delete/${deviceId}`)
}

export function batchDeleteDevices(deviceIds: string[]): Promise<ApiResponse<null>> {
  return del<null>('/devices/batch', { deviceIds } as unknown as RequestData)
}
