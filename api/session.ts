import { post, put, get } from './request'
import type { ApiResponse, Session, SessionMessage, HotExample, PaginatedData } from '@/types/api'

export function getHotExamples(n = 20): Promise<ApiResponse<HotExample[]>> {
  return post<HotExample[]>('/session/hot', { n })
}

export function setCurrentSession(sessionId: string): Promise<ApiResponse<Session>> {
  return put<Session>(`/session/${sessionId}/current`, {})
}

export function getSessionList(current = 1, size = 20): Promise<ApiResponse<PaginatedData<Session>>> {
  return get<PaginatedData<Session>>('/session/history', { current, size })
}

export function createSession(): Promise<ApiResponse<Session>> {
  return post<Session>('/session', {})
}

export function getSessionDetail(sessionId: string): Promise<ApiResponse<Session>> {
  return get<Session>(`/session/${sessionId}`)
}

export function getSessionMessages(sessionId: string): Promise<ApiResponse<SessionMessage[]>> {
  return get<SessionMessage[]>(`/session/${sessionId}/messages`)
}
