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
            :class="['tab-item', { 'tab-active': loginType === 'code' }]" 
            @click="switchLoginType('code')"
          >
            验证码登录
          </view>
          <view 
            :class="['tab-item', { 'tab-active': loginType === 'password' }]" 
            @click="switchLoginType('password')"
          >
            密码登录
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input class="form-input" v-model="email" placeholder="请输入邮箱地址" />
        </view>
        
        <view v-if="loginType === 'code'" class="form-item">
          <text class="form-label">验证码</text>
          <view class="code-input-container">
            <input class="form-input code-input" v-model="code" placeholder="请输入验证码" />
            <button class="code-btn" @click="handleGetCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>
        
        <view v-if="loginType === 'password'" class="form-item">
          <text class="form-label">密码</text>
          <input class="form-input" v-model="password" type="password" placeholder="请输入密码" />
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
        
        <view class="auto-register-hint">未注册的邮箱将自动创建账号</view>
        
        <button class="login-btn" @click="handleLogin">登录</button>
      </view>
      
      <view class="third-party-login">
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
export default {
  name: 'Login',
  data() {
    return {
      loginType: 'code',
      email: '',
      code: '',
      password: '',
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
      // 初始化测试用户
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      
      // 检查是否已有测试用户
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
    
    handleGetCode() {
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
      
      // 检查是否已阅读协议
      if (!this.agreed) {
        uni.showToast({
          title: '请先阅读并同意用户协议',
          icon: 'none'
        })
        return
      }
      
      // 生成验证码（实际项目中应该是服务端发送）
      const verificationCode = '123456'
      
      // 保存验证码到本地存储（实际项目中应该保存在服务端）
      const verificationCodes = uni.getStorageSync('verificationCodes') || {}
      verificationCodes[this.email] = {
        code: verificationCode,
        time: Date.now()
      }
      uni.setStorageSync('verificationCodes', verificationCodes)
      
      // 开始倒计时
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
      
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    },
    
    handleLogin() {
      if (!this.email) {
        uni.showToast({
          title: '请填写邮箱',
          icon: 'none'
        })
        return
      }
      
      if (this.loginType === 'code') {
        if (!this.code) {
          uni.showToast({
            title: '请填写验证码',
            icon: 'none'
          })
          return
        }
      } else {
        if (!this.password) {
          uni.showToast({
            title: '请填写密码',
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
      
      if (this.loginType === 'code') {
        this.handleCodeLogin()
      } else {
        this.handlePasswordLogin()
      }
    },
    
    handleCodeLogin() {
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      const verificationCodes = uni.getStorageSync('verificationCodes') || {}
      
      const emailCode = verificationCodes[this.email]
      if (!emailCode || emailCode.code !== this.code) {
        uni.showToast({
          title: '验证码错误',
          icon: 'none'
        })
        return
      }
      
      let user = registeredUsers.find(u => u.email === this.email)
      
      if (!user) {
        user = {
          id: Date.now(),
          email: this.email,
          code: this.code,
          nickname: this.email.split('@')[0],
          avatar: '',
          region: '',
          gender: ''
        }
        registeredUsers.push(user)
        uni.setStorageSync('registeredUsers', registeredUsers)
      }
      
      const userInfo = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar || '',
        region: user.region || '',
        gender: user.gender || ''
      }
      
      this.loginSuccess(userInfo)
    },
    
    handlePasswordLogin() {
      const registeredUsers = uni.getStorageSync('registeredUsers') || []
      
      let user = registeredUsers.find(u => u.email === this.email)
      
      if (!user) {
        uni.showToast({
          title: '账号不存在',
          icon: 'none'
        })
        return
      }
      
      if (user.password !== this.password) {
        uni.showToast({
          title: '密码错误',
          icon: 'none'
        })
        return
      }
      
      const userInfo = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar || '',
        region: user.region || '',
        gender: user.gender || ''
      }
      
      this.loginSuccess(userInfo)
    },
    
    loginSuccess(userInfo) {
      // 保存用户信息到本地存储
      uni.setStorageSync('userInfo', userInfo)
      uni.setStorageSync('isLoggedIn', true)
      
      console.log('Login - 保存用户信息:', userInfo)
      console.log('Login - 设置登录状态:', true)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 使用事件通信通知上一页刷新
      uni.$emit('userLogin', userInfo)
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    },
    
    handleUserAgreement() {
      uni.navigateTo({
        url: '/pages/auth/loginUserAgreement/loginUserAgreement'
      })
    },
    
    handlePrivacy() {
      uni.navigateTo({
        url: '/pages/auth/loginPrivacy/loginPrivacy'
      })
    },
    
    handleMixwareAgreement() {
      uni.navigateTo({
        url: '/pages/auth/loginMixwareAgreement/loginMixwareAgreement'
      })
    },
    
    handleGoogleLogin() {
      uni.showLoading({
        title: '正在登录...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        const userInfo = {
          id: Date.now(),
          nickname: 'Google用户',
          email: 'google@example.com',
          avatar: '',
          region: '',
          gender: ''
        }
        
        this.loginSuccess(userInfo)
      }, 1500)
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
  padding: 40rpx 30rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  padding-top: 80rpx;
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