import { defineStore } from 'pinia'
import { STORAGE } from '../../constants/index.ts'

const SECRET_KEY = 'mixware_app_secret_key_2024_v1_xor_encryption'

interface UserInfo {
  userId?: string | number
  id?: string | number
  userName?: string
  nickname?: string
  avatar?: string
  email?: string
  accountStatus?: number
  birthday?: string
}

function stringToBytes(str: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i))
  }
  return bytes
}

function bytesToString(bytes: number[]): string {
  return String.fromCharCode.apply(null, bytes as [number, ...number[]])
}

function xorCipher(data: string, key: string): number[] {
  const dataBytes = stringToBytes(data)
  const keyBytes = stringToBytes(key)
  const result: number[] = []

  for (let i = 0; i < dataBytes.length; i++) {
    result.push(dataBytes[i] ^ keyBytes[i % keyBytes.length])
  }

  return result
}

function base64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch (e) {
    return ''
  }
}

function base64Decode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch (e) {
    return ''
  }
}

function encryptToken(token: string): string {
  if (!token) return ''
  try {
    const encrypted = xorCipher(token, SECRET_KEY)
    const encryptedStr = bytesToString(encrypted)
    const base64 = base64Encode(encryptedStr)
    return base64.split('').reverse().join('')
  } catch (e) {
    return ''
  }
}

function decryptToken(encrypted: string): string {
  if (!encrypted) return ''
  try {
    const reversed = encrypted.split('').reverse().join('')
    const decoded = base64Decode(reversed)
    if (!decoded) return ''
    const decrypted = xorCipher(decoded, SECRET_KEY)
    return bytesToString(decrypted)
  } catch (e) {
    return ''
  }
}

function normalizeAvatar(avatarUrl?: string): string {
  if (!avatarUrl || avatarUrl.startsWith('blob:')) {
    return '/static/images/Default avatar.png'
  }
  return avatarUrl
}

export const useUserStore = defineStore('user', {
  state: (): { token: string; userInfo: UserInfo | null } => ({
    token: '',
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token,
    userId: (state): string | number => state.userInfo?.userId || state.userInfo?.id || '',
    userName: (state): string => state.userInfo?.userName || state.userInfo?.nickname || '',
    avatar: (state): string => state.userInfo?.avatar || ''
  },

  actions: {
    setToken(token: string): void {
      this.token = token
      if (token) {
        const encrypted = encryptToken(token)
        if (encrypted) {
          uni.setStorageSync(STORAGE.TOKEN_KEY, encrypted)
        }
      } else {
        uni.removeStorageSync(STORAGE.TOKEN_KEY)
      }
    },

    setUserInfo(userInfo: UserInfo): void {
      this.userInfo = userInfo
      uni.setStorageSync(STORAGE.USER_INFO_KEY, userInfo)
    },

    login(token: string, userInfo: UserInfo): void {
      const normalizedUserInfo = {
        ...userInfo,
        avatar: normalizeAvatar(userInfo.avatar)
      }
      this.setToken(token)
      this.setUserInfo(normalizedUserInfo)
      uni.$emit('userLogin', normalizedUserInfo)
    },

    logout(): void {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync(STORAGE.TOKEN_KEY)
      uni.removeStorageSync(STORAGE.USER_INFO_KEY)
      uni.removeStorageSync('aiChatSessionId')
      uni.removeStorageSync('aiChatSessionData')
      uni.removeStorageSync('registeredUsers')
      uni.removeStorageSync('apple_user_email')
      uni.removeStorageSync('apple_user_name')
      uni.removeStorageSync('messages')
      uni.removeStorageSync('likesList')
      uni.$emit('userLogout')
    },

    initFromStorage(): void {
      try {
        const encrypted = uni.getStorageSync(STORAGE.TOKEN_KEY) as string | undefined
        if (encrypted) {
          const token = decryptToken(encrypted)
          if (token) {
            this.token = token
          } else {
            this.logout()
            return
          }
        }

        const userInfo = uni.getStorageSync(STORAGE.USER_INFO_KEY) as UserInfo | undefined
        if (userInfo) {
          this.userInfo = userInfo
        }
      } catch (e) {
        this.logout()
      }
    }
  }
})
