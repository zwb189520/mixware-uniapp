<template>
  <view class="account-security-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="security-list">
      <view class="security-item" @click="handleResetPassword">
        <text class="item-label">{{ texts.resetPasswordLabel }}</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="security-item" @click="handleEmailBinding">
        <text class="item-label">{{ texts.emailBinding.title }}</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="security-item" @click="handleThirdPartyBinding">
        <text class="item-label">{{ texts.thirdPartyBindingLabel }}</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="security-item" @click="handleDeleteAccount">
        <text class="item-label">{{ texts.deleteAccount }}</text>
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
import { useLanguageStore } from '@/stores'

export default {
  name: 'AccountSecurity',
  components: {
    CustomNavbar,
    SafeArea
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.accountSecurity
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
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
        title: this.texts.deleteAccountTitle,
        content: this.texts.deleteAccountContent,
        confirmText: this.texts.confirm,
        cancelText: this.texts.cancel,
        success: (res) => {
          if (res.confirm) {
            this.performDeleteAccount()
          }
        }
      })
    },
    
    async performDeleteAccount() {
      try {
        uni.showLoading({
          title: this.texts.deleting
        })
        
        const userId = uni.getStorageSync('userId')
        const response = await deleteUser(userId)
        
        if (response.code === 200 || response.code === 0 || response.code === 1) {
          uni.showToast({
            title: this.texts.deleteSuccess,
            icon: 'success'
          })
          setTimeout(() => {
            uni.clearStorage()
            uni.$emit('userLogout')
            uni.reLaunch({
              url: '/pages/profile/profile'
            })
          }, 1000)
        } else {
          uni.showToast({
            title: response.msg || this.texts.deleteFailed,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('删除账号失败:', error)
        uni.showToast({
          title: error.msg || this.texts.deleteFailed,
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.account-security-page {
  min-height: 100vh;
  background: #FFF9F5;
}

.safe-area-top {
  background: #fff;
}

.security-list {
  margin: 20rpx 30rpx;
  background: #fff;
}

.security-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #FFF9F5;
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
