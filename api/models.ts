import { post, get, put, del, postWithQuery } from './request'

/**
 * 添加模型
 * @param {Object} modelData - 模型数据
 * @returns {Promise<Object>} 返回添加结果
 */
export function addModel(modelData) {
  return post('/models/add', {
    name: modelData.name || '',
    category: modelData.category || '',
    previewUrl: modelData.previewUrl || '',
    downloadUrl: modelData.downloadUrl || '',
    description: modelData.description || '',
    userId: modelData.userId || '',
    editableStatus: modelData.editableStatus || '1'
  })
}

/**
 * 获取模型列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回模型列表
 */
export function getModelList(params = {}) {
  return get('/models/list', params)
}

/**
 * 获取模型详情
 * @param {string} modelId - 模型 ID
 * @returns {Promise<Object>} 返回模型详情
 */
export function getModelDetail(modelId) {
  return get(`/models/${modelId}`)
}

/**
 * 更新模型
 * @param {string} modelId - 模型 ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateModel(modelId, updateData) {
  return put(`/models/update/${modelId}`, updateData)
}

/**
 * 删除模型
 * @param {string} modelId - 模型 ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteModel(modelId) {
  return del(`/models/${modelId}`)
}

export function likeModel(modelId) {
  return postWithQuery('/model-like/like', null, { modelId })
}

export function unlikeModel(modelId) {
  return postWithQuery('/model-like/unlike', null, { modelId })
}

/**
 * 获取模型分页列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回分页模型列表
 */
export function getModelPage(params = {}) {
  return get('/models/page', params)
}

/**
 * 获取我的模型列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回我的模型列表
 */
export function getMyModels(params = {}) {
  return get('/models/my', params)
}

/**
 * 处理模型数据，提取关键字段
 * @param {Object} modelData - 原始模型数据
 * @returns {Object} 返回处理后的模型数据
 */
export function processModelData(modelData) {
  if (!modelData) {
    return {
      downloadUrl: '',
      modelUrl: '',
      modelType: 'glb',
      thumb: '',
      dimensions: { x: 0, y: 0, z: 0 }
    }
  }

  let downloadUrl = ''

  if (modelData.modelFile) {
    downloadUrl = modelData.modelFile
  } else if (modelData.downloadUrl) {
    downloadUrl = modelData.downloadUrl
  } else if (modelData.modelUrl) {
    downloadUrl = modelData.modelUrl
  }

  const modelType = extractFileType(downloadUrl)

  let thumb = ''
  if (modelData.previewUrl) {
    thumb = modelData.previewUrl
  } else if (modelData.thumb) {
    thumb = modelData.thumb
  } else if (modelData.image) {
    thumb = modelData.image
  }

  const dimensions = modelData.dimensions ? {
    x: modelData.dimensions.x || modelData.dimensions.width || 0,
    y: modelData.dimensions.y || modelData.dimensions.height || 0,
    z: modelData.dimensions.z || modelData.dimensions.depth || 0
  } : { x: 0, y: 0, z: 0 }

  return {
    downloadUrl,
    modelUrl: downloadUrl,
    modelType,
    thumb,
    dimensions,
    name: modelData.name || ''
  }
}

/**
 * 从 URL 提取文件类型
 * @param {string} url - 文件 URL
 * @returns {string} 返回文件类型
 */
function extractFileType(url) {
  if (!url) return ''
  try {
    const urlWithoutQuery = url.split('?')[0]
    const ext = urlWithoutQuery.split('.').pop().toLowerCase()
    const typeMap = {
      'glb': 'glb',
      'gltf': 'gltf',
      'obj': 'obj',
      'stl': 'stl'
    }
    return typeMap[ext] || ''
  } catch (e) {
    return ''
  }
}

