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
          <input class="form-input code-input" v-model="code" :placeholder="texts.codePlaceholder" />
          <button class="code-btn" @click="handleGetCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s` : texts.getCode }}
          </button>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.newPasswordLabel }}</text>
        <input class="form-input" v-model="newPassword" type="password" :placeholder="texts.newPasswordPlaceholder" />
      </view>
      <view class="form-item">
        <text class="form-label">{{ texts.confirmPasswordLabel }}</text>
        <input class="form-input" v-model="confirmPassword" type="password" :placeholder="texts.confirmPasswordPlaceholder" />
      </view>
      <button class="submit-btn" @click="handleSubmit">{{ texts.resetButton }}</button>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'
import { sendVerificationCode, resetPassword } from '@/api/users.js'

export default {
  name: 'ResetPassword',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
      countdown: 0,
      timer: null
    }
  },
  
  mounted() {
    this.languageStore.loadLanguage()
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.accountSecurity.resetPassword
    }
  },
  
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleGetCode() {
      if (!this.email) {
        uni.showToast({
          title: this.texts.enterEmail,
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: this.texts.sending
      })
      
      sendVerificationCode({ email: this.email }).then(() => {
        uni.hideLoading()
        
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.timer)
          }
        }, 1000)
        
        uni.showToast({
          title: this.texts.codeSent,
          icon: 'success'
        })
      }).catch((error) => {
        uni.hideLoading()
        uni.showToast({
          title: error.message || this.texts.sendFailed,
          icon: 'none'
        })
      })
    },
    
    handleSubmit() {
      if (!this.email || !this.code || !this.newPassword || !this.confirmPassword) {
        uni.showToast({
          title: this.texts.fillAllFields,
          icon: 'none'
        })
        return
      }
      
      if (this.newPassword !== this.confirmPassword) {
        uni.showToast({
          title: this.texts.passwordsNotMatch,
          icon: 'none'
        })
        return
      }
      
      if (this.newPassword.length < 6) {
        uni.showToast({
          title: this.texts.passwordTooShort,
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: this.texts.resetting
      })
      
      resetPassword({
        email: this.email,
        verificationCode: this.code,
        newPassword: this.newPassword
      }).then(() => {
        uni.hideLoading()
        
        uni.showToast({
          title: this.texts.resetSuccess,
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }).catch((error) => {
        uni.hideLoading()
        uni.showToast({
          title: error.message || this.texts.resetFailed,
          icon: 'none'
        })
      })
    }
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: #FFF9F5;
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
  background: #FF5A00;
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
  background: #FF5A00;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 40rpx;
}
</style>
