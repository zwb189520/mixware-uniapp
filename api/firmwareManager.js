import { get, post, put } from './request'

// 固件管理接口
export function checkFirmware(deviceId) {
  return get(`/firmware/check/${deviceId}`)
}

export function updateFirmwareStatus(deviceId, firmwareUpdateDTO) {
  return put(`/firmware/update/${deviceId}`, firmwareUpdateDTO)
}

export function verifyCredential(deviceId, credential) {
  return post(`/firmware/verify/${deviceId}`, { credential })
}

export function getDeviceAuth(deviceId) {
  return get(`/firmware/auth/${deviceId}`)
}

export function getFirmwareInfo(deviceId) {
  return get(`/firmware/info/${deviceId}`)
}

export function downloadFirmware(deviceId, version) {
  return post(`/firmware/download/${deviceId}`, { version })
}

export function installFirmware(deviceId, firmwareId) {
  return post(`/firmware/install/${deviceId}`, { firmwareId })
}

export function getFirmwareHistory(deviceId) {
  return get(`/firmware/history/${deviceId}`)
}

export function rollbackFirmware(deviceId, targetVersion) {
  return post(`/firmware/rollback/${deviceId}`, { targetVersion })
}

export function validateFirmware(deviceId, firmwareData) {
  return post(`/firmware/validate/${deviceId}`, firmwareData)
}