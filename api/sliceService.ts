import { post, get, postWithQuery } from './request'
import type { ApiResponse, SliceTaskDTO, SliceTask, RequestData } from '@/types/api'

export function submitSliceTask(sliceTaskDTO: SliceTaskDTO): Promise<ApiResponse<SliceTask>> {
  return post<SliceTask>('/curaengine/slice/submit', sliceTaskDTO as unknown as RequestData)
}

export function getSliceStatus(taskId: string): Promise<ApiResponse<SliceTask>> {
  return get<SliceTask>(`/curaengine/slice/status/${taskId}`)
}

export function cleanupSliceTask(taskId: string): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/curaengine/slice/cleanup', {}, { taskId })
}
