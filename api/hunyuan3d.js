import { post, get, uploadFile } from './request'

export function generateModel(prompt) {
  return post('/hunyuan3d/generate', { prompt })
}

export function getTaskStatus(taskId) {
  return get(`/hunyuan3d/task/${taskId}`)
}

export function downloadModel(taskId) {
  return get(`/hunyuan3d/download/${taskId}`)
}

export async function imageToModel(image, prompt) {
  console.log('开始上传图片:', image)
  const token = uni.getStorageSync('token') || ''
  const uploadRes = await uploadFile('/upload/image', image, {
    header: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  })
  console.log('图片上传响应:', uploadRes)
  if (uploadRes.code === 1 && uploadRes.data) {
    let imageUrl = uploadRes.data.url || uploadRes.data.fileUrl
    if (!imageUrl && uploadRes.data.originalFileName) {
      imageUrl = `http://app.mixwarebot.cn:9000/image/${uploadRes.data.originalFileName}`
    }
    console.log('准备发送模型生成请求，imageUrl:', imageUrl)
    if (imageUrl) {
      const modelRes = await post('/hunyuan3d/image-to-model', { 
        imageUrl: imageUrl,
        prompt: prompt 
      })
      console.log('模型生成响应:', modelRes)
      return modelRes
    }
  }
  throw new Error('图片上传失败')
}
