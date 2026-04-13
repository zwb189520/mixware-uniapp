import { post, get, put, del, postWithQuery } from './request'
import type { ApiResponse, Model, PaginatedData } from '@/types/api'

interface ModelData {
  name?: string
  category?: string
  previewUrl?: string
  downloadUrl?: string
  description?: string
  userId?: string | number
  editableStatus?: string
  modelFile?: string
  modelUrl?: string
  thumb?: string
  image?: string
  dimensions?: {
    x?: number
    y?: number
    z?: number
    width?: number
    height?: number
    depth?: number
  }
}

export function addModel(modelData: ModelData): Promise<ApiResponse<Model>> {
  return post<Model>('/models/add', {
    name: modelData.name || '',
    category: modelData.category || '',
    previewUrl: modelData.previewUrl || '',
    downloadUrl: modelData.downloadUrl || '',
    description: modelData.description || '',
    userId: modelData.userId || '',
    editableStatus: modelData.editableStatus || 'editable'
  })
}

export function getModelList(params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/page', params)
}

export function getModelDetail(modelId: string | number): Promise<ApiResponse<Model>> {
  return get<Model>(`/models/${modelId}`)
}

export function updateModel(modelId: string | number, updateData: Record<string, unknown>): Promise<ApiResponse<Model>> {
  return put<Model>(`/models/update/${modelId}`, updateData)
}

export function deleteModel(modelId: string | number): Promise<ApiResponse<null>> {
  return del<null>(`/models/${modelId}`)
}

export function likeModel(modelId: string | number): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/model-like/like', null, { modelId })
}

export function unlikeModel(modelId: string | number): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/model-like/unlike', null, { modelId })
}

export function checkModelLike(modelId: string | number): Promise<ApiResponse<{ liked: boolean }>> {
  return get<{ liked: boolean }>('/model-like/check', { modelId })
}

export function getModelPage(params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/page', params)
}

export function getMyModels(params: Record<string, unknown> = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/my', params)
}

export function processModelData(modelData: ModelData | null): {
  downloadUrl: string
  modelUrl: string
  modelType: string
  thumb: string
  dimensions: { x: number; y: number; z: number }
  name: string
} {
  if (!modelData) {
    return {
      downloadUrl: '',
      modelUrl: '',
      modelType: 'glb',
      thumb: '',
      dimensions: { x: 0, y: 0, z: 0 },
      name: ''
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

  const dimensions = modelData.dimensions
    ? {
        x: modelData.dimensions.x || modelData.dimensions.width || 0,
        y: modelData.dimensions.y || modelData.dimensions.height || 0,
        z: modelData.dimensions.z || modelData.dimensions.depth || 0
      }
    : { x: 0, y: 0, z: 0 }

  return {
    downloadUrl,
    modelUrl: downloadUrl,
    modelType,
    thumb,
    dimensions,
    name: modelData.name || ''
  }
}

function extractFileType(url: string): string {
  if (!url) return ''
  try {
    const urlWithoutQuery = url.split('?')[0]
    const ext = urlWithoutQuery.split('.').pop()?.toLowerCase() || ''
    const typeMap: Record<string, string> = {
      glb: 'glb',
      gltf: 'gltf',
      obj: 'obj',
      stl: 'stl'
    }
    return typeMap[ext] || ''
  } catch (e) {
    return ''
  }
}

export function scaleAndSliceModel(data: Record<string, unknown>): Promise<ApiResponse<{ taskId: string }>> {
  return post<{ taskId: string }>('/models/scaleAndSlice', data)
}

export function getScaleAndSliceStatus(taskId: string | number): Promise<ApiResponse<{ status: string; progress: number; gcodeUrl?: string }>> {
  return get<{ status: string; progress: number; gcodeUrl?: string }>(`/models/scaleAndSlice/status/${taskId}`)
}
