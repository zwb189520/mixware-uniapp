import { post } from './request'

export function syncTextToImg(prompt: string): Promise<any> {
  return post('/text2img/sync', { prompt })
}

export function asyncTextToImg(prompt: string): Promise<any> {
  return post('/text2img/async', { prompt })
}

export function queryTextToImgTask(taskId: string): Promise<any> {
  return post('/text2img/query', { taskId })
}
