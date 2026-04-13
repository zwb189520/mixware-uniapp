import { uploadFile } from './request'
import type { ApiResponse, AudioTranscription } from '@/types/api'

export function audioOffline(filePath: string): Promise<ApiResponse<AudioTranscription>> {
  return uploadFile<AudioTranscription>('/audio/offline', filePath, {
    name: 'file'
  })
}
