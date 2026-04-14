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
      <button class="submit-btn" @click="handleSubmit">{{ texts.submitButton }}</button>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'
import { sendVerificationCode, updateUserInfo } from '@/api/users.ts'

export default {
  name: 'EmailBinding',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      email: '' as string,
      code: '' as string,
      countdown: 0 as number,
      timer: null as ReturnType<typeof setInterval> | null,
      isEditing: false as boolean
    }
  },

  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    userStore(): ReturnType<typeof useUserStore> {
      return useUserStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.accountSecurity.emailBinding
    },
    hasEmail(): boolean {
      return !!this.email
    },
    isChangeEmail(): boolean {
      return this.hasEmail && this.isEditing
    }
  },

  mounted(): void {
    this.languageStore.loadLanguage()
    this.loadUserInfo()
  },

  beforeDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  methods: {
    loadUserInfo(): void {
      const userInfo = this.userStore.userInfo
      if (userInfo?.email) {
        this.email = String(userInfo.email)
      }
    },
    handleChangeEmail(): void {
      this.isEditing = true
      this.email = ''
      this.code = ''
    },
    handleBack(): void {
      uni.navigateBack()
    },

    async handleGetCode(): Promise<void> {
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
            clearInterval(this.timer as ReturnType<typeof setInterval>)
          }
        }, 1000)

        uni.showToast({
          title: this.texts.codeSent,
          icon: 'success'
        })
      } catch (error) {
        const err = error as Error & { msg?: string }
        uni.showToast({
          title: err?.msg || this.texts.codeSendFailed,
          icon: 'none'
        })
      }
    },

    async handleSubmit(): Promise<void> {
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

        const userInfo = this.userStore.userInfo
        await updateUserInfo({
          username: userInfo?.userName,
          avatar: userInfo?.avatar,
          email: this.email,
          birthday: userInfo?.birthday
        })

        if (userInfo) {
          userInfo.email = this.email
          uni.setStorageSync('userInfo', userInfo)
          uni.$emit('profileUpdate', userInfo)
        }

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
      } catch (error: unknown) {
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.bindFailed,
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
  background: #ff5a00;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 40rpx;
}
</style>
