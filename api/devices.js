import { get, put, post, del } from './request'

export function getDeviceList() {
  return get('/devices/page', { current: 1, size: 100 })
}

export function updateDeviceInfo(deviceUpdateDTO) {
  return put('/devices/update', deviceUpdateDTO)
}

export function updateDeviceStatus(deviceId, deviceStatus) {
  return put(`/devices/status/${deviceId}`, { deviceStatus })
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
  return post('/devices/bind', bindRequest, options)
}

export function getDevicesPage(params) {
  return get('/devices/page', params)
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
