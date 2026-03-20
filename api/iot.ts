import { post, get } from './request'

/**
 * 发送停止命令
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回命令结果
 */
export function sendStopCommand(deviceId) {
  return post(`/iot/sendStopCommand/${deviceId}`, {})
}

/**
 * 发送暂停命令
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回命令结果
 */
export function sendPauseCommand(deviceId) {
  return post(`/iot/sendPauseCommand/${deviceId}`, {})
}

/**
 * 发送恢复命令
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回命令结果
 */
export function sendResumeCommand(deviceId) {
  return post(`/iot/sendResumeCommand/${deviceId}`, {})
}

/**
 * 发送重启命令
 * @param {string} deviceId - 设备 ID
 * @param {string} modelId - 模型 ID
 * @returns {Promise<Object>} 返回命令结果
 */
export function sendRestartCommand(deviceId, modelId) {
  return post('/iot/sendRestartCommand', { deviceId, modelId })
}

/**
 * 发送打印命令
 * @param {string} deviceId - 设备 ID
 * @param {string} modelId - 模型 ID
 * @param {string} action - 操作类型
 * @param {string} gcodeUrl - GCode文件URL
 * @returns {Promise<Object>} 返回命令结果
 */
export function sendPrintCommand(deviceId, modelId, action, gcodeUrl) {
  return post('/iot/sendPrintCommand', { deviceId, modelId, action, gcodeUrl })
}

/**
 * 更新固件状态
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateFirmwareStatus(deviceId) {
  return post('/iot/firmware/updateStatus', { deviceId })
}

/**
 * 检查固件版本
 * @param {Object} firmwareCheckRequestDTO - 固件检查请求数据
 * @returns {Promise<Object>} 返回检查结果
 */
export function checkFirmware(firmwareCheckRequestDTO) {
  return post('/iot/firmware/checkVersion', firmwareCheckRequestDTO)
}

/**
 * 验证设备凭证
 * @param {Object} deviceCredentialVerifyDTO - 设备凭证验证数据
 * @returns {Promise<Object>} 返回验证结果
 */
export function verifyCredential(deviceCredentialVerifyDTO) {
  return post('/iot/auth/verify', deviceCredentialVerifyDTO)
}

/**
 * 获取设备状态
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回设备状态
 */
export function getDeviceStatus(deviceId) {
  return get('/iot/status', { deviceId })
}

/**
 * 获取设备认证信息
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回认证信息
 */
export function getDeviceAuth(deviceId) {
  return get('/iot/auth', { deviceId })
}

/**
 * 获取固件信息
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回固件信息
 */
export function getFirmwareInfo(deviceId) {
  return get(`/iot/firmware/info/${deviceId}`)
}

/**
 * 下载固件
 * @param {string} deviceId - 设备 ID
 * @param {string} version - 固件版本
 * @returns {Promise<Object>} 返回下载链接
 */
export function downloadFirmware(deviceId, version) {
  return post(`/iot/firmware/download/${deviceId}`, { version })
}

/**
 * 安装固件
 * @param {string} deviceId - 设备 ID
 * @param {string} firmwareId - 固件 ID
 * @returns {Promise<Object>} 返回安装结果
 */
export function installFirmware(deviceId, firmwareId) {
  return post(`/iot/firmware/install/${deviceId}`, { firmwareId })
}

/**
 * 获取固件历史记录
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回历史记录
 */
export function getFirmwareHistory(deviceId) {
  return get(`/iot/firmware/history/${deviceId}`)
}

/**
 * 回滚固件
 * @param {string} deviceId - 设备 ID
 * @param {string} targetVersion - 目标版本
 * @returns {Promise<Object>} 返回回滚结果
 */
export function rollbackFirmware(deviceId, targetVersion) {
  return post(`/iot/firmware/rollback/${deviceId}`, { targetVersion })
}

/**
 * 验证固件
 * @param {string} deviceId - 设备 ID
 * @param {Object} firmwareData - 固件数据
 * @returns {Promise<Object>} 返回验证结果
 */
export function validateFirmware(deviceId, firmwareData) {
  return post(`/iot/firmware/validate/${deviceId}`, firmwareData)
}
