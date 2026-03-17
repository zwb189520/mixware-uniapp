import { get, post } from './request'

/**
 * Google OAuth 回调处理
 * @param {string} code - OAuth 授权码
 * @param {string} state - OAuth 状态参数
 * @returns {Promise<Object>} 返回登录结果
 */
export function googleCallback(code, state) {
  return get('/auth/oauth/callback/google', { code, state })
}

/**
 * Apple OAuth 回调处理
 * @param {Object} params - 用户信息参数
 * @returns {Promise<Object>} 返回登录结果
 */
export function appleCallback(params) {
  return post('/auth/oauth/callback/apple', params)
}

/**
 * 获取 Google OAuth 配置
 * @returns {Promise<Object>} 返回 OAuth 配置信息
 */
export function getGoogleOAuthConfig() {
  return get('/auth/google/config')
}

/**
 * 获取 Apple OAuth 配置
 * @returns {Promise<Object>} 返回 OAuth 配置信息
 */
export function getAppleConfig() {
  return get('/auth/apple/config')
}
