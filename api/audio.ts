import { uploadFile } from './request'

export function audioOffline(filePath: string): Promise<any> {
  return uploadFile('/audio/offline', filePath, {
    name: 'file'
  })
}
