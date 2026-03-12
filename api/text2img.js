import { post } from './request'

/**
 * 同步文本转图片
 * @param {string} prompt - 图片描述文本
 * @returns {Promise<Object>} 返回生成的图片
 */
export function syncTextToImg(prompt) {
  return post('/text2img/sync', { prompt })
}

/**
 * 异步文本转图片
 * @param {string} prompt - 图片描述文本
 * @returns {Promise<Object>} 返回任务 ID
 */
export function asyncTextToImg(prompt) {
  return post('/text2img/async', { prompt })
}

/**
 * 查询文本转图片任务状态
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object>} 返回任务状态和结果
 */
export function queryTextToImgTask(taskId) {
  return post('/text2img/query', { taskId })
}
