import { post, get } from './request'

export function sendStopCommand(deviceId) {
  return post(`/iot/sendStopCommand/${deviceId}`, {})
}

export function sendPauseCommand(deviceId) {
  return post(`/iot/sendPauseCommand/${deviceId}`, {})
}

export function sendResumeCommand(deviceId) {
  return post(`/iot/sendResumeCommand/${deviceId}`, {})
}

export function sendRestartCommand(deviceId, modelId) {
  return post('/iot/sendRestartCommand', { deviceId, modelId })
}

export function sendPrintCommand(deviceId, modelId, action) {
  return post('/iot/sendPrintCommand', { deviceId, modelId, action })
}

export function updateFirmwareStatus(deviceId) {
  return post('/iot/firmware/updateStatus', { deviceId })
}

export function checkFirmware(firmwareCheckRequestDTO) {
  return post('/iot/firmware/checkVersion', firmwareCheckRequestDTO)
}

export function verifyCredential(deviceCredentialVerifyDTO) {
  return post('/iot/auth/verify', deviceCredentialVerifyDTO)
}

export function getDeviceStatus(deviceId) {
  return get('/iot/status', { deviceId })
}

export function getDeviceAuth(deviceId) {
  return get('/iot/auth', { deviceId })
}
