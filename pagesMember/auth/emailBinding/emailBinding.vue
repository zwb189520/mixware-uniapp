<template>
  <view class="email-binding-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="content" v-if="hasEmail && !isEditing">
      <view class="bound-item">
        <text class="bound-label">{{ texts.boundEmail }}</text>
        <text class="bound-value">{{ email }}</text>
      </view>
      <button class="change-btn" @click="handleChangeEmail">{{ texts.changeEmail }}</button>
    </view>
    <view class="content" v-else>
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
      <button class="submit-btn" @click="handleSubmit">{{ texts.submitButton }}</button>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { sendVerificationCode, updateUserInfo } from '@/api/users.ts'

export default {
  name: 'EmailBinding',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      email: '',
      code: '',
      countdown: 0,
      timer: null,
      isEditing: false
    }
  },
  
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.accountSecurity.emailBinding
    },
    hasEmail() {
      return !!this.email
    },
    isChangeEmail() {
      return this.hasEmail && this.isEditing
    }
  },
  
  mounted() {
    this.languageStore.loadLanguage()
    this.loadUserInfo()
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      if (userInfo.email) {
        this.email = userInfo.email
      }
    },
    handleChangeEmail() {
      this.isEditing = true
      this.email = ''
      this.code = ''
    },
    handleBack() {
      uni.navigateBack()
    },
    
    async handleGetCode() {
      if (!this.email) {
        uni.showToast({
          title: this.texts.enterEmail,
          icon: 'none'
        })
        return
      }
      
      try {
        await sendVerificationCode({ email: this.email })
        
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
      } catch (error) {
        uni.showToast({
          title: error.msg || this.texts.codeSendFailed,
          icon: 'none'
        })
      }
    },
    
    async handleSubmit() {
      if (!this.email || !this.code) {
        uni.showToast({
          title: this.texts.fillAllFields,
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: this.texts.binding
        })
        
        const userInfo = uni.getStorageSync('userInfo') || {}
        await updateUserInfo({
          username: userInfo.username,
          avatarUrl: userInfo.avatar,
          email: this.email,
          birthday: userInfo.birthday
        })
        
        userInfo.email = this.email
        uni.setStorageSync('userInfo', userInfo)
        uni.$emit('profileUpdate', userInfo)
        
        uni.hideLoading()
        
        uni.showToast({
          title: this.texts.bindSuccess,
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.clearStorage()
          uni.$emit('userLogout')
          uni.reLaunch({
            url: '/pagesMember/auth/login/login'
          })
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.msg || this.texts.bindFailed,
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.email-binding-page {
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

.bound-item {
  background: #fff;
  padding: 40rpx 30rpx;
  border-radius: 16rpx;
}

.bound-label {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.bound-value {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.change-btn {
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


