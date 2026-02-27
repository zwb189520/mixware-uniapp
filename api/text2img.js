import { post } from './request'

export function syncTextToImg(prompt) {
  return post('/text2img/sync', { prompt })
}

export function asyncTextToImg(prompt) {
  return post('/text2img/async', { prompt })
}

export function queryTextToImgTask(taskId) {
  return post('/text2img/query', { taskId })
}

export default {
  syncTextToImg,
  asyncTextToImg,
  queryTextToImgTask
}