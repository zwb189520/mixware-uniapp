import { BASE_URL } from './config'

export function imageToModel(imageFile, prompt = '') {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    console.log('imageToModel 开始, imageFile:', imageFile)
    
    const uploadImageToServer = (file) => {
      return new Promise((uploadResolve, uploadReject) => {
        const formData = new FormData()
        formData.append('file', file, 'image.jpg')
        
        console.log('上传图片到服务器, URL:', `${BASE_URL}/api/upload/image`)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${BASE_URL}/api/upload/image`)
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '')
        xhr.onload = () => {
          console.log('上传图片完成, 状态:', xhr.status, '响应:', xhr.responseText)
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              console.log('上传图片解析后的数据:', data)
              if (data.code === 0 || data.code === 1) {
                uploadResolve(data.data)
              } else {
                uploadReject(new Error(data.msg || '上传图片失败'))
              }
            } catch (e) {
              console.error('解析上传响应失败:', e)
              uploadReject(new Error('解析响应数据失败'))
            }
          } else {
            uploadReject(new Error(`上传失败: ${xhr.status}`))
          }
        }
        xhr.onerror = (err) => {
          console.error('上传图片错误:', err)
          uploadReject(new Error('网络请求失败'))
        }
        xhr.send(formData)
      })
    }
    
    if (imageFile.startsWith('blob:')) {
      console.log('检测到 blob URL')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        console.log('Image 加载成功, 尺寸:', img.width, img.height)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          console.log('Canvas 转 Blob 成功, 大小:', blob.size, '类型:', blob.type)
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
          
          uploadImageToServer(file).then(uploadData => {
            console.log('图片上传成功, 服务器返回:', uploadData)
            const imageUrl = uploadData.fileUrl
            if (!imageUrl) {
              reject(new Error('上传图片后未返回文件URL'))
              return
            }
            
            const params = {
              image: imageUrl
            }
            if (prompt) {
              params.prompt = prompt
            }
            
            console.log('准备发送3D模型生成请求, 图片URL:', imageUrl)
            uni.request({
              url: `${BASE_URL}/api/hunyuan3d/image-to-model`,
              method: 'POST',
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': token ? `Bearer ${token}` : ''
              },
              data: params,
              success: (res) => {
                console.log('3D模型生成请求完成, 状态:', res.statusCode, '响应:', res.data)
                if (res.statusCode === 200) {
                  const data = res.data
                  console.log('解析后的数据:', data)
                  if (data.code === 0 || data.code === 1) {
                    const taskId = data.data?.taskId || data.data?.JobId
                    console.log('提取的 taskId:', taskId)
                    if (taskId) {
                      resolve({ ...data, data: { ...data.data, taskId } })
                    } else {
                      console.error('未返回任务ID, 完整响应:', JSON.stringify(data))
                      reject(new Error('未返回任务ID'))
                    }
                  } else {
                    reject(new Error(data.msg || '生成3D模型失败'))
                  }
                } else {
                  reject(new Error(`请求失败: ${res.statusCode}`))
                }
              },
              fail: (err) => {
                console.error('3D模型生成请求错误:', err)
                reject(new Error('网络请求失败'))
              }
            })
          }).catch(err => {
            reject(err)
          })
        }, 'image/jpeg')
      }
      img.onerror = (err) => {
        console.error('Image 加载失败:', err)
        reject(new Error('加载图片失败'))
      }
      img.src = imageFile
    } else {
      console.log('使用 uni.uploadFile 上传')
      uni.uploadFile({
        url: `${BASE_URL}/api/upload/image`,
        filePath: imageFile,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (uploadRes) => {
          console.log('uni.uploadFile 成功:', uploadRes)
          if (uploadRes.statusCode === 200) {
            try {
              const uploadData = JSON.parse(uploadRes.data)
              console.log('上传图片解析后的数据:', uploadData)
              if (uploadData.code === 0 || uploadData.code === 1) {
                const imageUrl = uploadData.data.fileUrl
                if (!imageUrl) {
                  reject(new Error('上传图片后未返回文件URL'))
                  return
                }
                
                const params = {
                  image: imageUrl
                }
                if (prompt) {
                  params.prompt = prompt
                }
                
                uni.request({
                  url: `${BASE_URL}/api/hunyuan3d/image-to-model`,
                  method: 'POST',
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': token ? `Bearer ${token}` : ''
                  },
                  data: params,
                  success: (res) => {
                    console.log('3D模型生成请求完成, 状态:', res.statusCode, '响应:', res.data)
                    if (res.statusCode === 200) {
                      const data = res.data
                      console.log('解析后的数据:', data)
                      if (data.code === 0 || data.code === 1) {
                        const taskId = data.data?.taskId || data.data?.JobId
                        console.log('提取的 taskId:', taskId)
                        if (taskId) {
                          resolve({ ...data, data: { ...data.data, taskId } })
                        } else {
                          console.error('未返回任务ID, 完整响应:', JSON.stringify(data))
                          reject(new Error('未返回任务ID'))
                        }
                      } else {
                        reject(new Error(data.msg || '生成3D模型失败'))
                      }
                    } else {
                      reject(new Error(`请求失败: ${res.statusCode}`))
                    }
                  },
                  fail: (err) => {
                    console.error('3D模型生成请求错误:', err)
                    reject(new Error('网络请求失败'))
                  }
                })
              } else {
                reject(new Error(uploadData.msg || '上传图片失败'))
              }
            } catch (e) {
              console.error('解析上传响应失败:', e)
              reject(new Error('解析响应数据失败'))
            }
          } else {
            reject(new Error(`上传失败: ${uploadRes.statusCode}`))
          }
        },
        fail: (err) => {
          console.error('uni.uploadFile 失败:', err)
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      })
    }
  })
}

export function textToModel(prompt) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/hunyuan3d/text-to-model`,
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

export function queryHunyuan3D(taskId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/hunyuan3d/query/${taskId}`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '查询3D模型生成任务状态失败'))
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
