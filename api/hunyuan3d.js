import { post, get } from './request'

export function generateModel(prompt) {
  return post('/hunyuan3d/generate', { prompt })
}

export function getTaskStatus(taskId) {
  return get(`/hunyuan3d/task/${taskId}`)
}

export function downloadModel(taskId) {
  return get(`/hunyuan3d/download/${taskId}`)
}

export function imageToModel(image, prompt) {
  return post('/hunyuan3d/image-to-model', { image, prompt })
}
