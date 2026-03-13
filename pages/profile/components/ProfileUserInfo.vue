<template>
  <view class="profile-user-info">
    <view class="user-main" @click="handleLogin">
      <view class="user-avatar">
        <image v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" lazy-load />
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

<script>
import { useLanguage } from '@/composables'
import { useUser } from '@/composables'
import { getFollowingList, getFollowersList } from '@/api/community'
import { useLanguageStore } from '@/stores'
import { computed } from 'vue'

export default {
  name: 'ProfileUserInfo',
  data() {
    return {
      userInfo: {
        nickname: '用户昵称',
        avatar: '/static/images/Default avatar.png'
      },
      followingCount: 0,
      followersCount: 0
    }
  },
  setup() {
    const { isLoggedIn, checkLoginStatus, setUserInfo } = useUser()
    
    return { 
      texts: computed(() => useLanguageStore().texts.profile),
      isLoggedIn, 
      checkLoginStatus,
      setUserInfo
    }
  },
  mounted() {
    this.loadUserInfo()
    
    uni.$on('userLogin', () => {
      this.loadUserInfo()
    })
    
    uni.$on('profileUpdate', (userInfo) => {
      this.userInfo = userInfo
    })
    
    uni.$on('userLogout', () => {
      this.resetUserInfo()
    })
  },
  
  onShow() {
    this.loadUserInfo()
    if (this.isLoggedIn) {
      this.loadFollowStats()
    }
    
    // 监听关注状态变化，更新关注统计
    uni.$on('followStatusChanged', () => {
      this.loadFollowStats()
    })
  },
  
  beforeDestroy() {
    // 移除事件监听
    uni.$off('userLogin')
    uni.$off('profileUpdate')
    uni.$off('userLogout')
  },
  
  methods: {
    handleLogin() {
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
    
    loadUserInfo() {
      this.checkLoginStatus()
      
      if (this.isLoggedIn) {
        const storedUserInfo = uni.getStorageSync('userInfo') || {}
        
        if (storedUserInfo && Object.keys(storedUserInfo).length > 0) {
          let avatarUrl = storedUserInfo.avatar || '/static/images/Default avatar.png'
          if (avatarUrl.startsWith('blob:')) {
            avatarUrl = '/static/images/Default avatar.png'
            storedUserInfo.avatar = avatarUrl
            this.setUserInfo(storedUserInfo)
          }
          
          this.userInfo = { ...storedUserInfo }
          this.loadFollowStats()
        } else {
          this.resetUserInfo()
        }
      } else {
        this.resetUserInfo()
      }
    },
    
    async loadFollowStats() {
      const userId = this.userInfo.userId || uni.getStorageSync('userInfo')?.userId
      if (!userId) return
      
      try {
        const [followingRes, followersRes] = await Promise.all([
          getFollowingList(userId),
          getFollowersList(userId)
        ])
        
        if (followingRes.code === 0) {
          this.followingCount = followingRes.data?.length || 0
        }
        if (followersRes.code === 0) {
          this.followersCount = followersRes.data?.length || 0
        }
      } catch (e) {
        console.error('加载关注统计失败:', e)
      }
    },
    
    goToFollowList(tab) {
      const userId = this.userInfo.userId || uni.getStorageSync('userInfo')?.userId
      if (!userId) return
      
      uni.navigateTo({
        url: `/pagesMember/user/followList/followList?userId=${userId}&tab=${tab}`
      })
    },
    
    resetUserInfo() {
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
  color: #FF5A00;
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
