import { post, get } from './request'

export function sliceModel(slicingRequest) {
  return post('/curaengine/slice', slicingRequest)
}

export function getSliceStatus(taskId) {
  return get(`/curaengine/status/${taskId}`)
}

export function downloadGcode(taskId) {
  return get(`/curaengine/download/${taskId}`)
}
