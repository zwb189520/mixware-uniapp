import { postWithQuery, get } from './request'
import { streamRequest } from '../utils/streamRequest.ts'
import type { ApiResponse, ChatHistory, PaginatedData } from '@/types/api'

interface ChatCallbacks {
  onMessage?: (msg: string) => void
  onError?: (err: unknown) => void
  onComplete?: () => void
}

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

export function stopChat(sessionId: string): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/chat/stop', {}, { sessionId })
}

export function getChatHistory(conversationId: string, current = 1, size = 20): Promise<ApiResponse<PaginatedData<ChatHistory>>> {
  return get<PaginatedData<ChatHistory>>(`/chat/history/${conversationId}`, { current, size })
}
