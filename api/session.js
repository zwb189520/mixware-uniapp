import { post, put, get } from './request'

/**
 * 获取热门示例
 * @param {number} [n=20] - 获取数量
 * @returns {Promise<Object>} 返回热门示例列表
 */
export function getHotExamples(n = 20) {
  return get('/session/hot', { n })
}

/**
 * 设置当前会话
 * @param {string} sessionId - 会话 ID
 * @returns {Promise<Object>} 返回设置结果
 */
export function setCurrentSession(sessionId) {
  return put(`/session/${sessionId}/current`, {})
}

/**
 * 获取会话列表
 * @param {number} [current=1] - 当前页码
 * @param {number} [size=20] - 每页数量
 * @returns {Promise<Object>} 返回会话列表
 */
export function getSessionList(current = 1, size = 20) {
  return get('/session/history', { current, size })
}

/**
 * 创建新会话
 * @returns {Promise<Object>} 返回新会话信息
 */
export function createSession() {
  return post('/session', {})
}

/**
 * 获取会话详情
 * @param {string} sessionId - 会话 ID
 * @returns {Promise<Object>} 返回会话详情
 */
export function getSessionDetail(sessionId) {
  return get(`/session/${sessionId}`)
}

/**
 * 获取会话消息
 * @param {string} sessionId - 会话 ID
 * @returns {Promise<Object>} 返回消息列表
 */
export function getSessionMessages(sessionId) {
  return get(`/session/${sessionId}/messages`)
}
