import { post, get, del, uploadFile } from './request'

/**
 * 上传模型文件
 * @param {string} filePath - 文件路径
 * @param {Object} [options={}] - 上传选项
 * @returns {Promise<Object>} 返回上传结果
 */
export function uploadModelFile(filePath, options = {}) {
  return uploadFile('/upload/model', filePath, {
    name: 'file',
    ...options
  })
}

/**
 * 上传多张图片
 * @param {Array} files - 文件数组
 * @param {Object} [options={}] - 上传选项
 * @returns {Promise<Array>} 返回上传结果数组
 */
export function uploadImages(files, options = {}) {
  return Promise.all(
    files.map(file =>
      uploadFile('/upload/images', file, {
        name: 'files',
        ...options
      })
    )
  )
}

/**
 * 上传单张图片
 * @param {string} filePath - 文件路径
 * @param {string} type - 图片类型
 * @param {string} id - 关联 ID
 * @param {Object} [options={}] - 上传选项
 * @returns {Promise<Object>} 返回上传结果
 */
export function uploadImage(filePath, type, id, options = {}) {
  return uploadFile('/upload/image', filePath, {
    name: 'file',
    formData: {
      type,
      id
    },
    ...options
  })
}

/**
 * 获取模型下载链接
 * @param {string} fileUrl - 文件 URL
 * @returns {Promise<Object>} 返回下载链接
 */
export function getModelDownloadUrl(fileUrl) {
  return get('/upload/model/download', { fileUrl })
}

