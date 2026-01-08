// 模型管理API
import { BASE_URL } from './config'; // API服务器地址

/**
 * 添加模型
 * @param {Object} modelData - 模型数据
 * @param {string} modelData.name - 模型名称
 * @param {string} modelData.category - 模型分类
 * @param {string} modelData.previewUrl - 预览图URL
 * @param {string} modelData.downloadUrl - 下载链接
 * @param {string} modelData.description - 模型描述
 * @param {string} modelData.userId - 用户ID
 * @param {string} modelData.editableStatus - 可编辑状态
 * @returns {Promise} 返回Promise对象
 */
export function addModel(modelData) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/models/add`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        name: modelData.name || '',
        category: modelData.category || '',
        previewUrl: modelData.previewUrl || '',
        downloadUrl: modelData.downloadUrl || '',
        description: modelData.description || '',
        userId: modelData.userId || '',
        editableStatus: modelData.editableStatus || '1'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '添加模型失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取模型列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类筛选
 * @param {string} params.keyword - 关键词搜索
 * @returns {Promise} 返回Promise对象
 */
export function getModelList(params = {}) {
  return new Promise((resolve, reject) => {
    let queryString = ''
    const keys = Object.keys(params)
    if (keys.length > 0) {
      queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    }

    uni.request({
      url: `${BASE_URL}/api/models/list${queryString}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '获取模型列表失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取模型详情
 * @param {string} modelId - 模型ID
 * @returns {Promise} 返回Promise对象，包含模型详细信息
 */
export function getModelDetail(modelId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    const url = `${BASE_URL}/api/models/${modelId}`
    console.log('请求URL:', url)
    console.log('Token:', token ? '已设置' : '未设置')
    
    uni.request({
      url: url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        console.log('模型详情API响应:', res)
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            console.log('模型详情API错误:', res.data)
            reject(new Error(res.data.msg || '获取模型详情失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err)
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 更新模型
 * @param {string} modelId - 模型ID
 * @param {Object} updateData - 更新的数据
 * @returns {Promise} 返回Promise对象
 */
export function updateModel(modelId, updateData) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/models/update/${modelId}`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json'
      },
      data: updateData,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '更新模型失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 删除模型
 * @param {string} modelId - 模型ID
 * @returns {Promise} 返回Promise对象
 */
export function deleteModel(modelId) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/models/delete/${modelId}`,
      method: 'DELETE',
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '删除模型失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取模型列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @param {string} params.name - 模型名称筛选
 * @param {string} params.category - 分类筛选
 * @param {string} params.sort - 排序字段
 * @returns {Promise} 返回Promise对象
 */
export function getModelPage(params = {}) {
  return new Promise((resolve, reject) => {
    let queryString = ''
    const keys = Object.keys(params)
    if (keys.length > 0) {
      queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    }

    const requestUrl = `${BASE_URL}/api/models/page${queryString}`;
    console.log('请求URL:', requestUrl);

    uni.request({
      url: requestUrl,
      method: 'GET',
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      success: (res) => {
        console.log('API原始响应:', res)
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data ? res.data.msg : '获取模型列表失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err)
        if (err.errMsg.includes('timeout')) {
          reject(new Error('网络请求超时，请检查网络连接'));
        } else if (err.errMsg.includes('network')) {
          reject(new Error('网络连接失败，请检查网络设置'));
        } else {
          reject(new Error(`网络请求失败: ${err.errMsg}`));
        }
      }
    });
  });
}

/**
 * 获取我的模型列表
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @returns {Promise} 返回Promise对象
 */
export function getMyModels(params = {}) {
  return new Promise((resolve, reject) => {
    let queryString = ''
    const keys = Object.keys(params)
    if (keys.length > 0) {
      queryString = '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    }

    uni.request({
      url: `${BASE_URL}/models/my${queryString}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '获取我的模型列表失败'));
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 从模型数据中提取并处理模型信息
 * @param {Object} modelData 模型数据对象
 * @returns {Object} 处理后的模型信息
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
};