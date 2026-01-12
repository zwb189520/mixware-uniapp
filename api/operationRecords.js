import { get } from './request'

export function getModelRecords(current = 1, size = 10) {
  return get('/operation-records/model', { current, size })
}

export function getPrintRecords(current = 1, size = 10) {
  return get('/operation-records/print', { current, size })
}
