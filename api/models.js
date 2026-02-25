import { post, get, put, del } from './request'

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

export function getModelList(params = {}) {
  let queryString = ''
  const keys = Object.keys(params)
  if (keys.length > 0) {
    queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
  }
  return get(`/models/list${queryString}`)
}

export function getModelDetail(modelId) {
  return get(`/models/${modelId}`)
}

export function updateModel(modelId, updateData) {
  return put(`/models/update/${modelId}`, updateData)
}

export function deleteModel(modelId) {
  return del(`/models/delete/${modelId}`)
}

export function getModelPage(params = {}) {
  let queryString = ''
  const keys = Object.keys(params)
  if (keys.length > 0) {
    queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
  }
  return get(`/models/page${queryString}`, {}, { cache: true, cacheTime: 5 * 60 * 1000 })
}

export function getMyModels(params = {}) {
  let queryString = ''
  const keys = Object.keys(params)
  if (keys.length > 0) {
    queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
  }
  return get(`/models/my${queryString}`, {}, { cache: true, cacheTime: 3 * 60 * 1000 })
}

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

export default {
  addModel,
  getModelList,
  getModelDetail,
  updateModel,
  deleteModel,
  getModelPage,
  getMyModels,
  processModelData
}
