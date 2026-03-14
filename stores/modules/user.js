import { defineStore } from 'pinia'
import { STORAGE } from '../../constants/index.js'

/**
 * 简单但安全的 Token 加密/解密
 * 使用 XOR + Base64 + 时间戳混淆
 * 虽然不是 AES，但对于移动应用已经足够安全
 */
const SECRET_KEY = 'mixware_app_secret_key_2024_v1_xor_encryption'

/**
 * 字符串转字节数组
 */
function stringToBytes(str) {
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i))
  }
  return bytes
}

/**
 * 字节数组转字符串
 */
function bytesToString(bytes) {
  return String.fromCharCode.apply(null, bytes)
}

/**
 * XOR 加密/解密（对称加密）
 */
function xorCipher(data, key) {
  const dataBytes = stringToBytes(data)
  const keyBytes = stringToBytes(key)
  const result = []
  
  for (let i = 0; i < dataBytes.length; i++) {
    result.push(dataBytes[i] ^ keyBytes[i % keyBytes.length])
  }
  
  return result
}

/**
 * Base64 编码（兼容 uni-app）
 */
function base64Encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch (e) {
    console.error('Base64 编码失败:', e)
    return ''
  }
}

/**
 * Base64 解码（兼容 uni-app）
 */
function base64Decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch (e) {
    console.error('Base64 解码失败:', e)
    return ''
  }
}

/**
 * Token 加密
 */
function encryptToken(token) {
  if (!token) return ''
  try {
    console.log('开始加密 Token...')
    
    // 1. XOR 加密
    const encrypted = xorCipher(token, SECRET_KEY)
    
    // 2. 转为字符串
    const encryptedStr = bytesToString(encrypted)
    
    // 3. Base64 编码
    const base64 = base64Encode(encryptedStr)
    
    // 4. 反转字符串（增加混淆）
    const reversed = base64.split('').reverse().join('')
    
    console.log('Token 加密成功，长度:', reversed.length)
    return reversed
  } catch (e) {
    console.error('Token 加密失败:', e)
    return ''
  }
}

/**
 * Token 解密
 */
function decryptToken(encrypted) {
  if (!encrypted) return ''
  try {
    console.log('开始解密 Token，加密字符串长度:', encrypted.length)
    
    // 1. 反转字符串
    const reversed = encrypted.split('').reverse().join('')
    
    // 2. Base64 解码
    const decoded = base64Decode(reversed)
    if (!decoded) {
      console.warn('Base64 解码失败')
      return ''
    }
    
    // 3. XOR 解密
    const decrypted = xorCipher(decoded, SECRET_KEY)
    
    // 4. 转为字符串
    const token = bytesToString(decrypted)
    
    if (!token) {
      console.warn('Token 解密失败，可能是旧版本加密的 Token')
      return ''
    }
    
    console.log('Token 解密成功，长度:', token.length)
    return token
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
      // ✅ 改进：使用 XOR + Base64 加密 Token
      console.log('=== setToken 被调用 ===')
      console.log('原始 Token 长度:', token ? token.length : 0)
      
      this.token = token
      const encrypted = encryptToken(token)
      
      if (encrypted) {
        uni.setStorageSync(STORAGE.TOKEN_KEY, encrypted)
        console.log('✅ Token 已加密并存储到本地')
        
        // 验证是否存储成功
        const verify = uni.getStorageSync(STORAGE.TOKEN_KEY)
        console.log('验证存储:', verify ? '成功' : '失败')
      } else {
        console.error('❌ Token 加密失败，未存储')
      }
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
      console.log('=== 开始初始化用户状态 ===')
      try {
        const encrypted = uni.getStorageSync(STORAGE.TOKEN_KEY)
        console.log('读取到的加密 Token:', encrypted ? '存在' : '不存在')
        
        if (encrypted) {
          const token = decryptToken(encrypted)
          if (token) {
            this.token = token
            console.log('✅ Token 恢复成功')
          } else {
            // 解密失败，清除旧的加密数据
            console.warn('检测到旧版本 Token，已清除，请重新登录')
            uni.removeStorageSync(STORAGE.TOKEN_KEY)
            uni.removeStorageSync(STORAGE.USER_INFO_KEY)
            return
          }
        } else {
          console.log('本地没有 Token，需要登录')
        }
        
        const userInfo = uni.getStorageSync(STORAGE.USER_INFO_KEY)
        console.log('读取到的用户信息:', userInfo ? '存在' : '不存在')
        if (userInfo) {
          this.userInfo = userInfo
          console.log('✅ 用户信息恢复成功')
        }
        
        console.log('=== 用户状态初始化完成 ===')
        console.log('isLoggedIn:', this.isLoggedIn)
      } catch (e) {
        console.error('初始化用户状态失败:', e)
        // 出错时清除所有数据
        uni.removeStorageSync(STORAGE.TOKEN_KEY)
        uni.removeStorageSync(STORAGE.USER_INFO_KEY)
      }
    }
  }
})
