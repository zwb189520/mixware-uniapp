import { BASE_URL } from './config'

export function getDeviceList() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/page`,
      method: 'GET',
      data: {
        current: 1,
        size: 100
      },
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('设备列表API响应:', res)
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            console.log('设备列表API错误:', res.data)
            reject(new Error(res.data.msg || '获取设备列表失败'))
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

export function updateDeviceInfo(deviceUpdateDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/update`,
      method: 'PUT',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: deviceUpdateDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '更新设备信息失败'))
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

export function updateDeviceStatus(deviceId, deviceStatus) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/status/${deviceId}`,
      method: 'PUT',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        deviceStatus: deviceStatus
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '更新设备状态失败'))
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

export function parseSnCode(snCode) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/parseSnCode`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: { snCode },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '解析SN码失败'))
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

export function setDefaultDevice(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    const userId = uni.getStorageSync('userId') || ''
    
    console.log('设置默认设备 - 设备ID:', deviceId)
    console.log('设置默认设备 - 用户ID:', userId)
    console.log('设置默认设备 - Token:', token ? '已设置' : '未设置')
    
    uni.request({
      url: `${BASE_URL}/api/devices/default/${deviceId}`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('设置默认设备API响应:', res)
        console.log('设置默认设备响应数据:', res.data)
        console.log('设置默认设备响应code:', res.data?.code)
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '设置默认设备失败'))
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

export function createDevice(deviceCreateDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/create`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: deviceCreateDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '创建设备失败'))
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

export function bindDevice(bindRequest) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/bind`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: bindRequest,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '绑定设备失败'))
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

export function getDevicesPage(params) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/page`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: params,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取设备列表失败'))
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

export function getDeviceInfo(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/info/${deviceId}`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取设备信息失败'))
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

export function getUserDevices(userId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/getUserDevice/${userId}`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取用户设备失败'))
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

export function getDefaultDevice() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/default`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        console.log('获取默认设备API响应:', res)
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            console.log('获取默认设备API错误:', res.data)
            reject(new Error(res.data.msg || '获取默认设备失败'))
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

export function deleteDevice(deviceId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/delete/${deviceId}`,
      method: 'DELETE',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '删除设备失败'))
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

export function batchDeleteDevices(deviceIds) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/devices/batch`,
      method: 'DELETE',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: deviceIds,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '批量删除设备失败'))
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