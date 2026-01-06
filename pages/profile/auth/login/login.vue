<template>
  <view class="login-page">
    <view class="login-container">
      <view class="login-header">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
        <text class="account-name">mixware账户</text>
      </view>
      
      <view class="login-form">
        <view class="login-tabs">
          <view 
            :class="['tab-item', { 'tab-active': loginType === 'login' }]" 
            @click="switchLoginType('login')"
          >
            登录
          </view>
          <view 
            :class="['tab-item', { 'tab-active': loginType === 'register' }]" 
            @click="switchLoginType('register')"
          >
            注册
          </view>
        </view>
        
        <view v-if="loginType === 'register'" class="form-item">
          <text class="form-label">用户名</text>
          <input class="form-input" v-model="username" placeholder="请输入用户名" />
        </view>
        
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input class="form-input" v-model="email" placeholder="请输入邮箱地址" />
        </view>
        
        <view v-if="loginType === 'register'" class="form-item">
          <text class="form-label">验证码</text>
          <view class="code-input-container">
            <input class="form-input code-input" v-model="code" placeholder="请输入验证码" />
            <button class="code-btn" @click="handleGetCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">密码</text>
          <input class="form-input" v-model="password" type="password" placeholder="请输入密码" />
        </view>
        
        <view v-if="loginType === 'register'" class="form-item">
          <text class="form-label">确认密码</text>
          <input class="form-input" v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
        </view>
        
        <view class="agreement-item">
          <checkbox class="agreement-checkbox" :checked="agreed" @tap="toggleAgreement" />
          <text class="agreement-text">
            我已阅读
            <text class="agreement-link" @click="handleUserAgreement">《用户协议》</text>
            、
            <text class="agreement-link" @click="handlePrivacy">《隐私通知》</text>
            、
            <text class="agreement-link" @click="handleMixwareAgreement">《mixware用户协议》</text>
          </text>
        </view>
        
        <button class="login-btn" @click="handleLogin">{{ loginType === 'login' ? '登录' : '注册' }}</button>
      </view>
      
      <view v-if="loginType === 'login'" class="third-party-login">
        <view class="divider">
          <text class="divider-text">第三方登录</text>
        </view>
        
        <view class="third-party-buttons">
          <view class="third-party-btn google-btn" @click="handleGoogleLogin">
            <text class="google-icon">G</text>
            <text class="third-party-text">Google登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { sendVerificationCodeWithHandler, loginWithPassword, registerWithHandler, thirdPartyLoginWithHandler } from '@/api/users.js'

