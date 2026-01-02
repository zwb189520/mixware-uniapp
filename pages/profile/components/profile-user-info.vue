<template>
  <view class="profile-user-info" @click="handleLogin">
    <view class="user-avatar">
      <image v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" />
      <uni-icons v-else type="person" size="50" color="#999"></uni-icons>
    </view>
    <view class="user-details">
      <text class="username">{{ isLoggedIn ? userInfo.nickname : '登录/注册' }}</text>
      <text v-if="!isLoggedIn" class="login-hint">点击登录体验更多功能</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfileUserInfo',
  data() {
    return {
      isLoggedIn: false,
      userInfo: {
        nickname: '用户昵称',
        avatar: '/static/default-avatar.png'
      }
    }
  },
  methods: {
    handleLogin() {
      if (!this.isLoggedIn) {
        // 跳转到登录页面
        uni.navigateTo({
          url: '/pages/login/login'
        })
      } else {
        // 跳转到个人资料编辑页面
        uni.navigateTo({
          url: '/pages/profile-edit/profile-edit'
        })
      }
    },
    
    loadUserInfo() {
      // 从本地存储加载用户信息
      const isLoggedIn = uni.getStorageSync('isLoggedIn') || false
      const userInfo = uni.getStorageSync('userInfo') || {}
      
      console.log('Profile - 加载用户信息:', { isLoggedIn, userInfo })
      
      this.isLoggedIn = isLoggedIn
      if (userInfo && Object.keys(userInfo).length > 0) {
        this.userInfo = userInfo
        console.log('Profile - 更新用户信息:', this.userInfo)
      } else {
        console.log('Profile - 未找到用户信息，使用默认值')
      }
    },
    
    resetUserInfo() {
      // 重置为未登录状态
      this.isLoggedIn = false
      this.userInfo = {
        nickname: '用户昵称',
        avatar: '/static/default-avatar.png'
      }
    }
  },
  
  mounted() {
    this.loadUserInfo()
    
    // 监听登录事件
    uni.$on('userLogin', (userInfo) => {
      console.log('Profile - 接收到登录事件:', userInfo)
      this.loadUserInfo()
    })
    
    // 监听个人资料更新事件
    uni.$on('profileUpdate', (userInfo) => {
      console.log('Profile - 接收到资料更新事件:', userInfo)
      this.userInfo = userInfo
    })
    
    // 监听退出登录事件
    uni.$on('userLogout', () => {
      console.log('Profile - 接收到退出登录事件')
      this.resetUserInfo()
    })
  },
  
  onShow() {
    this.loadUserInfo()
  },
  
  beforeDestroy() {
    // 移除事件监听
    uni.$off('userLogin')
    uni.$off('profileUpdate')
    uni.$off('userLogout')
  }
}
</script>

<style scoped>
.profile-user-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin: 20rpx 0;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.login-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
