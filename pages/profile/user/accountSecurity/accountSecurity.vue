<template>
  <view class="account-security-page">
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">账户与安全</text>
      </view>
      <view class="navbar-right"></view>
    </view>
    
    <view class="security-list">
      <view class="security-item" @click="handleResetPassword">
        <text class="item-label">重置密码</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="security-item" @click="handleEmailBinding">
        <text class="item-label">邮箱绑定</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="security-item" @click="handleThirdPartyBinding">
        <text class="item-label">第三方账号绑定</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="security-item" @click="handleDeleteAccount">
        <text class="item-label">注销账号</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AccountSecurity',
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleResetPassword() {
      uni.navigateTo({
        url: '/pages/profile/auth/resetPassword/resetPassword'
      })
    },
    
    handleEmailBinding() {
      uni.navigateTo({
        url: '/pages/profile/auth/emailBinding/emailBinding'
      })
    },
    
    handleThirdPartyBinding() {
      uni.navigateTo({
        url: '/pages/profile/user/thirdPartyBinding/thirdPartyBinding'
      })
    },
    
    handleDeleteAccount() {
      uni.showModal({
        title: '注销账号',
        content: '注销账号后，您的所有数据将被永久删除，无法恢复。确定要继续吗？',
        confirmText: '确定注销',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            uni.showModal({
              title: '再次确认',
              content: '账号注销后无法恢复，请再次确认是否继续？',
              confirmText: '确认注销',
              confirmColor: '#ff4d4f',
              success: (res) => {
                if (res.confirm) {
                  uni.showLoading({
                    title: '注销中...'
                  })
                  
                  setTimeout(() => {
                    uni.hideLoading()
                    
                    uni.clearStorageSync()
                    
                    uni.showToast({
                      title: '账号已注销',
                      icon: 'success'
                    })
                    
                    setTimeout(() => {
                      uni.reLaunch({
                      url: '/pages/profile/auth/login/login'
                    })
                    }, 1500)
                  }, 1500)
                }
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.account-security-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #fff;
  padding-top: env(safe-area-inset-top);
}

.navbar-left,
.navbar-right {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.security-list {
  margin-top: 20rpx;
  background: #fff;
}

.security-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 400;
}

.item-value {
  flex: 1;
  margin-right: 10rpx;
}
</style>
