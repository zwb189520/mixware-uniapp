import { BASE_URL } from './config.js'

export function getModelRecords(current = 1, size = 10) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/operation-records/model`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        current,
        size
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取模型记录失败'))
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

export function getPrintRecords(current = 1, size = 10) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/operation-records/print`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        current,
        size
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取打印记录失败'))
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
