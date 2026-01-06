// 模型管理API
const BASE_URL = 'http://app.mixwarebot.cn/api'; // API服务器地址

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
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.category) queryParams.append('category', params.category);
    if (params.keyword) queryParams.append('keyword', params.keyword);

    uni.request({
      url: `${BASE_URL}/api/models/list?${queryParams.toString()}`,
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
    uni.request({
      url: `${BASE_URL}/api/models/${modelId}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.msg || '获取模型详情失败'));
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
    const queryParams = new URLSearchParams();
    if (params.current) queryParams.append('current', params.current);
    if (params.size) queryParams.append('size', params.size);
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.sort) queryParams.append('sort', params.sort);

    const requestUrl = `${BASE_URL}/models/page?${queryParams.toString()}`;
    console.log('请求URL:', requestUrl);

    uni.request({
      url: requestUrl,
      method: 'GET',
      timeout: 10000, // 移动端设置10秒超时
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
        // 移动端网络错误处理
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
    const queryParams = new URLSearchParams();
    if (params.current) queryParams.append('current', params.current);
    if (params.size) queryParams.append('size', params.size);

    uni.request({
      url: `${BASE_URL}/models/my?${queryParams.toString()}`,
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

export default {
  addModel,
  getModelList,
  getModelDetail,
  updateModel,
  deleteModel,
  getModelPage,
  getMyModels
};