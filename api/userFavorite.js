import { BASE_URL } from './config'

export function addFavorite(modelId, groupId = null) {
  return new Promise((resolve, reject) => {
    let queryString = `modelId=${encodeURIComponent(modelId)}`
    if (groupId) queryString += `&groupId=${encodeURIComponent(groupId)}`
    
    const token = uni.getStorageSync('token') || ''

    uni.request({
      url: `${BASE_URL}/user-model-favorite/add?${queryString}`,
      method: 'PUT',
      timeout: 10000,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data ? res.data.msg : '收藏失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        if (err.errMsg.includes('timeout')) {
          reject(new Error('网络请求超时，请检查网络连接'))
        } else if (err.errMsg.includes('network')) {
          reject(new Error('网络连接失败，请检查网络设置'))
        } else {
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      }
    })
  })
}

export function cancelFavorite(modelId) {
  return new Promise((resolve, reject) => {
    const queryString = `modelId=${encodeURIComponent(modelId)}`
    
    const token = uni.getStorageSync('token') || ''

    uni.request({
      url: `${BASE_URL}/user-model-favorite/cancel?${queryString}`,
      method: 'DELETE',
      timeout: 10000,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data ? res.data.msg : '取消收藏失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        if (err.errMsg.includes('timeout')) {
          reject(new Error('网络请求超时，请检查网络连接'))
        } else if (err.errMsg.includes('network')) {
          reject(new Error('网络连接失败，请检查网络设置'))
        } else {
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      }
    })
  })
}