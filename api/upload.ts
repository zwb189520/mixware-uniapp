import { get, uploadFile } from './request'
import type { ApiResponse, RequestData } from '@/types/api'

interface UploadOptions {
  name?: string
  formData?: RequestData
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
  } as { name?: string; formData?: RequestData; header?: Record<string, string>; showLoading?: boolean; loadingText?: string })
}

export function uploadImages(files: string[], options: UploadOptions = {}): Promise<ApiResponse<UploadResult>[]> {
  return Promise.all(
    files.map(file =>
      uploadFile<UploadResult>('/upload/images', file, {
        name: 'files',
        ...options
      } as { name?: string; formData?: RequestData; header?: Record<string, string>; showLoading?: boolean; loadingText?: string })
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
    } as RequestData,
    ...options
  } as { name?: string; formData?: RequestData; header?: Record<string, string>; showLoading?: boolean; loadingText?: string })
}

export function getModelDownloadUrl(fileUrl: string): Promise<ApiResponse<{ downloadUrl: string }>> {
  return get<{ downloadUrl: string }>('/upload/model/download', { fileUrl })
}
