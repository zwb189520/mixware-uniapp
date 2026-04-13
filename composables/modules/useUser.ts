import { computed } from 'vue'
import { useUserStore } from '@/stores/index.ts'

interface UserInfo {
  id?: string | number
  userId?: string | number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
}

export function useUser() {
  const userStore = useUserStore()

  const userInfo = computed<UserInfo | null>(() => userStore.userInfo as UserInfo | null)
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const userId = computed(() => userStore.userId)
  const userName = computed(() => userStore.userName)
  const avatar = computed(() => userStore.avatar)
  const token = computed(() => userStore.token)

  const checkLoginStatus = (): boolean => {
    return userStore.isLoggedIn
  }

  const requireLogin = (callback?: () => void): boolean => {
    if (userStore.isLoggedIn) {
      callback && callback()
      return true
    } else {
      uni.navigateTo({
        url: '/pagesMember/auth/login/login'
      })
      return false
    }
  }

  const logout = (): Promise<boolean> => {
    return new Promise(resolve => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res: { confirm: boolean; cancel: boolean }) => {
          if (res.confirm) {
            userStore.logout()
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    })
  }

  const setUserInfo = (info: Partial<UserInfo>): void => {
    userStore.setUserInfo(info as any)
  }

  return {
    userInfo,
    isLoggedIn,
    userId,
    userName,
    avatar,
    token,
    checkLoginStatus,
    requireLogin,
    logout,
    setUserInfo
  }
}
