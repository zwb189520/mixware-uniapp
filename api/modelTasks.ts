import { request } from './request'

export interface ModelTask {
  taskId: string
  jobId?: string
  sourceModelUrl: string
  previewUrl: string
  scaleFactor: number
  status: string
  errorMsg: string
  createdAt: string
  modelType?: string
}

export interface ModelTaskQuery {
  current?: number
  size?: number
  userId?: number
}

export function getModelTasks(params: ModelTaskQuery) {
  return request({
    url: '/model-generate-tasks/list',
    method: 'GET',
    data: params
  })
}

export function getModelTaskDetail(taskId: string) {
  return request({
    url: `/model-generate-tasks/${taskId}`,
    method: 'GET'
  })
}

export function createModelTask(data: {
  sourceModelUrl?: string
  previewUrl?: string
  scaleFactor?: number
}) {
  return request({
    url: '/model-generate-tasks',
    method: 'POST',
    data
  })
}

export function updateModelTask(data: ModelTask) {
  return request({
    url: '/model-generate-tasks',
    method: 'PUT',
    data
  })
}

export function deleteModelTask(taskId: string) {
  return request({
    url: `/model-generate-tasks/${taskId}`,
    method: 'DELETE'
  })
}
