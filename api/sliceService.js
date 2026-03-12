import { post, get, del, postWithQuery } from './request'

/**
 * 提交切片任务
 * @param {Object} sliceTaskDTO - 切片任务数据
 * @returns {Promise<Object>} 返回任务 ID
 */
export function submitSliceTask(sliceTaskDTO) {
  return post('/curaengine/slice/submit', sliceTaskDTO)
}

/**
 * 获取切片状态
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object>} 返回切片状态
 */
export function getSliceStatus(taskId) {
  return get(`/curaengine/slice/status/${taskId}`)
}

/**
 * 清理切片任务
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object>} 返回清理结果
 */
export function cleanupSliceTask(taskId) {
  return postWithQuery('/curaengine/slice/cleanup', {}, { taskId })
}

