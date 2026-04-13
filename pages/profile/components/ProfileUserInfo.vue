<template>
  <view class="profile-user-info">
    <view class="user-main" @click="handleLogin">
      <view class="user-avatar">
        <image
          v-if="isLoggedIn && userInfo.avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
          lazy-load
        />
        <image v-else :src="userInfo.avatar" mode="aspectFill" lazy-load />
      </view>
      <view class="user-details">
        <text class="username">{{ isLoggedIn ? userInfo.nickname : texts.loginRegister }}</text>
        <text v-if="!isLoggedIn" class="login-hint">{{ texts.clickToLogin }}</text>

        <view v-if="isLoggedIn" class="user-stats-row">
          <view class="stat-item" @click.stop="goToFollowList('following')">
            <text class="stat-number">{{ followingCount }}</text>
            <text class="stat-label">{{ texts.following }}</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item" @click.stop="goToFollowList('followers')">
            <text class="stat-number">{{ followersCount }}</text>
            <text class="stat-label">{{ texts.followers }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useUser } from '@/composables'
import { getFollowingList, getFollowersList } from '@/api/community'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'
import { computed } from 'vue'

interface UserInfo {
  nickname: string
  avatar: string
  userId?: string | number
}

export default {
  name: 'ProfileUserInfo',
  data() {
    return {
      userInfo: {
        nickname: '用户昵称',
        avatar: '/static/images/Default avatar.png'
      } as UserInfo,
      followingCount: 0 as number,
      followersCount: 0 as number
    }
  },
  setup() {
    const { isLoggedIn, checkLoginStatus, setUserInfo } = useUser()
    const userStore = useUserStore()

    return {
      texts: computed(() => useLanguageStore().texts.profile),
      isLoggedIn,
      checkLoginStatus,
      setUserInfo,
      userStore
    }
  },
  mounted(): void {
    this.loadUserInfo()

    uni.$on('userLogin', () => {
      this.loadUserInfo()
    })

    uni.$on('profileUpdate', (userInfo: UserInfo) => {
      this.userInfo = userInfo
    })

    uni.$on('userLogout', () => {
      this.resetUserInfo()
    })
  },

  onShow(): void {
    this.loadUserInfo()
    if (this.isLoggedIn) {
      this.loadFollowStats()
    }

    uni.$on('followStatusChanged', () => {
      this.loadFollowStats()
    })
  },

  beforeDestroy(): void {
    uni.$off('userLogin')
    uni.$off('profileUpdate')
    uni.$off('userLogout')
  },

  methods: {
    handleLogin(): void {
      if (!this.isLoggedIn) {
        uni.navigateTo({
          url: '/pagesMember/auth/login/login'
        })
      } else {
        uni.navigateTo({
          url: '/pagesMember/user/profileEdit/profileEdit'
        })
      }
    },

    loadUserInfo(): void {
      this.checkLoginStatus()

      if (this.isLoggedIn) {
        const storedUserInfo = this.userStore.userInfo || {}

        if (storedUserInfo && Object.keys(storedUserInfo).length > 0) {
          let avatarUrl = storedUserInfo.avatar || '/static/images/Default avatar.png'
          if (avatarUrl.startsWith('blob:')) {
            avatarUrl = '/static/images/Default avatar.png'
            storedUserInfo.avatar = avatarUrl
            this.setUserInfo(storedUserInfo)
          }

          this.userInfo = {
            nickname: storedUserInfo.nickname || '用户昵称',
            avatar: storedUserInfo.avatar || '/static/images/Default avatar.png',
            userId: storedUserInfo.userId
          }
          this.loadFollowStats()
        } else {
          this.resetUserInfo()
        }
      } else {
        this.resetUserInfo()
      }
    },

    async loadFollowStats(): Promise<void> {
      const userId = String(this.userInfo.userId || this.userStore.userId || '')
      if (!userId) return

      try {
        const [followingRes, followersRes] = await Promise.all([
          getFollowingList(userId),
          getFollowersList(userId)
        ])

        if ((followingRes as any).code === 0) {
          this.followingCount = (followingRes as any).data?.length || 0
        }
        if ((followersRes as any).code === 0) {
          this.followersCount = (followersRes as any).data?.length || 0
        }
      } catch (e: any) {
        console.error('加载关注统计失败:', e)
      }
    },

    goToFollowList(tab: string): void {
      const userId = String(this.userInfo.userId || this.userStore.userId || '')
      if (!userId) return

      uni.navigateTo({
        url: `/pagesMember/user/followList/followList?userId=${userId}&tab=${tab}`
      })
    },

    resetUserInfo(): void {
      this.checkLoginStatus()
      this.userInfo = {
        nickname: '用户昵称',
        avatar: '/static/images/Default avatar.png'
      }
    }
  }
}
</script>

<style scoped>
.profile-user-info {
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  margin: 20rpx 0;
}

.user-main {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.user-avatar:active {
  transform: scale(0.95);
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-avatar .uni-icons {
  width: 50rpx;
  height: 50rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.login-hint {
  font-size: 26rpx;
  color: #999;
}

.user-stats-row {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-number {
  font-size: 24rpx;
  font-weight: 600;
  color: #ff5a00;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.stat-divider {
  width: 2rpx;
  height: 24rpx;
  background: #e0e0e0;
}
</style>
