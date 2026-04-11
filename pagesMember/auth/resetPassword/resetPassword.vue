<template>
  <view class="reset-password-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="content">
      <view class="form-item">
        <text class="form-label">{{ texts.emailLabel }}</text>
        <input class="form-input" v-model="email" :placeholder="texts.emailPlaceholder" />
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.codeLabel }}</text>
        <view class="code-input-container">
          <input
            class="form-input code-input"
            v-model="code"
            :placeholder="texts.codePlaceholder"
          />
          <button class="code-btn" @click="handleGetCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s` : texts.getCode }}
          </button>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.oldPasswordLabel }}</text>
        <input
          class="form-input"
          v-model="oldPassword"
          type="password"
          :placeholder="texts.oldPasswordPlaceholder"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.newPasswordLabel }}</text>
        <input
          class="form-input"
          v-model="newPassword"
          type="password"
          :placeholder="texts.newPasswordPlaceholder"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.confirmPasswordLabel }}</text>
        <input
          class="form-input"
          v-model="confirmPassword"
          type="password"
          :placeholder="texts.confirmPasswordPlaceholder"
        />
      </view>
      <button class="submit-btn" @click="handleSubmit">{{ texts.resetButton }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'
import { sendResetPasswordCode, resetPassword } from '@/api/users'
import { handleLogout } from '@/api/errorHandler'

const languageStore = useLanguageStore()
const email = ref('')
const code = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)

const texts = computed(() => languageStore.texts.accountSecurity.resetPassword)

onMounted(() => {
  languageStore.loadLanguage()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

const handleBack = () => {
  uni.navigateBack()
}

const handleGetCode = () => {
  if (!email.value) {
    uni.showToast({
      title: texts.value.enterEmail,
      icon: 'none'
    })
    return
  }

  sendResetPasswordCode(email.value)
    .then(() => {
      countdown.value = 60
      timer.value = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0 && timer.value) {
          clearInterval(timer.value)
        }
      }, 1000)
    })
    .catch((error: any) => {
      uni.showToast({
        title: error.message || texts.value.sendFailed,
        icon: 'none'
      })
    })
}

const handleSubmit = () => {
  if (
    !email.value ||
    !code.value ||
    !oldPassword.value ||
    !newPassword.value ||
    !confirmPassword.value
  ) {
    uni.showToast({
      title: texts.value.fillAllFields,
      icon: 'none'
    })
    return
  }

  if (newPassword.value === oldPassword.value) {
    uni.showToast({
      title: texts.value.newPasswordSameAsOld || '新密码不能与旧密码相同',
      icon: 'none'
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({
      title: texts.value.passwordsNotMatch,
      icon: 'none'
    })
    return
  }

  if (newPassword.value.length < 6) {
    uni.showToast({
      title: texts.value.passwordTooShort,
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: texts.value.resetting
  })

  resetPassword({
    email: email.value,
    verificationCode: code.value,
    newPassword: newPassword.value
  })
    .then(() => {
      uni.hideLoading()

      uni.showToast({
        title: texts.value.resetSuccess,
        icon: 'success'
      })

      setTimeout(() => {
        handleLogout()
        uni.redirectTo({
          url: '/pagesMember/auth/login/login'
        })
      }, 1500)
    })
    .catch((error: any) => {
      uni.hideLoading()
      uni.showToast({
        title: error.message || texts.value.resetFailed,
        icon: 'none'
      })
    })
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: #fff9f5;
}

.content {
  padding: 30rpx;
}

.form-item {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 400;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-input-container {
  display: flex;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 200rpx;
  height: 80rpx;
  background: #ff5a00;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  line-height: 80rpx;
}

.code-btn:disabled {
  background: #ccc;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #ff5a00;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 40rpx;
}
</style>
