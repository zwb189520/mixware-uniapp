import { get, put, post, del } from './request'

interface DeviceRecord {
  deviceId: string
  deviceName: string
  bindTime: string
  deviceState: string
  isDefault: boolean
}

interface MappedDevice {
  id: string
  deviceId: string
  name: string
  deviceName: string
  bindTime: string
  deviceState: string
  deviceStatus: number
  status: number
  isDefault: boolean
}

export function getDeviceList(): Promise<unknown> {
  const userId = uni.getStorageSync('userId')
  if (!userId) return Promise.reject(new Error('未登录'))
  return getUserDevices(userId).then((res: unknown) => {
    const resData = res as { data?: { records?: DeviceRecord[]; [key: string]: unknown }; [key: string]: unknown }
    const records = resData.data?.records || []
    return {
      ...resData,
      data: {
        records: records.map((item: DeviceRecord): MappedDevice => ({
          id: item.deviceId,
          deviceId: item.deviceId,
          name: item.deviceName,
          deviceName: item.deviceName,
          bindTime: item.bindTime,
          deviceState: item.deviceState,
          deviceStatus: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
          status: item.deviceState?.toUpperCase() === 'ONLINE' ? 1 : 0,
          isDefault: item.isDefault
        }))
      }
    }
  })
}

export function updateDeviceInfo(deviceUpdateDTO: Record<string, unknown>): Promise<unknown> {
  return put('/devices/update', deviceUpdateDTO)
}

export function updateDeviceStatus(deviceId: string, deviceStatus: string): Promise<unknown> {
  return put(`/devices/status/${deviceId}`, { deviceStatus })
}

export function getDeviceStatus(deviceId: string): Promise<unknown> {
  return get(`/devices/status/${deviceId}`)
}

export function parseSnCode(snCode: string): Promise<unknown> {
  return post('/devices/parseSnCode', { snCode })
}

export function setDefaultDevice(deviceId: string): Promise<unknown> {
  return post(`/devices/default/${deviceId}`, {})
}

export function createDevice(deviceCreateDTO: Record<string, unknown>): Promise<unknown> {
  return post('/devices/create', deviceCreateDTO)
}

export function bindDevice(bindRequest: Record<string, unknown>, options: Record<string, unknown> = {}): Promise<unknown> {
  return post('/devices/bind', bindRequest, { ...options, timeout: 120000 })
}

export function getDevicesPage(params: Record<string, unknown>): Promise<unknown> {
  const userId = uni.getStorageSync('userId')
  return get('/devices/page', { ...params, userId: params.userId || userId })
}

export function getDeviceInfo(deviceId: string): Promise<unknown> {
  return get(`/devices/info/${deviceId}`)
}

export function getUserDevices(userId: string): Promise<unknown> {
  return get(`/devices/getUserDevice/${userId}`)
}

export function getDefaultDevice(): Promise<unknown> {
  return get('/devices/default')
}

export function deleteDevice(deviceId: string): Promise<unknown> {
  return del(`/devices/delete/${deviceId}`)
}

export function batchDeleteDevices(deviceIds: string[]): Promise<unknown> {
  return del('/devices/batch', deviceIds as unknown as Record<string, unknown>)
}
