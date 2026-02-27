import { put, del, get } from './request'

export function addFavorite(modelId) {
  const queryString = `modelId=${encodeURIComponent(modelId)}`
  console.log('添加收藏请求参数:', queryString)
  return put(`/user-model-favorite/add?${queryString}`, {})
}

export function cancelFavorite(modelId) {
  const queryString = `modelId=${encodeURIComponent(modelId)}`
  console.log('取消收藏请求参数:', queryString)
  return del(`/user-model-favorite/cancel?${queryString}`, {})
}

export function getFavoriteModels() {
  return get('/user-model-favorite/list')
}

export function getFavoriteGroups() {
  return get('/favorite-groups/list')
}
