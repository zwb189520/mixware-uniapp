import { get, uploadFile } from './request'
import type { ApiResponse } from '@/types/api'

interface UploadOptions {
  name?: string
  formData?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  [key: string]: unknown
}

interface UploadResult {
  url: string
  fileUrl?: string
  originalFileName?: string
  fileSize?: number
}

export function uploadModelFile(filePath: string, options: UploadOptions = {}): Promise<ApiResponse<UploadResult>> {
  return uploadFile<UploadResult>('/upload/model', filePath, {
    name: 'file',
    ...options
  })
}

export function uploadImages(files: string[], options: UploadOptions = {}): Promise<ApiResponse<UploadResult>[]> {
  return Promise.all(
    files.map(file =>
      uploadFile<UploadResult>('/upload/images', file, {
        name: 'files',
        ...options
      })
    )
  )
}

export function uploadImage(
  filePath: string,
  type: string,
  id: string,
  options: UploadOptions = {}
): Promise<ApiResponse<UploadResult>> {
  return uploadFile<UploadResult>('/upload/image', filePath, {
    name: 'file',
    formData: {
      type,
      id
    },
    ...options
  })
}

export function getModelDownloadUrl(fileUrl: string): Promise<ApiResponse<{ downloadUrl: string }>> {
  return get<{ downloadUrl: string }>('/upload/model/download', { fileUrl })
}
