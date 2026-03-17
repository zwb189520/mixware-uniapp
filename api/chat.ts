import { postWithQuery, get } from './request'
import { streamRequest } from '../utils/streamRequest.ts'

/**
 * 流式聊天请求
 * @param {string} question - 用户提问
 * @param {string} sessionId - 会话 ID
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onMessage - 消息回调
 * @param {Function} callbacks.onError - 错误回调
 * @param {Function} callbacks.onComplete - 完成回调
 * @returns {Object} 返回可中止的请求对象
 */
export function chatStream(question, sessionId, callbacks) {
  const { onMessage, onError, onComplete } = callbacks || {}

  return streamRequest({
    url: '/chat',
    method: 'POST',
    data: { question, sessionId },
    onMessage,
    onError,
    onComplete
  })
}

/**
 * 停止聊天
 * @param {string} sessionId - 会话 ID
 * @returns {Promise<Object>} 返回停止结果
 */
export function stopChat(sessionId) {
  return postWithQuery('/chat/stop', {}, { sessionId })
}

/**
 * 获取聊天历史记录
 * @param {string} conversationId - 对话 ID
 * @param {number} [current=1] - 当前页码
 * @param {number} [size=20] - 每页数量
 * @returns {Promise<Object>} 返回历史记录列表
 */
export function getChatHistory(conversationId, current = 1, size = 20) {
  return get(`/chat/history/${conversationId}`, { current, size })
}
