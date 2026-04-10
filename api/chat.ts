import { postWithQuery, get } from './request'
import { streamRequest } from '../utils/streamRequest.ts'

interface ChatCallbacks {
  onMessage?: (msg: string) => void
  onError?: (err: unknown) => void
  onComplete?: () => void
}

/**
 * 流式聊天请求
 * @param question - 用户提问
 * @param sessionId - 会话 ID
 * @param callbacks - 回调函数对象
 */
export function chatStream(
  question: string,
  sessionId: string,
  callbacks?: ChatCallbacks
): { abort: () => void } {
  const { onMessage, onError, onComplete } = callbacks || {}

  const result = streamRequest({
    url: '/chat',
    method: 'POST',
    data: { question, sessionId },
    onMessage,
    onError,
    onComplete
  }) as { abort: () => void }

  return result
}

/**
 * 停止聊天
 * @param sessionId - 会话 ID
 */
export function stopChat(sessionId: string): Promise<unknown> {
  return postWithQuery('/chat/stop', {}, { sessionId })
}

/**
 * 获取聊天历史记录
 * @param conversationId - 对话 ID
 * @param current - 当前页码
 * @param size - 每页数量
 */
export function getChatHistory(conversationId: string, current = 1, size = 20): Promise<unknown> {
  return get(`/chat/history/${conversationId}`, { current, size })
}
