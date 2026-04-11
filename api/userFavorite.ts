import { get, putWithQuery, delWithQuery } from './request'

export function addFavorite(modelId: string | number): Promise<unknown> {
  return putWithQuery('/user-model-favorite/add', null, { modelId })
}

export function cancelFavorite(modelId: string | number): Promise<unknown> {
  return delWithQuery('/user-model-favorite/cancel', null, { modelId })
}

export function getFavoriteModels(): Promise<unknown> {
  return get('/user-model-favorite/list')
}

export function getFavoriteGroups(): Promise<unknown> {
  return get('/favorite-groups/list')
}
