import { ref } from 'vue'

interface UserInfo {
  id?: string | number
  username?: string
  [key: string]: any
}

export function useUser() {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref(false)
  const loading = ref(false)

  const checkLoginStatus = (): boolean => {
    try {
      const loginStatus = uni.getStorageSync('isLoggedIn')
      const userData = uni.getStorageSync('userInfo')

      isLoggedIn.value = !!loginStatus
      userInfo.value = userData || null

      return isLoggedIn.value
    } catch (error) {
      console.error('检查登录状态失败:', error)
      isLoggedIn.value = false
      userInfo.value = null
      return false
    }
  }

  const setUserInfo = (userData: UserInfo | null): void => {
    userInfo.value = userData
    if (userData) {
      uni.setStorageSync('userInfo', userData)
    } else {
      uni.removeStorageSync('userInfo')
    }
  }

  const setLoginStatus = (status: boolean): void => {
    isLoggedIn.value = status
    uni.setStorageSync('isLoggedIn', status)

    if (!status) {
      userInfo.value = null
      uni.removeStorageSync('userInfo')
    }
  }

  const logout = (): Promise<boolean> => {
    return new Promise(resolve => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res: any) => {
          if (res.confirm) {
            setLoginStatus(false)
            uni.$emit('userLogout')
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    })
  }

  const requireLogin = (callback?: () => void): boolean => {
    if (checkLoginStatus()) {
      callback && callback()
      return true
    } else {
      uni.navigateTo({
        url: '/pagesMember/auth/login/login'
      })
      return false
    }
  }

  return {
    userInfo,
    isLoggedIn,
    loading,
    checkLoginStatus,
    setUserInfo,
    setLoginStatus,
    logout,
    requireLogin
  }
}
