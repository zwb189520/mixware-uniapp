import { post, put, get } from './request'

export function getHotExamples(n = 20): Promise<any> {
  return post('/session/hot', { n })
}

export function setCurrentSession(sessionId: string): Promise<any> {
  return put(`/session/${sessionId}/current`, {})
}

export function getSessionList(current = 1, size = 20): Promise<any> {
  return get('/session/history', { current, size })
}

export function createSession(): Promise<any> {
  return post('/session', {})
}

export function getSessionDetail(sessionId: string): Promise<any> {
  return get(`/session/${sessionId}`)
}

export function getSessionMessages(sessionId: string): Promise<any> {
  return get(`/session/${sessionId}/messages`)
}
