import { request } from './request'
import type { ApiResponse, PaginatedData } from '@/types/api'

export interface ModelTask {
  taskId: string
  jobId?: string
  sourceModelUrl: string
  previewUrl: string
  scaleFactor: number
  status?: string
  errorMsg?: string
  createdAt?: string
  modelType?: string
}

export interface ModelTaskQuery {
  current?: number
  size?: number
  userId?: number
}

export function getModelTasks(params: ModelTaskQuery): Promise<ApiResponse<PaginatedData<ModelTask>>> {
  return request<PaginatedData<ModelTask>>({
    url: '/model-generate-tasks/list',
    method: 'GET',
    data: params
  })
}

export function getModelTaskDetail(taskId: string): Promise<ApiResponse<ModelTask>> {
  return request<ModelTask>({
    url: `/model-generate-tasks/${taskId}`,
    method: 'GET'
  })
}

export function createModelTask(data: {
  sourceModelUrl?: string
  previewUrl?: string
  scaleFactor?: number
}): Promise<ApiResponse<ModelTask>> {
  return request<ModelTask>({
    url: '/model-generate-tasks',
    method: 'POST',
    data
  })
}

export function updateModelTask(data: ModelTask): Promise<ApiResponse<ModelTask>> {
  return request<ModelTask>({
    url: '/model-generate-tasks',
    method: 'PUT',
    data
  })
}

export function deleteModelTask(taskId: string): Promise<ApiResponse<null>> {
  return request<null>({
    url: `/model-generate-tasks/${taskId}`,
    method: 'DELETE'
  })
}
