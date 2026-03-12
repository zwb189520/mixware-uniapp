import { put, del, get } from './request'

/**
 * 添加收藏
 * @param {string} modelId - 模型 ID
 * @returns {Promise<Object>} 返回添加结果
 */
export function addFavorite(modelId) {
  return put('/user-model-favorite/add', { modelId })
}

/**
 * 取消收藏
 * @param {string} modelId - 模型 ID
 * @returns {Promise<Object>} 返回取消结果
 */
export function cancelFavorite(modelId) {
  return del('/user-model-favorite/cancel', { modelId })
}

/**
 * 获取收藏模型列表
 * @returns {Promise<Object>} 返回收藏列表
 */
export function getFavoriteModels() {
  return get('/user-model-favorite/list')
}

/**
 * 获取收藏分组列表
 * @returns {Promise<Object>} 返回分组列表
 */
export function getFavoriteGroups() {
  return get('/favorite-groups/list')
}

