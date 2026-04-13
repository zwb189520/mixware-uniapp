import { get } from './request'
import type { ApiResponse, PaginatedData } from '@/types/api'

interface OperationRecord {
  id: string | number
  type: string
  action: string
  targetId?: string | number
  targetName?: string
  createdAt: string
}

export function getModelRecords(current = 1, size = 10): Promise<ApiResponse<PaginatedData<OperationRecord>>> {
  return get<PaginatedData<OperationRecord>>('/operation-records/model', { current, size })
}

export function getPrintRecords(current = 1, size = 10): Promise<ApiResponse<PaginatedData<OperationRecord>>> {
  return get<PaginatedData<OperationRecord>>('/operation-records/print', { current, size })
}
