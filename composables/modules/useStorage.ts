export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  USER_ID: 'userId',
  ID: 'id',
  USERNAME: 'username',
  EMAIL: 'email',
  ACCOUNT_STATUS: 'accountStatus',
  IS_LOGGED_IN: 'isLoggedIn',
  APP_LANGUAGE: 'appLanguage'
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export function getStorage<T = unknown>(key: StorageKey, defaultValue?: T): T | undefined {
  try {
    const value = uni.getStorageSync(key)
    if (value === '' || value === null || value === undefined) {
      return defaultValue
    }
    return value as T
  } catch (e) {
    console.warn(`[Storage] 读取 ${key} 失败:`, e)
    return defaultValue
  }
}

export function setStorage<T>(key: StorageKey, value: T): boolean {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.warn(`[Storage] 写入 ${key} 失败:`, e)
    return false
  }
}

export function removeStorage(key: StorageKey): boolean {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.warn(`[Storage] 删除 ${key} 失败:`, e)
    return false
  }
}

export function clearAuthStorage(): void {
  removeStorage(STORAGE_KEYS.TOKEN)
  removeStorage(STORAGE_KEYS.USER_INFO)
  removeStorage(STORAGE_KEYS.USER_ID)
  removeStorage(STORAGE_KEYS.ID)
  removeStorage(STORAGE_KEYS.USERNAME)
  removeStorage(STORAGE_KEYS.EMAIL)
  removeStorage(STORAGE_KEYS.ACCOUNT_STATUS)
  removeStorage(STORAGE_KEYS.IS_LOGGED_IN)
}
