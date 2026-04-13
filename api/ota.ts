import { get } from './request'
import type { ApiResponse } from '@/types/api'

interface OtaUpdateInfo {
  hasUpdate: boolean
  latestVersion: string
  downloadUrl: string
  remark?: string
  force?: boolean
}

export function checkUpdate(version: string): Promise<ApiResponse<OtaUpdateInfo>> {
  return get<OtaUpdateInfo>('/ota/app/checkUpdate', { version })
}
