import { put, del, get } from './request'

export function addFavorite(modelId, groupId = null) {
  let queryString = `modelId=${encodeURIComponent(modelId)}`
  if (groupId) queryString += `&groupId=${encodeURIComponent(groupId)}`
  
  console.log('添加收藏请求参数:', queryString)
  return put(`/user-model-favorite/add?${queryString}`, {})
}

export function cancelFavorite(modelId) {
  const queryString = `modelId=${encodeURIComponent(modelId)}`
  console.log('取消收藏请求参数:', queryString)
  return del(`/user-model-favorite/cancel?${queryString}`, {})
}

export function getFavoriteModels(groupId = null) {
  let queryString = ''
  if (groupId) queryString = `?groupId=${encodeURIComponent(groupId)}`
  return get(`/user-model-favorite/list${queryString}`)
}

export function getFavoriteGroups() {
  return get('/favorite-groups/list')
}
