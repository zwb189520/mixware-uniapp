import { defineStore } from 'pinia'

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
      uni.setStorageSync('token', token)
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      uni.setStorageSync('userInfo', userInfo)
    },
    logout() {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    },
    initFromStorage() {
      try {
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')
        if (token) this.token = token
        if (userInfo) this.userInfo = userInfo
      } catch (e) {
        console.error('初始化用户状态失败:', e)
      }
    }
  }
})
