<template>
  <view class="login-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="login-container">
      <view class="login-header">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
        <text class="account-name">{{ texts.accountName }}</text>
      </view>

      <view class="login-form">
        <view class="login-tabs">
          <view
            :class="[
              'tab-item',
              { 'tab-active': loginType === 'login' || loginType === 'loginByCode' }
            ]"
            @click="switchLoginType(loginType === 'loginByCode' ? 'loginByCode' : 'login')"
          >
            {{ texts.loginTab }}
          </view>
          <view
            :class="['tab-item', { 'tab-active': loginType === 'register' }]"
            @click="switchLoginType('register')"
          >
            {{ texts.registerTab }}
          </view>
        </view>

        <!-- 登录方式切换 (仅在登录模式下显示) -->
        <view v-if="loginType === 'login' || loginType === 'loginByCode'" class="login-sub-tabs">
          <view
            :class="['sub-tab-item', { 'sub-tab-active': loginType === 'login' }]"
            @click="switchLoginType('login')"
          >
            {{ texts.passwordLoginTab }}
          </view>
          <view
            :class="['sub-tab-item', { 'sub-tab-active': loginType === 'loginByCode' }]"
            @click="switchLoginType('loginByCode')"
          >
            {{ texts.loginByCodeTab }}
          </view>
        </view>

        <view v-if="loginType === 'register'" class="form-item">
          <text class="form-label">{{ texts.usernameLabel }}</text>
          <input class="form-input" v-model="username" :placeholder="texts.usernamePlaceholder" />
        </view>

        <picker
          v-if="loginType === 'register'"
          mode="date"
          :value="birthday"
          @change="handleBirthdayChange"
        >
          <view class="form-item">
            <text class="form-label">{{ texts.birthdayLabel || '生日' }}</text>
            <view class="form-input birthday-display">
              <text :class="{ 'placeholder-text': !birthday }">{{
                birthday || texts.birthdayPlaceholder || '请选择生日'
              }}</text>
            </view>
          </view>
        </picker>

        <view class="form-item">
          <text class="form-label">{{ texts.emailLabel }}</text>
          <input class="form-input" v-model="email" :placeholder="texts.emailPlaceholder" />
        </view>

        <view v-if="loginType === 'register' || loginType === 'loginByCode'" class="form-item">
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

        <view v-if="loginType === 'login' || loginType === 'register'" class="form-item">
          <text class="form-label">{{ texts.passwordLabel }}</text>
          <input
            class="form-input"
            v-model="password"
            type="password"
            :placeholder="texts.passwordPlaceholder"
          />
        </view>

        <view v-if="loginType === 'register'" class="form-item">
          <text class="form-label">{{ texts.confirmPasswordLabel }}</text>
          <input
            class="form-input"
            v-model="confirmPassword"
            type="password"
            :placeholder="texts.confirmPasswordPlaceholder"
          />
        </view>

        <view class="agreement-item">
          <checkbox class="agreement-checkbox" :checked="agreed" @tap="toggleAgreement" />
          <text class="agreement-text">
            {{ texts.readAndAgree }}
            <text class="agreement-link" @click="handleUserAgreement">{{
              texts.userAgreement
            }}</text>
            、
            <text class="agreement-link" @click="handlePrivacy">{{ texts.privacyNotice }}</text>
            、
            <text class="agreement-link" @click="handleMixwareAgreement">{{
              texts.mixwareAgreement
            }}</text>
          </text>
        </view>

        <view v-if="loginType === 'register'" class="agreement-item">
          <checkbox class="agreement-checkbox" :checked="marketingOptIn" @tap="toggleMarketing" />
          <text class="agreement-text">{{ texts.marketingConsent || '同意接收营销推送信息' }}</text>
        </view>

        <button class="login-btn" @click="handleLogin">
          {{
            loginType === 'login' || loginType === 'loginByCode'
              ? texts.loginButton
              : texts.registerButton
          }}
        </button>
      </view>

      <view v-if="loginType === 'login'" class="third-party-login">
        <view class="divider">
          <text class="divider-text">{{ texts.thirdPartyLogin }}</text>
        </view>

        <view class="third-party-buttons">
          <view class="third-party-btn google-btn" @click="handleGoogleLogin">
            <text class="google-icon">G</text>
            <text class="third-party-text">{{ texts.googleLogin }}</text>
          </view>
          <view class="third-party-btn apple-btn" @click="handleAppleLogin">
            <text class="apple-icon"></text>
            <text class="third-party-text">{{ texts.appleLogin || 'Apple登录' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'
import {
  sendVerificationCodeWithHandler,
  loginWithPassword,
  registerWithHandler,
  thirdPartyLoginWithHandler,
  loginByCodeWithHandler
} from '@/api/users.ts'
import { getGoogleOAuthConfig, googleCallback, appleCallback, getAppleConfig } from '@/api/auth.ts'

export default {
  name: 'Login',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      loginType: 'login' as string,
      username: '' as string,
      email: '' as string,
      code: '' as string,
      password: '' as string,
      confirmPassword: '' as string,
      birthday: '' as string,
      marketingOptIn: false as boolean,
      agreed: false as boolean,
      countdown: 0 as number,
      timer: null as any
    }
  },

  mounted(): void {
    this.languageStore.loadLanguage()
    this.initializeTestUser()
    // #ifdef H5
    this.handleOAuthCallback()
    // #endif
  },

  beforeDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.login || {}
    }
  },

  methods: {
    handleBack(): void {
      uni.navigateBack()
    },

    handleOAuthCallback(): void {
      // #ifdef H5
      const urlParams = new URLSearchParams((window as any).location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')

      if (error) {
        uni.showToast({ title: this.texts.authFailed || '授权失败', icon: 'none' })
        return
      }

      if (code && state) {
        uni.showLoading({ title: this.texts.loggingIn || '登录中...' })
        try {
          if (state.startsWith('google_')) {
            googleCallback(code, state).then((result: unknown) => {
              this.handleOAuthResult(result as Record<string, unknown>)
            })
          }
          ;(window as any).history.replaceState({}, document.title, (window as any).location.pathname)
        } catch (err: unknown) {
          uni.hideLoading()
          uni.showToast({ title: this.texts.loginFailed || '登录失败', icon: 'none' })
        }
      }
      // #endif
    },

    switchLoginType(type: string): void {
      this.loginType = type
    },

    toggleAgreement(): void {
      this.agreed = !this.agreed
    },

    toggleMarketing(): void {
      this.marketingOptIn = !this.marketingOptIn
    },

    handleBirthdayChange(e: { detail: { value: string } }): void {
      this.birthday = e.detail.value
    },

    initializeTestUser(): void {
      const registeredUsers: Record<string, unknown>[] = uni.getStorageSync('registeredUsers') || []
      const hasTestUser = registeredUsers.some((user: Record<string, unknown>) => user.email === 'test@example.com')

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

    async handleGetCode(): Promise<void> {
      if (!this.email) {
        uni.showToast({
          title: this.texts.enterEmail,
          icon: 'none'
        })
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        uni.showToast({
          title: this.texts.enterEmail,
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: this.texts.sending || '发送中...'
        })

        await sendVerificationCodeWithHandler(this.email)

        uni.hideLoading()

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
          title: this.texts.codeSent,
          icon: 'success'
        })
      } catch (error: unknown) {
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.sendCodeFailed || '发送验证码失败',
          icon: 'none'
        })
      }
    },

    handleLogin(): void {
      if (!this.email) {
        uni.showToast({
          title: this.texts.enterEmail,
          icon: 'none'
        })
        return
      }

      if (this.loginType !== 'loginByCode' && !this.password) {
        uni.showToast({
          title: this.texts.enterPassword,
          icon: 'none'
        })
        return
      }

      if (this.loginType === 'register') {
        if (!this.username) {
          uni.showToast({
            title: this.texts.enterUsername,
            icon: 'none'
          })
          return
        }

        if (!this.code) {
          uni.showToast({
            title: this.texts.enterCode,
            icon: 'none'
          })
          return
        }

        if (!this.confirmPassword) {
          uni.showToast({
            title: this.texts.confirmPassword,
            icon: 'none'
          })
          return
        }

        if (this.password !== this.confirmPassword) {
          uni.showToast({
            title: this.texts.passwordsNotMatch,
            icon: 'none'
          })
          return
        }
      }

      if (!this.agreed) {
        uni.showToast({
          title: this.texts.agreeToTerms,
          icon: 'none'
        })
        return
      }

      if (this.loginType === 'login') {
        this.handlePasswordLogin()
      } else if (this.loginType === 'loginByCode') {
        this.handleCodeLogin()
      } else {
        this.handleRegister()
      }
    },

    async handleCodeLogin(): Promise<void> {
      if (!this.code) {
        uni.showToast({
          title: this.texts.enterCode,
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: this.texts.loggingIn || '登录中...'
        })

        await loginByCodeWithHandler(this.email, this.code)

        uni.hideLoading()

        uni.showToast({
          title: this.texts.loginSuccess,
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }, 500)
      } catch (error: unknown) {
        uni.hideLoading()
        console.error('登录失败:', error)
        uni.showToast({
          title: (error as Error).message || this.texts.loginFailed,
          icon: 'none'
        })
      }
    },

    async handlePasswordLogin(): Promise<void> {
      try {
        uni.showLoading({
          title: this.texts.loggingIn || '登录中...'
        })

        await loginWithPassword(this.email, this.password)

        uni.hideLoading()

        uni.showToast({
          title: this.texts.loginSuccess,
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }, 500)
      } catch (error: unknown) {
        uni.hideLoading()

        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.countdown = 0

        uni.showToast({
          title: (error as Error).message || this.texts.loginFailed,
          icon: 'none'
        })
      }
    },

    async handleRegister(): Promise<void> {
      try {
        uni.showLoading({
          title: this.texts.registering || '注册中...'
        })

        await registerWithHandler({
          username: this.username,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          verificationCode: this.code,
          birthday: this.birthday,
          privacyAgreed: true,
          marketingOptIn: this.marketingOptIn
        })

        uni.hideLoading()

        uni.showToast({
          title: this.texts.registerSuccess,
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }, 500)
      } catch (error: unknown) {
        uni.hideLoading()

        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.countdown = 0

        uni.showToast({
          title: (error as Error).message || this.texts.registerFailed,
          icon: 'none'
        })
      }
    },

    handleUserAgreement(): void {
      uni.navigateTo({
        url: '/pagesMember/agreements/loginUserAgreement/loginUserAgreement'
      })
    },

    handlePrivacy(): void {
      uni.navigateTo({
        url: '/pagesMember/agreements/loginPrivacy/loginPrivacy'
      })
    },

    handleMixwareAgreement(): void {
      uni.navigateTo({
        url: '/pagesMember/agreements/loginMixwareAgreement/loginMixwareAgreement'
      })
    },

    async handleGoogleLogin(): Promise<void> {
      uni.showLoading({
        title: this.texts.loggingIn || '正在登录...'
      })

      try {
        // #ifdef H5
        const config = await getGoogleOAuthConfig() as { code: number; data?: { clientId: string; redirectUri: string } }
        if (config.code === 1 || config.code === 0) {
          const { clientId, redirectUri } = config.data || { clientId: '', redirectUri: '' }
          const state = 'google_' + Date.now()
          uni.setStorageSync('oauth_state', state)
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile email&state=${state}`
          ;(window as any).location.href = authUrl
        }
        // #endif

        // #ifdef APP-PLUS
        const appConfig = await getGoogleOAuthConfig() as { code: number; data?: { clientId: string; redirectUri: string } }
        if (appConfig.code === 1 || appConfig.code === 0) {
          const { clientId, redirectUri } = appConfig.data || { clientId: '', redirectUri: '' }
          const plusObj = plus as unknown as Record<string, unknown>
          const oauth = plusObj.oauth as { getServices: (cb: (services: Record<string, unknown>[]) => void) => void }
          oauth.getServices((services: Record<string, unknown>[]) => {
            const google = services.find((s: Record<string, unknown>) => s.id === 'google')
            if (google) {
              const googleAuth = google as { authorize: (success: (e: Record<string, unknown>) => void, fail: (err: unknown) => void) => void }
              googleAuth.authorize(
                async (e: Record<string, unknown>) => {
                  const result = await googleCallback(e.code as string, '')
                  this.handleOAuthResult(result as Record<string, unknown>)
                },
                (err: unknown) => {
                  uni.hideLoading()
                  uni.showToast({ title: this.texts.authFailed || '授权失败', icon: 'none' })
                }
              )
            } else {
              uni.hideLoading()
              uni.showToast({
                title: this.texts.googleNotSupported || '暂不支持Google登录',
                icon: 'none'
              })
            }
          })
        }
        // #endif
      } catch (error: unknown) {
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.googleLoginFailed,
          icon: 'none'
        })
      }
    },

    async handleAppleLogin(): Promise<void> {
      uni.showLoading({
        title: this.texts.loggingIn || '正在登录...'
      })

      try {
        // #ifdef H5
        if (typeof (window as any).AppleID === 'undefined') {
          uni.hideLoading()
          uni.showToast({
            title: this.texts.appleNotAvailable || 'Apple登录暂不可用',
            icon: 'none'
          })
          return
        }
        try {
          const config = await getAppleConfig() as { code: number; data?: { clientId: string; redirectUri: string } }
          if (config.code !== 1 && config.code !== 0) {
            uni.hideLoading()
            uni.showToast({ title: this.texts.configFetchFailed || '配置获取失败', icon: 'none' })
            return
          }
          const configData = config.data || { clientId: '', redirectUri: '' }
          ;(window as any).AppleID.auth.init({
            clientId: configData.clientId,
            scope: 'name email',
            redirectURI: configData.redirectUri,
            usePopup: true
          })
          const response = await (window as any).AppleID.auth.signIn()

          const auth = response.authorization
          const userData = response.user || {}

          if (userData.name) {
            const fullName =
              `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim()
            uni.setStorageSync('apple_user_name', fullName)
          }
          if (userData.email) {
            uni.setStorageSync('apple_user_email', userData.email)
          }

          const result = await appleCallback({
            code: auth.code,
            id_token: auth.id_token,
            user: auth.user,
            email: userData.email || uni.getStorageSync('apple_user_email') || '',
            name: uni.getStorageSync('apple_user_name') || ''
          })
          this.handleOAuthResult(result as Record<string, unknown>)
        } catch (err: unknown) {
          uni.hideLoading()
          const errData = err as Record<string, unknown>
          if (errData.error === 'user_cancelled_authorize') {
            uni.showToast({ title: this.texts.userCancelledAuth || '用户取消授权', icon: 'none' })
          } else {
            uni.showToast({ title: this.texts.authFailed || '授权失败', icon: 'none' })
          }
        }
        // #endif

        // #ifdef APP-PLUS
        uni.login({
          provider: 'apple',
          success: (loginRes: UniApp.LoginRes) => {
            uni.getUserInfo({
              provider: 'apple',
              success: async (info) => {
                const infoData = info as unknown as Record<string, unknown>
                const auth = (infoData.authResult || infoData.userInfo || {}) as Record<string, unknown>
                const userInfo = (infoData.userInfo || {}) as Record<string, unknown>

                const code = auth.code || auth.authorizationCode
                const identityToken = auth.identityToken || auth.id_token
                const user = auth.user || userInfo.openId
                const fullNameInfo = userInfo.fullName || userInfo.name || {}
                const fullName = typeof fullNameInfo === 'object' 
                  ? `${(fullNameInfo as Record<string, string>).firstName || ''} ${(fullNameInfo as Record<string, string>).lastName || ''}`.trim()
                  : String(fullNameInfo || '')
                const email = userInfo.email

                if (fullName) {
                  uni.setStorageSync('apple_user_name', fullName)
                }
                if (email) {
                  uni.setStorageSync('apple_user_email', email)
                }

                try {
                  const result = await appleCallback({
                    code,
                    id_token: identityToken,
                    user,
                    email: email || uni.getStorageSync('apple_user_email') || '',
                    name: uni.getStorageSync('apple_user_name') || fullName || ''
                  })
                  this.handleOAuthResult(result as unknown as Record<string, unknown>)
                } catch (err: unknown) {
                  uni.hideLoading()
                  uni.showToast({ title: this.texts.loginFailed || '登录失败', icon: 'none' })
                }
              },
              fail: () => {
                uni.hideLoading()
                uni.showToast({
                  title: this.texts.getUserInfoFailed || '获取用户信息失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err: UniApp.GeneralCallbackResult) => {
            uni.hideLoading()
            if (err.errMsg?.includes('cancel')) {
              uni.showToast({ title: this.texts.userCancelledAuth || '用户取消授权', icon: 'none' })
            } else {
              uni.showToast({ title: this.texts.authFailed || '授权失败', icon: 'none' })
            }
          }
        })
        // #endif
      } catch (error: unknown) {
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.appleLoginFailed || 'Apple登录失败',
          icon: 'none'
        })
      }
    },

    handleOAuthResult(result: Record<string, unknown>): void {
      uni.hideLoading()
      const code = result.code as number
      if (code === 1 || code === 0) {
        const data = result.data as Record<string, unknown> | undefined
        const { token, userId, username, avatarUrl } = data || {}
        uni.setStorageSync('token', token)
        uni.setStorageSync('userInfo', { userId, username, avatarUrl })
        uni.showToast({ title: String(this.texts.loginSuccess || '登录成功'), icon: 'success' })
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }, 500)
      } else {
        uni.showToast({ title: String(result.msg || this.texts.loginFailed || '登录失败'), icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #fff9f5;
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
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.login-tabs {
  display: flex;
  margin-bottom: 20rpx;
  border-bottom: 2rpx solid #eee;
}

.login-sub-tabs {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 40rpx;
}

.sub-tab-item {
  font-size: 26rpx;
  color: #999;
  padding: 10rpx 20rpx;
  position: relative;
}

.sub-tab-active {
  color: #ff5a00;
  font-weight: bold;
}

.sub-tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20rpx;
  right: 20rpx;
  height: 4rpx;
  background-color: #ff5a00;
  border-radius: 2rpx;
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
  color: #ff5a00;
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
  background-color: #ff5a00;
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

.birthday-display {
  display: flex;
  align-items: center;
}

.placeholder-text {
  color: #999;
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
  background-color: #ff5a00;
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
  align-items: center;
  margin-bottom: 30rpx;
  margin-top: -10rpx;
  line-height: 1.5;
}

.agreement-checkbox {
  margin-right: 16rpx;
  transform: scale(0.8);
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #666;
}

.agreement-link {
  color: #ff5a00;
  text-decoration: none;
  font-size: 24rpx;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  background-color: #ff5a00;
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
  background-color: #fff9f5;
  padding: 0 30rpx;
  font-size: 24rpx;
  color: #999;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.third-party-btn {
  flex: 1;
  max-width: 300rpx;
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

.apple-btn {
  border-color: #ddd;
  background-color: #000;
}

.apple-btn .third-party-text {
  color: #fff;
}

.google-icon {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(
    135deg,
    #4285f4 0%,
    #34a853 25%,
    #fbbc05 50%,
    #ea4335 75%,
    #4285f4 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.apple-icon {
  width: 40rpx;
  height: 40rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23fff' d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.third-party-text {
  font-size: 26rpx;
  color: #333;
}
</style>
