import { post, get, uploadFile, postWithQuery } from './request'
import { API } from '../constants/index.ts'

export function textToModel(prompt: string): Promise<unknown> {
  return postWithQuery('/hunyuan3d/text-to-model', {}, { prompt })
}

export function getTaskStatus(taskId: string): Promise<unknown> {
  return get(`/hunyuan3d/query/${taskId}`)
}

export function cancelTask(taskId: string): Promise<unknown> {
  return post(`/hunyuan3d/cancel/${taskId}`)
}

export async function imageToModel(image: string, _prompt?: string): Promise<unknown> {
  console.log('开始上传图片:', image)
  const token = uni.getStorageSync('token') || ''
  const uploadRes = await uploadFile('/upload/image', image, {
    header: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  }) as { code?: number; data?: { url?: string; fileUrl?: string; originalFileName?: string } }
  console.log('图片上传响应:', uploadRes)
  if (uploadRes.code === 1 && uploadRes.data) {
    let imageUrl = uploadRes.data.url || uploadRes.data.fileUrl
    if (!imageUrl && uploadRes.data.originalFileName) {
      imageUrl = `${API.UPLOAD_IMAGE_URL}/${uploadRes.data.originalFileName}`
    }
    console.log('准备发送模型生成请求，imageUrl:', imageUrl)
    if (imageUrl) {
      const modelRes = await post('/hunyuan3d/image-to-model', {
        imageUrl: imageUrl
      })
      console.log('模型生成响应:', modelRes)
      return modelRes
    }
  }
  throw new Error('图片上传失败')
}
