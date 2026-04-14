import { get, putWithQuery, delWithQuery } from './request'
import type { ApiResponse, Model, PaginatedData, RequestData } from '@/types/api'

export function addFavorite(modelId: string | number): Promise<ApiResponse<null>> {
  return putWithQuery<null>('/user-model-favorite/add', {} as RequestData, { modelId })
}

export function cancelFavorite(modelId: string | number): Promise<ApiResponse<null>> {
  return delWithQuery<null>('/user-model-favorite/cancel', {} as RequestData, { modelId })
}

export function getFavoriteModels(): Promise<ApiResponse<Model[]>> {
  return get<Model[]>('/user-model-favorite/list')
}

export function getFavoriteGroups(): Promise<ApiResponse<{ id: string; name: string }[]>> {
  return get<{ id: string; name: string }[]>('/favorite-groups/list')
}
