import { post } from './request'
import type { ApiResponse, Text2ImgTask } from '@/types/api'

export function syncTextToImg(prompt: string): Promise<ApiResponse<string>> {
  return post<string>('/text2img/sync', { prompt })
}

export function asyncTextToImg(prompt: string): Promise<ApiResponse<Text2ImgTask>> {
  return post<Text2ImgTask>('/text2img/async', { prompt })
}

export function queryTextToImgTask(taskId: string): Promise<ApiResponse<Text2ImgTask>> {
  return post<Text2ImgTask>('/text2img/query', { taskId })
}
