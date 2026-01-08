import { BASE_URL } from './config'

export function imageToModel(imageFile, prompt = '') {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.uploadFile({
      url: `${BASE_URL}/hunyuan3d/image-to-model`,
      filePath: imageFile,
      name: 'image',
      formData: {
        prompt: prompt
      },
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 1) {
              resolve(data)
            } else {
              reject(new Error(data.msg || '生成3D模型失败'))
            }
          } catch (e) {
            reject(new Error('解析响应数据失败'))
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

export function textToModel(prompt) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/hunyuan3d/text-to-model`,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: `prompt=${encodeURIComponent(prompt)}`,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '生成3D模型失败'))
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
