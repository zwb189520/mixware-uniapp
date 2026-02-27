import { post, put, get } from './request'

export function getHotExamples(n = 20) {
  return post(`/session/hot?n=${n}`, {})
}

export function setCurrentSession(sessionId) {
  return put(`/session/${sessionId}/current`, {})
}

export function getSessionList(current = 1, size = 20) {
  return get(`/session/history?current=${current}&size=${size}`)
}

export function createSession() {
  return post('/session', {})
}

export function getSessionDetail(sessionId) {
  return get(`/session/${sessionId}`)
}

export function getSessionMessages(sessionId) {
  return get(`/session/${sessionId}/messages`)
}

export default {
  getHotExamples,
  setCurrentSession,
  getSessionList,
  createSession,
  getSessionDetail,
  getSessionMessages
}
