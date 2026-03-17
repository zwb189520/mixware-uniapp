// @ts-nocheck
import { post, get, uploadFile, postWithQuery } from './request'
import { API } from '../constants/index.ts'

/**
 * 文本转 3D 模型
 * @param {string} prompt - 模型描述文本
 * @returns {Promise<Object>} 返回任务 ID
 */
export function textToModel(prompt) {
  return postWithQuery('/hunyuan3d/text-to-model', {}, { prompt })
}

/**
 * 获取任务状态
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object>} 返回任务状态
 */
export function getTaskStatus(taskId) {
  return get(`/hunyuan3d/query/${taskId}`)
}

/**
 * 图片转 3D 模型
 * @param {string} image - 图片文件路径
 * @param {string} prompt - 模型描述文本
 * @returns {Promise<Object>} 返回模型生成结果
 */
export async function imageToModel(image, _prompt) {
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

