import { put, del } from './request'

export function addFavorite(modelId, groupId = null) {
  let queryString = `modelId=${encodeURIComponent(modelId)}`
  if (groupId) queryString += `&groupId=${encodeURIComponent(groupId)}`
  
  return put(`/user-model-favorite/add?${queryString}`, {})
}

export function cancelFavorite(modelId) {
  const queryString = `modelId=${encodeURIComponent(modelId)}`
  return del(`/user-model-favorite/cancel?${queryString}`, {})
}
