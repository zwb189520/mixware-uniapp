import { get, put, post, del } from './request'

export function getDeviceList() {
  const userId = uni.getStorageSync('userId')
  if (!userId) return Promise.reject(new Error('未登录'))
  return getUserDevices(userId).then(res => {
    // 适配数据格式，将数组包装进 records 模拟分页格式以兼容现有 UI
    return {
      ...res,
      data: {
        records: res.data || []
      }
    }
  })
}

export function updateDeviceInfo(deviceUpdateDTO) {
  return put('/devices/update', deviceUpdateDTO)
}

export function updateDeviceStatus(deviceId, deviceStatus) {
  return put(`/devices/status/${deviceId}`, { deviceStatus })
}

export function getDeviceStatus(deviceId) {
  return get(`/devices/status/${deviceId}`)
}

export function parseSnCode(snCode) {
  return post('/devices/parseSnCode', { snCode })
}

export function setDefaultDevice(deviceId) {
  return post(`/devices/default/${deviceId}`, {})
}

export function createDevice(deviceCreateDTO) {
  return post('/devices/create', deviceCreateDTO)
}

export function bindDevice(bindRequest, options = {}) {
  console.log('绑定设备请求参数:', bindRequest)
  return post('/devices/bind', bindRequest, { ...options, timeout: 120000 })
}

export function getDevicesPage(params) {
  const userId = uni.getStorageSync('userId')
  return get('/devices/page', { ...params, userId: params.userId || userId })
}

export function getDeviceInfo(deviceId) {
  return get(`/devices/info/${deviceId}`)
}

export function getUserDevices(userId) {
  return get(`/devices/getUserDevice/${userId}`)
}

export function getDefaultDevice() {
  return get('/devices/default')
}

export function deleteDevice(deviceId) {
  return del(`/devices/delete/${deviceId}`)
}

export function batchDeleteDevices(deviceIds) {
  return del('/devices/batch', deviceIds)
}