export default {
  name: 'Login',
  data() {
    return {
      loginType: 'login',
      username: '',
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
      agreed: false,
      countdown: 0,
      timer: null
    }
  },
  
  mounted() {
    this.initializeTestUser()
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    switchLoginType(type) {
      this.loginType = type
    },
    
    toggleAgreement() {
      this.agreed = !this.agreed
    },
    
    initializeTestUser() {
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      const hasTestUser = registeredUsers.some(user => user.email === 'test@example.com')
      
      if (!hasTestUser) {
        const testUser = {
          id: 1,
          email: 'test@example.com',
          code: '123456',
          nickname: '测试用户',
          avatar: '',
          region: '北京市',
          gender: '男'
        }
        
        registeredUsers.push(testUser)
        uni.setStorageSync('registeredUsers', registeredUsers)
      }
    },
    
    async handleGetCode() {
      if (!this.email) {
        uni.showToast({
          title: '请先输入邮箱地址',
          icon: 'none'
        })
        return
      }
      
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        uni.showToast({
          title: '请输入正确的邮箱地址',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '发送中...'
        })
        
        await sendVerificationCodeWithHandler(this.email)
        
        uni.hideLoading()
        
        // 倒计时
        this.countdown = 60
        this.timer = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--
          } else {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
        
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '发送验证码失败',
          icon: 'none'
        })
      }
    },
    
    handleLogin() {
      if (!this.email) {
        uni.showToast({
          title: '请填写邮箱',
          icon: 'none'
        })
        return
      }
      
      if (!this.password) {
        uni.showToast({
          title: '请填写密码',
          icon: 'none'
        })
        return
      }
      
      if (this.loginType === 'register') {
        if (!this.username) {
          uni.showToast({
            title: '请填写用户名',
            icon: 'none'
          })
          return
        }
        
        if (!this.code) {
          uni.showToast({
            title: '请填写验证码',
            icon: 'none'
          })
          return
        }
        
        if (!this.confirmPassword) {
          uni.showToast({
            title: '请确认密码',
            icon: 'none'
          })
          return
        }
        
        if (this.password !== this.confirmPassword) {
          uni.showToast({
            title: '两次密码不一致',
            icon: 'none'
          })
          return
        }
      }
      
      if (!this.agreed) {
        uni.showToast({
          title: '请先阅读并同意用户协议',
          icon: 'none'
        })
        return
      }
      
      if (this.loginType === 'login') {
        this.handlePasswordLogin()
      } else {
        this.handleRegister()
      }
    },
    
    async handlePasswordLogin() {
      try {
        uni.showLoading({
          title: '登录中...'
        })
        
        await loginWithPassword(this.email, this.password)
        
        uni.hideLoading()
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.countdown = 0
        
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      }
    },
    
    async handleRegister() {
      try {
        uni.showLoading({
          title: '注册中...'
        })
        
        await registerWithHandler({
          username: this.username,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          verificationCode: this.code,
          privacyAgreed: true
        })
        
        uni.hideLoading()
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.countdown = 0
        
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        })
      }
    },
    
    handleUserAgreement() {
      uni.navigateTo({
        url: '/pages/profile/auth/loginUserAgreement/loginUserAgreement'
      })
    },
    
    handlePrivacy() {
      uni.navigateTo({
        url: '/pages/profile/auth/loginPrivacy/loginPrivacy'
      })
    },
    
    handleMixwareAgreement() {
      uni.navigateTo({
        url: '/pages/profile/auth/loginMixwareAgreement/loginMixwareAgreement'
      })
    },
    
    async handleGoogleLogin() {
      uni.showLoading({
        title: '正在登录...'
      })
      
      try {
        // 模拟Google登录，实际项目中需要集成Google SDK
        const googleCode = 'mock_google_code_' + Date.now()
        
        await thirdPartyLoginWithHandler('google', googleCode, {
          nickname: 'Google用户',
          email: 'google@example.com',
          avatarUrl: ''
        })
        
        uni.hideLoading()
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || 'Google登录失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  padding: 20rpx 30rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  padding-top: 20rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.account-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.login-form {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.login-tabs {
  display: flex;
  margin-bottom: 40rpx;
  border-bottom: 2rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  cursor: pointer;
}

.tab-active {
  color: #007aff;
  font-weight: 600;
}

.tab-active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #007aff;
  border-radius: 2rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.auto-register-hint {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: -30rpx;
}

.login-form {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
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
  align-items: center;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 200rpx;
  height: 80rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn:disabled {
  background-color: #ccc;
}

.agreement-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
  margin-top: -20rpx;
  line-height: 1.5;
}

.agreement-checkbox {
  margin-right: 16rpx;
  margin-top: 4rpx;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #666;
}

.agreement-link {
  color: #007aff;
  text-decoration: none;
  font-size: 24rpx;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.third-party-login {
  margin-top: 60rpx;
}

.divider {
  text-align: center;
  margin-bottom: 40rpx;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2rpx;
  background-color: #eee;
}

.divider-text {
  background-color: #f5f5f5;
  padding: 0 30rpx;
  font-size: 24rpx;
  color: #999;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
}

.third-party-btn {
  flex: 1;
  max-width: 400rpx;
  height: 80rpx;
  background-color: #fff;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.google-btn {
  border-color: #ddd;
}

.google-icon {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #4285F4 0%, #34A853 25%, #FBBC05 50%, #EA4335 75%, #4285F4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.third-party-text {
  font-size: 26rpx;
  color: #333;
}
</style>