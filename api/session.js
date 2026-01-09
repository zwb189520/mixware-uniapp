import { BASE_URL } from './config'

export function getHotExamples(n = 20) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/session/hot?n=${n}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取热门搜索失败'))
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

export default {
  getHotExamples
}
