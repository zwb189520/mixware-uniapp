import { post } from './request'

export function getHotExamples(n = 20) {
  return post(`/session/hot?n=${n}`, {})
}

export default {
  getHotExamples
}
