<template>
  <view class="settings-menu">
    <view class="menu-section">
      <view 
        v-for="item in menuItems" 
        :key="item.id" 
        class="menu-item"
        @click="handleMenuClick(item)"
      >
        <text class="menu-text">{{ item.title }}</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <view class="logout-section">
      <view class="logout-button" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SettingsMenu',
  data() {
    return {
      menuItems: [
        { id: 1, title: '个人资料' },
        { id: 2, title: '账户与安全' },
        { id: 3, title: '消息设置' }
      ]
    }
  },
  methods: {
    handleMenuClick(item) {
      if (item.id === 1) {
        const isLoggedIn = uni.getStorageSync('isLoggedIn') || false
        if (!isLoggedIn) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        } else {
          uni.navigateTo({
            url: '/pages/profileEdit/profileEdit'
          })
        }
      } else if (item.id === 2) {
        const isLoggedIn = uni.getStorageSync('isLoggedIn') || false
        if (!isLoggedIn) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        } else {
          uni.navigateTo({
            url: '/pages/accountSecurity/accountSecurity'
          })
        }
      }
      console.log('点击菜单:', item.title)
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态和用户信息
            uni.removeStorageSync('isLoggedIn')
            uni.removeStorageSync('userInfo')
            
            console.log('Settings - 退出登录，清除用户信息')
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            // 发送退出登录事件
            uni.$emit('userLogout')
            
            // 返回profile页面
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/profile/profile'
              })
            }, 1000)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.settings-menu {
  padding: 20rpx 0;
}

.menu-section {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.logout-section {
  padding: 0 30rpx;
}

.logout-button {
  height: 88rpx;
  background-color: #fff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #ff4757;
}

.logout-text {
  font-size: 28rpx;
  color: #ff4757;
}
</style>
