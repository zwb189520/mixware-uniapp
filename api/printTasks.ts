import { request } from './request'

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

export function getPrintTasks(params: PrintTaskQuery) {
  return request({
    url: '/api/print-tasks/list',
    method: 'GET',
    data: params
  })
}

export function getPrintTaskDetail(taskId: string) {
  return request({
    url: `/api/print-tasks/${taskId}`,
    method: 'GET'
  })
}

export function createPrintTask(data: {
  modelId?: number
  sourceModelUrl?: string
  previewUrl?: string
  scaledModelUrl?: string
  sliceGcodeUrl?: string
  deviceId?: number
}) {
  return request({
    url: '/api/print-tasks',
    method: 'POST',
    data
  })
}

export function updatePrintTask(data: PrintTask) {
  return request({
    url: '/api/print-tasks',
    method: 'PUT',
    data
  })
}

export function deletePrintTask(taskId: string) {
  return request({
    url: `/api/print-tasks/${taskId}`,
    method: 'DELETE'
  })
}
