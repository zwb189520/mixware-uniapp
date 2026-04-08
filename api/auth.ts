import { get, post } from './request'

/**
 * Google OAuth 回调处理
 * @param code - OAuth 授权码
 * @param state - OAuth 状态参数
 */
export function googleCallback(code: string, state: string): Promise<unknown> {
  return get('/auth/oauth/callback/google', { code, state })
}

/**
 * Apple OAuth 回调处理
 * @param params - 用户信息参数
 */
export function appleCallback(params: Record<string, unknown>): Promise<unknown> {
  return post('/auth/oauth/callback/apple', params)
}

/**
 * 获取 Google OAuth 配置
 */
export function getGoogleOAuthConfig(): Promise<unknown> {
  return get('/auth/google/config')
}

/**
 * 获取 Apple OAuth 配置
 */
export function getAppleConfig(): Promise<unknown> {
  return get('/auth/apple/config')
}
