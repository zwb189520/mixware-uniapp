import { BASE_URL } from './config'

export function sendStopCommand(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/sendStopCommand/${deviceId}`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '发送停止命令失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function sendPrintCommand(deviceId, modelId, action) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/sendPrintCommand`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: {
        deviceId: deviceId,
        modelId: modelId,
        action: action
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '发送打印命令失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function updateFirmwareStatus(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/firmware/updateStatus`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        deviceId: deviceId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '更新固件状态失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function checkFirmware(firmwareCheckRequestDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/firmware/checkVersion`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: firmwareCheckRequestDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '检查固件版本失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function verifyCredential(deviceCredentialVerifyDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/auth/verify`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: deviceCredentialVerifyDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '验证设备凭证失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function getDeviceStatus(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/getStatus`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        deviceId: deviceId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取设备状态失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function getDeviceAuth(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/iot/auth`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        deviceId: deviceId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取设备授权信息失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}