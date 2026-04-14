import { post, get, put, del, postWithQuery } from './request'
import type { ApiResponse, Model, PaginatedData, RequestData, ModelDimensions } from '@/types/api'

interface AddModelParams {
  name: string
  category: string
  previewUrl: string
  downloadUrl: string
  description: string
  userId: string | number
  editableStatus: string
}

interface ScaleAndSliceParams {
  modelUrl?: string
  modelId?: string | number
  deviceId?: string
  scale?: number
  preset?: string
  material?: string
  scaleFactor?: number
  addSupports?: boolean
}

interface ScaleAndSliceStatus {
  status: string
  progress: number
  gcodeUrl: string
  dimensions?: string
  printTime?: number
  materialWeight?: number
  printTimeHms?: string
  filamentLengthM?: number
  errorMessage?: string
}

interface ProcessedModelData {
  downloadUrl: string
  modelUrl: string
  modelType: string
  thumb: string
  dimensions: ModelDimensions
  name: string
}

export function addModel(modelData: Partial<AddModelParams>): Promise<ApiResponse<Model>> {
  const params: AddModelParams = {
    name: modelData.name || '',
    category: modelData.category || '',
    previewUrl: modelData.previewUrl || '',
    downloadUrl: modelData.downloadUrl || '',
    description: modelData.description || '',
    userId: modelData.userId || '',
    editableStatus: modelData.editableStatus || 'editable'
  }
  return post<Model>('/models/add', params as unknown as RequestData)
}

export function getModelList(params: RequestData = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/page', params)
}

export function getModelDetail(modelId: string | number): Promise<ApiResponse<Model>> {
  return get<Model>(`/models/${modelId}`)
}

export function updateModel(modelId: string | number, updateData: RequestData): Promise<ApiResponse<Model>> {
  return put<Model>(`/models/update/${modelId}`, updateData)
}

export function deleteModel(modelId: string | number): Promise<ApiResponse<null>> {
  return del<null>(`/models/${modelId}`)
}

export function likeModel(modelId: string | number): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/model-like/like', {}, { modelId: String(modelId) })
}

export function unlikeModel(modelId: string | number): Promise<ApiResponse<null>> {
  return postWithQuery<null>('/model-like/unlike', {}, { modelId: String(modelId) })
}

export function checkModelLike(modelId: string | number): Promise<ApiResponse<{ liked: boolean }>> {
  return get<{ liked: boolean }>('/model-like/check', { modelId: String(modelId) })
}

export function getModelPage(params: RequestData = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/page', params)
}

export function getMyModels(params: RequestData = {}): Promise<ApiResponse<PaginatedData<Model>>> {
  return get<PaginatedData<Model>>('/models/my', params)
}

export function processModelData(modelData: Partial<Model> | null): ProcessedModelData {
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

  const dimensions: ModelDimensions = modelData.dimensions
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
  } catch {
    return ''
  }
}

export function scaleAndSliceModel(data: ScaleAndSliceParams): Promise<ApiResponse<{ taskId: string }>> {
  return post<{ taskId: string }>('/models/scaleAndSlice', data as RequestData)
}

export function getScaleAndSliceStatus(taskId: string | number): Promise<ApiResponse<ScaleAndSliceStatus>> {
  return get<ScaleAndSliceStatus>(`/models/scaleAndSlice/status/${taskId}`)
}
