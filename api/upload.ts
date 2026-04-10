import { post, get, del, uploadFile } from './request'

interface UploadOptions {
  name?: string
  formData?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  [key: string]: unknown
}

/**
 * 上传模型文件
 * @param filePath - 文件路径
 * @param options - 上传选项
 */
export function uploadModelFile(filePath: string, options: UploadOptions = {}): Promise<unknown> {
  return uploadFile('/upload/model', filePath, {
    name: 'file',
    ...options
  })
}

/**
 * 上传多张图片
 * @param files - 文件数组
 * @param options - 上传选项
 */
export function uploadImages(files: string[], options: UploadOptions = {}): Promise<unknown[]> {
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
 * @param filePath - 文件路径
 * @param type - 图片类型
 * @param id - 关联 ID
 * @param options - 上传选项
 */
export function uploadImage(
  filePath: string,
  type: string,
  id: string,
  options: UploadOptions = {}
): Promise<unknown> {
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
 * @param fileUrl - 文件 URL
 */
export function getModelDownloadUrl(fileUrl: string): Promise<unknown> {
  return get('/upload/model/download', { fileUrl })
}
