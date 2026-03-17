import { ref } from 'vue'

/**
 * 用户相关组合式函数
 * @returns {Object} 用户相关方法和状态
 */
export function useUser() {
  const userInfo = ref(null)
  const isLoggedIn = ref(false)
  const loading = ref(false)
  
  const checkLoginStatus = () => {
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
  
  const setUserInfo = (userData) => {
    userInfo.value = userData
    if (userData) {
      uni.setStorageSync('userInfo', userData)
    } else {
      uni.removeStorageSync('userInfo')
    }
  }
  
  const setLoginStatus = (status) => {
    isLoggedIn.value = status
    uni.setStorageSync('isLoggedIn', status)
    
    if (!status) {
      userInfo.value = null
      uni.removeStorageSync('userInfo')
    }
  }
  
  const logout = () => {
    return new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
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
  
  const requireLogin = (callback) => {
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