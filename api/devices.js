import { get, put, post, del } from './request'

/**
 * 获取设备列表
 * @returns {Promise<Object>} 返回设备列表
 */
export function getDeviceList() {
  const userId = uni.getStorageSync('userId')
  if (!userId) return Promise.reject(new Error('未登录'))
  return getUserDevices(userId).then(res => {
    return {
      ...res,
      data: {
        records: res.data || []
      }
    }
  })
}

/**
 * 更新设备信息
 * @param {Object} deviceUpdateDTO - 设备更新数据
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateDeviceInfo(deviceUpdateDTO) {
  return put('/devices/update', deviceUpdateDTO)
}

/**
 * 更新设备状态
 * @param {string} deviceId - 设备 ID
 * @param {string} deviceStatus - 设备状态
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateDeviceStatus(deviceId, deviceStatus) {
  return put(`/devices/status/${deviceId}`, { deviceStatus })
}

/**
 * 获取设备状态
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回设备状态
 */
export function getDeviceStatus(deviceId) {
  return get(`/devices/status/${deviceId}`)
}

/**
 * 解析 SN 码
 * @param {string} snCode - SN 码
 * @returns {Promise<Object>} 返回解析结果
 */
export function parseSnCode(snCode) {
  return post('/devices/parseSnCode', { snCode })
}

/**
 * 设置默认设备
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回设置结果
 */
export function setDefaultDevice(deviceId) {
  return post(`/devices/default/${deviceId}`, {})
}

/**
 * 创建设备
 * @param {Object} deviceCreateDTO - 设备创建数据
 * @returns {Promise<Object>} 返回创建结果
 */
export function createDevice(deviceCreateDTO) {
  return post('/devices/create', deviceCreateDTO)
}

/**
 * 绑定设备
 * @param {Object} bindRequest - 绑定请求数据
 * @param {Object} [options={}] - 请求选项
 * @returns {Promise<Object>} 返回绑定结果
 */
export function bindDevice(bindRequest, options = {}) {
  return post('/devices/bind', bindRequest, { ...options, timeout: 120000 })
}

/**
 * 获取设备分页列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 返回分页设备列表
 */
export function getDevicesPage(params) {
  const userId = uni.getStorageSync('userId')
  return get('/devices/page', { ...params, userId: params.userId || userId })
}

/**
 * 获取设备信息
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回设备信息
 */
export function getDeviceInfo(deviceId) {
  return get(`/devices/info/${deviceId}`)
}

/**
 * 获取用户设备列表
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回用户设备列表
 */
export function getUserDevices(userId) {
  return get(`/devices/getUserDevice/${userId}`)
}

/**
 * 获取默认设备
 * @returns {Promise<Object>} 返回默认设备信息
 */
export function getDefaultDevice() {
  return get('/devices/default')
}

/**
 * 删除设备
 * @param {string} deviceId - 设备 ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteDevice(deviceId) {
  return del(`/devices/delete/${deviceId}`)
}

/**
 * 批量删除设备
 * @param {Array} deviceIds - 设备 ID 数组
 * @returns {Promise<Object>} 返回删除结果
 */
export function batchDeleteDevices(deviceIds) {
  return del('/devices/batch', deviceIds)
}
