import { uploadFile } from './request'

/**
 * 离线音频处理
 * @param {string} filePath - 音频文件路径
 * @returns {Promise<Object>} 返回处理结果
 */
export function audioOffline(filePath) {
  return uploadFile('/audio/offline', filePath, {
    name: 'file'
  })
}
