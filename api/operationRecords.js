import { get } from './request'

/**
 * 获取模型操作记录
 * @param {number} [current=1] - 当前页码
 * @param {number} [size=10] - 每页数量
 * @returns {Promise<Object>} 返回操作记录列表
 */
export function getModelRecords(current = 1, size = 10) {
  return get('/operation-records/model', { current, size })
}

/**
 * 获取打印操作记录
 * @param {number} [current=1] - 当前页码
 * @param {number} [size=10] - 每页数量
 * @returns {Promise<Object>} 返回打印记录列表
 */
export function getPrintRecords(current = 1, size = 10) {
  return get('/operation-records/print', { current, size })
}
