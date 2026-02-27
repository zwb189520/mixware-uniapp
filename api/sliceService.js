import { post, get, del } from './request'

// 切片服务接口
export function submitSliceTask(sliceTaskDTO) {
  return post('/curaengine/slice/submit', sliceTaskDTO)
}

export function getSliceStatus(taskId) {
  return get(`/curaengine/slice/status/${taskId}`)
}

export function cleanupSliceTask(taskId) {
  return del(`/curaengine/slice/cleanup/${taskId}`)
}

export function getSliceResult(taskId) {
  return get(`/curaengine/slice/result/${taskId}`)
}

export function cancelSliceTask(taskId) {
  return post(`/curaengine/slice/cancel/${taskId}`, {})
}

export function getSliceConfig(taskId) {
  return get(`/curaengine/slice/config/${taskId}`)
}

export function updateSliceConfig(taskId, config) {
  return post(`/curaengine/slice/config/${taskId}`, config)
}

export function getSliceHistory(params) {
  return get('/curaengine/slice/history', params)
}

export function validateModel(modelData) {
  return post('/curaengine/model/validate', modelData)
}

export function getSlicePresets() {
  return get('/curaengine/slice/presets')
}

export function previewSlice(taskId) {
  return get(`/curaengine/slice/preview/${taskId}`)
}