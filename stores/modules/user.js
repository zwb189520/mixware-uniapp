import { defineStore } from 'pinia'
import { STORAGE } from '../../constants/index.js'

/**
 * 简单的 Token 加密/解密（防止直接读取）
 * 注意：这不是完全安全的加密，只是增加攻击难度
 */
const SECRET_KEY = 'mixware_app_2026'

function encryptToken(token) {
  if (!token) return ''
  // 简单的 Base64 + 混淆
  const encoded = btoa(unescape(encodeURIComponent(token + SECRET_KEY)))
  return encoded.split('').reverse().join('')
}

function decryptToken(encrypted) {
  if (!encrypted) return ''
  try {
    const reversed = encrypted.split('').reverse().join('')
    const decoded = decodeURIComponent(escape(atob(reversed)))
    return decoded.replace(SECRET_KEY, '')
  } catch (e) {
    console.error('Token 解密失败:', e)
    return ''
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.userInfo?.userId || '',
    userName: (state) => state.userInfo?.userName || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },
  
  actions: {
    setToken(token) {
      // ✅ 改进：Token 加密后存本地
      this.token = token
      const encrypted = encryptToken(token)
      uni.setStorageSync(STORAGE.TOKEN_KEY, encrypted)
    },
    
    setUserInfo(userInfo) {
      // 用户信息存内存 + 本地
      this.userInfo = userInfo
      uni.setStorageSync(STORAGE.USER_INFO_KEY, userInfo)
    },
    
    logout() {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync(STORAGE.TOKEN_KEY)
      uni.removeStorageSync(STORAGE.USER_INFO_KEY)
    },
    
    initFromStorage() {
      // ✅ 改进：恢复 Token（解密）和用户信息
      try {
        const encrypted = uni.getStorageSync(STORAGE.TOKEN_KEY)
        if (encrypted) {
          this.token = decryptToken(encrypted)
        }
        
        const userInfo = uni.getStorageSync(STORAGE.USER_INFO_KEY)
        if (userInfo) {
          this.userInfo = userInfo
        }
      } catch (e) {
        console.error('初始化用户状态失败:', e)
      }
    }
  }
})
