import { post, get, uploadFile, postWithQuery } from './request'
import { API } from '../constants/index.ts'
import { getToken } from './utils.ts'
import type { ApiResponse } from '@/types/api'

interface HunyuanTask {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  modelUrl?: string
  previewUrl?: string
  progress?: number
  error?: string
}

export function textToModel(prompt: string): Promise<ApiResponse<HunyuanTask>> {
  return postWithQuery<HunyuanTask>('/hunyuan3d/text-to-model', {}, { prompt })
}

export function getTaskStatus(taskId: string): Promise<ApiResponse<HunyuanTask>> {
  return get<HunyuanTask>(`/hunyuan3d/query/${taskId}`)
}

export function cancelTask(taskId: string): Promise<ApiResponse<null>> {
  return post<null>(`/hunyuan3d/cancel/${taskId}`)
}

export async function imageToModel(image: string, _prompt?: string): Promise<ApiResponse<HunyuanTask>> {
  console.log('开始上传图片:', image)
  const token = getToken(true)
  const uploadRes = await uploadFile<{ url?: string; fileUrl?: string; originalFileName?: string }>('/upload/image', image, {
    header: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  })
  console.log('图片上传响应:', uploadRes)
  if (uploadRes.code === 1 && uploadRes.data) {
    let imageUrl = uploadRes.data.url || uploadRes.data.fileUrl
    if (!imageUrl && uploadRes.data.originalFileName) {
      imageUrl = `${API.UPLOAD_IMAGE_URL}/${uploadRes.data.originalFileName}`
    }
    console.log('准备发送模型生成请求，imageUrl:', imageUrl)
    if (imageUrl) {
      const modelRes = await post<HunyuanTask>('/hunyuan3d/image-to-model', {
        imageUrl: imageUrl
      })
      console.log('模型生成响应:', modelRes)
      return modelRes
    }
  }
  throw new Error('图片上传失败')
}
