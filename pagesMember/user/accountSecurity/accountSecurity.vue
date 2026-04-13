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
      <!-- <view class="security-item" @click="handleThirdPartyBinding">
        <text class="item-label">{{ texts.thirdPartyBindingLabel }}</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view> -->
      <view class="security-item" @click="handleDeleteAccount">
        <text class="item-label">{{ texts.deleteAccount }}</text>
        <view class="item-value"></view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { deleteUser } from '@/api/users'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore, useUserStore } from '@/stores'

const languageStore = useLanguageStore()
const userStore = useUserStore()

const texts = computed(() => languageStore.texts.accountSecurity)

onMounted(() => {
  languageStore.loadLanguage()
})

const handleBack = () => {
  uni.navigateBack()
}

const handleResetPassword = () => {
  uni.navigateTo({
    url: '/pagesMember/auth/resetPassword/resetPassword'
  })
}

const handleEmailBinding = () => {
  uni.navigateTo({
    url: '/pagesMember/auth/emailBinding/emailBinding'
  })
}

const handleThirdPartyBinding = () => {
  uni.navigateTo({
    url: '/pagesMember/auth/thirdPartyBinding/thirdPartyBinding'
  })
}

const handleDeleteAccount = () => {
  uni.showModal({
    title: texts.value.deleteAccountTitle,
    content: texts.value.deleteAccountContent,
    confirmText: texts.value.confirm,
    cancelText: texts.value.cancel,
    success: (res: any) => {
      if (res.confirm) {
        performDeleteAccount()
      }
    }
  })
}

const performDeleteAccount = async () => {
  try {
    uni.showLoading({
      title: texts.value.deleting
    })

    const id = userStore.userId
    const response = (await deleteUser(Number(id))) as any

    if (response.code === 200 || response.code === 0 || response.code === 1) {
      uni.showToast({
        title: texts.value.deleteSuccess,
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
        title: response.msg || texts.value.deleteFailed,
        icon: 'none'
      })
    }
  } catch (error: any) {
    console.error('删除账号失败:', error)
    uni.showToast({
      title: error.msg || texts.value.deleteFailed,
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.account-security-page {
  min-height: 100vh;
  background: #fff9f5;
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
  border-bottom: 1rpx solid #fff9f5;
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
