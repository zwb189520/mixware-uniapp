import { get } from './request'

/**
 * 检查OTA更新
 * @param version 当前版本号
 */
export function checkUpdate(version: string) {
  return get('/ota/app/checkUpdate', { version })
}
