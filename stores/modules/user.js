import { defineStore } from 'pinia'
import { STORAGE } from '../../constants/index.js'

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
      this.token = token
      uni.setStorageSync(STORAGE.TOKEN_KEY, token)
    },
    
    setUserInfo(userInfo) {
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
      try {
        const token = uni.getStorageSync(STORAGE.TOKEN_KEY)
        const userInfo = uni.getStorageSync(STORAGE.USER_INFO_KEY)
        if (token) this.token = token
        if (userInfo) this.userInfo = userInfo
      } catch (e) {
        console.error('初始化用户状态失败:', e)
      }
    }
  }
})
