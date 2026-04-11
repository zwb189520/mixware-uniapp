import { post, get, del, postWithQuery } from './request'

export function submitSliceTask(sliceTaskDTO: any): Promise<any> {
  return post('/curaengine/slice/submit', sliceTaskDTO)
}

export function getSliceStatus(taskId: string): Promise<any> {
  return get(`/curaengine/slice/status/${taskId}`)
}

export function cleanupSliceTask(taskId: string): Promise<any> {
  return postWithQuery('/curaengine/slice/cleanup', {}, { taskId })
}
