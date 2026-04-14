import { request } from './request'
import type { ApiResponse, PaginatedData, RequestData } from '@/types/api'

export interface PrintTask {
  taskId: string
  modelId: number
  sourceModelUrl: string
  previewUrl: string
  scaledModelUrl: string
  sliceGcodeUrl: string
  deviceId: number
  status: string
  errorMsg: string
  createdAt: string
}

export interface PrintTaskQuery {
  current?: number
  size?: number
  userId?: number
}

export function getPrintTasks(params: PrintTaskQuery): Promise<ApiResponse<PaginatedData<PrintTask>>> {
  return request({
    url: '/print-tasks/list',
    method: 'GET',
    data: params as unknown as RequestData
  })
}

export function getPrintTaskDetail(taskId: string) {
  return request({
    url: `/print-tasks/${taskId}`,
    method: 'GET'
  })
}

export function createPrintTask(data: {
  modelId?: number
  sourceModelUrl?: string
  previewUrl?: string
  scaledModelUrl?: string
  sliceGcodeUrl?: string
  deviceId?: string
}) {
  return request({
    url: '/print-tasks',
    method: 'POST',
    data: data as unknown as RequestData
  })
}

export function updatePrintTask(data: PrintTask) {
  return request({
    url: '/print-tasks',
    method: 'PUT',
    data: data as unknown as RequestData
  })
}

export function deletePrintTask(taskId: string) {
  return request({
    url: `/print-tasks/${taskId}`,
    method: 'DELETE'
  })
}
