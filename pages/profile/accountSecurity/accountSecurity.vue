<template>
  <view class="account-security-page">
    <safe-area />
    <custom-navbar title="账户与安全" @back="handleBack" />
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
import { deleteUser } from '@/api/users.js'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'AccountSecurity',
  components: {
    CustomNavbar,
    SafeArea
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleResetPassword() {
      uni.navigateTo({
        url: '/pagesMember/auth/resetPassword/resetPassword'
      })
    },
    
    handleEmailBinding() {
      uni.navigateTo({
        url: '/pagesMember/auth/emailBinding/emailBinding'
      })
    },
    
    handleThirdPartyBinding() {
      uni.navigateTo({
        url: '/pagesMember/auth/thirdPartyBinding/thirdPartyBinding'
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
                  
                  const userInfo = uni.getStorageSync('userInfo') || {}
                  
                  deleteUser(userInfo.id).then(() => {
                    uni.hideLoading()
                    
                    uni.clearStorageSync()
                    
                    uni.$emit('userLogout')
                    
                    uni.showToast({
                      title: '账号已注销',
                      icon: 'success'
                    })
                    
                    setTimeout(() => {
                      uni.reLaunch({
                        url: '/pages/profile/profile/profile'
                      })
                    }, 1500)
                  }).catch((error) => {
                    uni.hideLoading()
                    
                    uni.showToast({
                      title: error.message || '注销失败',
                      icon: 'none'
                    })
                  })
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

.safe-area-top {
  background: #fff;
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
