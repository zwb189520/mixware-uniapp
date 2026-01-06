<template>
	<view class="login-page">
		<!-- 顶部导航栏 -->
		<view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">{{ texts.pageTitle }}</text>
			<view></view>
		</view>
		
		<!-- 登录/注册表单 -->
		<view class="login-form">
			<!-- 切换登录/注册 -->
			<view class="tab-bar">
				<view 
					class="tab-item" 
					:class="{ active: isLogin }"
					@tap="switchToLogin"
				>
					{{ texts.tabs.login }}
				</view>
				<view 
					class="tab-item" 
					:class="{ active: !isLogin }"
					@tap="switchToRegister"
				>
					{{ texts.tabs.register }}
				</view>
			</view>
			
			<!-- 登录表单 -->
			<view v-if="isLogin" class="form-container">
				<uni-forms ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
					<uni-forms-item name="email">
						<uni-easyinput 
							v-model="loginForm.email" 
							:placeholder="texts.login.emailPlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="email"
						></uni-easyinput>
					</uni-forms-item>
					
					<uni-forms-item name="password">
						<uni-easyinput 
							v-model="loginForm.password" 
							type="password"
							:placeholder="texts.login.passwordPlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="locked"
						></uni-easyinput>
					</uni-forms-item>
				</uni-forms>
				
				<button class="login-btn" @tap="handleLogin" :loading="submitting">{{ texts.login.button }}</button>

				<!-- 第三方登录入口 -->
				<view class="third-party">
					<view class="third-title">{{ texts.login.thirdPartyTitle }}</view>
					<button class="google-btn" @tap="handleGoogleLogin">
						<text class="google-text">{{ texts.login.googleButton }}</text>
					</button>
					<!-- 苹果登录（仅iOS显示） -->
					<!-- #ifdef APP-PLUS -->
					<button 
						v-if="isIOS" 
						class="apple-btn" 
						@tap="handleAppleLogin"
					>
						<text class="apple-text">{{ texts.login.appleButton }}</text>
					</button>
					<!-- #endif -->
				</view>
			</view>
			
			<!-- 注册表单 -->
			<view v-else class="form-container">
				<uni-forms ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0">
					<uni-forms-item name="username">
						<uni-easyinput 
							v-model="registerForm.username" 
							:placeholder="texts.register.usernamePlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="person"
						></uni-easyinput>
					</uni-forms-item>
					
					<uni-forms-item name="email">
						<uni-easyinput 
							v-model="registerForm.email" 
							:placeholder="texts.register.emailPlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="email"
						></uni-easyinput>
					</uni-forms-item>
					
					<uni-forms-item name="verificationCode">
						<view class="code-input-wrapper">
							<uni-easyinput 
								v-model="registerForm.verificationCode" 
								:placeholder="texts.login.verificationCodePlaceholder"
								:clearable="true"
								:styles="inputStyles"
								prefixIcon="locked"
								class="code-input"
							></uni-easyinput>
							<button 
								class="send-code-btn" 
								:disabled="codeCountdown > 0 || sendingCode"
								@tap="sendVerificationCode"
							>
								{{ codeCountdown > 0 ? `${codeCountdown}${texts.login.countdown}` : (sendingCode ? texts.common.loading : texts.login.sendCode) }}
							</button>
						</view>
					</uni-forms-item>
					
					<uni-forms-item name="password">
						<uni-easyinput 
							v-model="registerForm.password" 
							type="password"
							:placeholder="texts.register.passwordPlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="locked"
						></uni-easyinput>
					</uni-forms-item>
					
					<uni-forms-item name="confirmPassword">
						<uni-easyinput 
							v-model="registerForm.confirmPassword" 
							type="password"
							:placeholder="texts.register.confirmPlaceholder"
							:clearable="true"
							:styles="inputStyles"
							prefixIcon="locked"
						></uni-easyinput>
					</uni-forms-item>
				
				<view class="form-item">
					<text class="label">{{ texts.register.birthdayLabel }}</text>
					<uni-datetime-picker
						type="date"
						:value="registerForm.birthday"
						:start="startDate"
						:end="endDate"
						:placeholder="texts.register.birthdayPlaceholder"
						@change="onBirthdayChange"
					></uni-datetime-picker>
				</view>
				
					<uni-forms-item name="countryCode">
						<uni-easyinput 
							v-model="registerForm.countryCode" 
							:placeholder="texts.register.countryPlaceholder"
							:clearable="true"
							:styles="inputStyles"
						></uni-easyinput>
					</uni-forms-item>
				</uni-forms>
				
				<view class="checkbox-item">
					<checkbox-group @change="onPrivacyChange">
						<label class="checkbox-label">
							<checkbox value="privacy" :checked="registerForm.privacyAgreed" />
							<text class="checkbox-text">{{ texts.register.privacyText }}</text>
						</label>
					</checkbox-group>
				</view>
				
				<view class="checkbox-item">
					<checkbox-group @change="onMarketingChange">
						<label class="checkbox-label">
							<checkbox value="marketing" :checked="registerForm.marketingOptIn" />
							<text class="checkbox-text">{{ texts.register.marketingText }}</text>
						</label>
					</checkbox-group>
				</view>
				
				<button class="login-btn" @tap="handleRegister" :loading="submitting">{{ texts.register.button }}</button>
			</view>
		</view>
	</view>
</template>

<script>
import { post } from '@/utils/request.js'
import { authorize, getOAuthConfig, handleOAuthCallback, generateAuthUrl } from '@/utils/googleOAuth.js'

export default {
		data() {
			// 计算日期范围：最早100年前，最晚今天
			const today = new Date()
			const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
			const minDate = `${today.getFullYear() - 100}-01-01`
			
			return {
				isLogin: true, // true: 登录模式, false: 注册模式
				submitting: false,
				statusBarHeight: 0,
				isIOS: false, // 是否为iOS平台
				startDate: minDate, // 最早日期
				endDate: maxDate, // 最晚日期（今天）
				loginForm: {
					email: '',
					password: ''
				},
				registerForm: {
					username: '',
					email: '',
					verificationCode: '',
					password: '',
					confirmPassword: '',
					birthday: '',
					countryCode: '',
					privacyAgreed: true,
					marketingOptIn: true
				},
				codeCountdown: 0, // 验证码倒计时
				sendingCode: false, // 是否正在发送验证码
				countdownTimer: null, // 倒计时定时器
				// 输入框样式配置
				inputStyles: {
					borderColor: '#e5e5e5',
					color: '#333'
				},
				loginRules: {},
				registerRules: {},
				language: 'zh',
				// 存储 Google 返回的用户信息，供后端 thirdPartyLogin 使用
				googleUserInfo: {
					nickname: '',
					avatarUrl: ''
				}
			}
		},
	onLoad(options) {
		this.syncLanguage();
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 0
		
		// 检测是否为iOS平台
		// #ifdef APP-PLUS
		this.isIOS = systemInfo.platform === 'ios' || systemInfo.osName === 'iOS'
		// #endif
		
		// H5 端：检查是否是 Google OAuth 回调
		// #ifdef H5
		this.handleGoogleOAuthCallback()
		// #endif
		
		// APP 端：检查是否是从外部浏览器跳转回来的
		// #ifdef APP-PLUS
		if (options && options.oauth_callback) {
			// 从 URL Scheme 跳转回来，可能携带回调参数
			console.log('从外部浏览器跳转回 APP，回调参数:', options);
			// 可以在这里处理回调
		}
		// #endif
	},
	onShow() {
		this.syncLanguage();
	},
	onUnload() {
		// 清理定时器
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer);
			this.countdownTimer = null;
		}
	},
	computed: {
		texts() {
			const zh = {
				pageTitle: '登录/注册',
				common: {
					loading: '加载中...'
				},
				tabs: {
					login: '登录',
					register: '注册'
				},
				login: {
					emailPlaceholder: '请输入邮箱',
					passwordPlaceholder: '请输入密码',
					button: '登录',
					thirdPartyTitle: '或使用其他方式',
					googleButton: '使用 Google 登录',
					appleButton: '使用 Apple 登录',
					googleComingSoon: '暂未接入，敬请期待',
					appleComingSoon: '暂未接入，敬请期待',
					verificationCode: '验证码',
					verificationCodePlaceholder: '请输入验证码',
					sendCode: '发送验证码',
					resendCode: '重新发送',
					countdown: '秒后重试',
					sendCodeSuccess: '验证码已发送',
					sendCodeFailed: '发送验证码失败',
					codeRequired: '请输入验证码',
					codeInvalid: '验证码不正确',
					codeExpired: '验证码已过期，请重新获取'
				},
				register: {
					usernamePlaceholder: '请输入用户名',
					emailPlaceholder: '请输入邮箱',
					passwordPlaceholder: '请输入密码',
					confirmPlaceholder: '请再次输入密码',
					birthdayLabel: '生日',
					birthdayPlaceholder: '选填，请选择日期',
					countryPlaceholder: '选填，国家代码',
					privacyText: '我已阅读并同意隐私政策',
					marketingText: '接收营销信息（可选）',
					button: '注册'
				},
				toast: {
					loginSuccess: '登录成功',
					registerSuccess: '注册成功',
					privacyRequired: '请同意隐私政策',
					registerFailed: '注册失败，请稍后重试'
				},
				validation: {
					usernameRequired: '请输入用户名',
					emailRequired: '请输入邮箱',
					emailInvalid: '请输入正确的邮箱格式',
					passwordRequired: '请输入密码',
					passwordMin: '密码长度至少6位',
					confirmRequired: '请再次输入密码',
					passwordMismatch: '两次输入的密码不一致'
				},
				errorFallback: {
					registerFailed: '注册失败',
					registerFailedRetry: '注册失败，请稍后重试'
				}
			}
			const en = {
				pageTitle: 'Login / Sign up',
				common: {
					loading: 'Loading...'
				},
				tabs: {
					login: 'Login',
					register: 'Sign up'
				},
				login: {
					emailPlaceholder: 'Enter email',
					passwordPlaceholder: 'Enter password',
					button: 'Login',
					thirdPartyTitle: 'Or continue with',
					googleButton: 'Continue with Google',
					appleButton: 'Continue with Apple',
					googleComingSoon: 'Google login coming soon',
					appleComingSoon: 'Apple login coming soon',
					verificationCode: 'Verification Code',
					verificationCodePlaceholder: 'Enter verification code',
					sendCode: 'Send Code',
					resendCode: 'Resend',
					countdown: 's',
					sendCodeSuccess: 'Verification code sent',
					sendCodeFailed: 'Failed to send verification code',
					codeRequired: 'Please enter verification code',
					codeInvalid: 'Invalid verification code',
					codeExpired: 'Verification code expired, please resend'
				},
				register: {
					usernamePlaceholder: 'Enter username',
					emailPlaceholder: 'Enter email',
					passwordPlaceholder: 'Enter password',
					confirmPlaceholder: 'Re-enter password',
					birthdayLabel: 'Birthday',
					birthdayPlaceholder: 'Optional, select a date',
					countryPlaceholder: 'Optional, country code',
					privacyText: 'I have read and agree to the privacy policy',
					marketingText: 'Receive marketing messages (optional)',
					button: 'Sign up'
				},
				toast: {
					loginSuccess: 'Login succeeded',
					registerSuccess: 'Sign-up succeeded',
					privacyRequired: 'Please agree to the privacy policy',
					registerFailed: 'Sign-up failed, please try again later'
				},
				validation: {
					usernameRequired: 'Username is required',
					emailRequired: 'Email is required',
					emailInvalid: 'Please enter a valid email',
					passwordRequired: 'Password is required',
					passwordMin: 'Password must be at least 6 characters',
					confirmRequired: 'Please confirm your password',
					passwordMismatch: 'Passwords do not match'
				},
				errorFallback: {
					registerFailed: 'Sign-up failed',
					registerFailedRetry: 'Sign-up failed, please try again later'
				}
			}
			return this.language === 'en' ? en : zh
		}
	},
	methods: {
		syncLanguage() {
			try {
				const stored = uni.getStorageSync('appLanguage')
				if (stored === 'en' || stored === 'zh') {
					this.language = stored
				} else {
					this.language = 'zh'
				}
			} catch (e) {
				this.language = 'zh'
			}
			this.applyValidationRules()
		},
		applyValidationRules() {
			this.loginRules = this.buildLoginRules()
			this.registerRules = this.buildRegisterRules()
		},
		buildLoginRules() {
			return {
				email: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.emailRequired },
						{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMessage: this.texts.validation.emailInvalid }
					]
				},
				password: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.passwordRequired }
					]
				}
			}
		},
		buildRegisterRules() {
			return {
				username: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.usernameRequired }
					]
				},
				email: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.emailRequired },
						{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMessage: this.texts.validation.emailInvalid }
					]
				},
				password: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.passwordRequired },
						{ minLength: 6, errorMessage: this.texts.validation.passwordMin }
					]
				},
				confirmPassword: {
					rules: [
						{ required: true, errorMessage: this.texts.validation.confirmRequired },
						{
							validateFunction: (rule, value, data, callback) => {
								if (value !== data.password) {
									callback(this.texts.validation.passwordMismatch)
									return false
								}
								return true
							}
						}
					]
				},
				verificationCode: {
					rules: [
						{ required: true, errorMessage: this.texts.login.codeRequired }
					]
				}
			}
		},
		// 返回
		goBack() {
			uni.navigateBack();
		},
		// 切换到登录
		switchToLogin() {
			this.isLogin = true;
			// 清理验证码相关状态
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer);
				this.countdownTimer = null;
			}
			this.codeCountdown = 0;
			this.registerForm.verificationCode = '';
		},
		// 切换到注册
		switchToRegister() {
			this.isLogin = false;
		},
		// 隐私政策复选框变化
		onPrivacyChange(e) {
			this.registerForm.privacyAgreed = e.detail.value.includes('privacy');
		},
		// 营销信息复选框变化
		onMarketingChange(e) {
			this.registerForm.marketingOptIn = e.detail.value.includes('marketing');
		},
		// 生日选择变化
		onBirthdayChange(e) {
			// uni-datetime-picker 返回的是日期字符串，格式为 YYYY-MM-DD
			this.registerForm.birthday = e;
		},
		// 验证邮箱格式
		validateEmail(email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(email);
		},
		// 发送验证码
		async sendVerificationCode() {
			// 验证邮箱格式
			if (!this.registerForm.email) {
				uni.showToast({
					title: this.texts.validation.emailRequired,
					icon: 'none'
				});
				return;
			}
			
			if (!this.validateEmail(this.registerForm.email)) {
				uni.showToast({
					title: this.texts.validation.emailInvalid,
					icon: 'none'
				});
				return;
			}
			
			if (this.sendingCode || this.codeCountdown > 0) {
				return;
			}
			
			this.sendingCode = true;
			
			try {
				// 调用发送验证码接口
				const res = await post('/users/sendVerificationCode', {
					email: this.registerForm.email
				}, { showLoading: true });
				
				uni.showToast({
					title: this.texts.login.sendCodeSuccess,
					icon: 'success'
				});
				
				// 开始倒计时
				this.startCountdown();
			} catch (err) {
				console.error('Send verification code fail:', err);
				uni.showToast({
					title: this.texts.login.sendCodeFailed,
					icon: 'none'
				});
			} finally {
				this.sendingCode = false;
			}
		},
		// 开始倒计时
		startCountdown() {
			this.codeCountdown = 60; // 60秒倒计时
			
			// 清除之前的定时器
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer);
			}
			
			this.countdownTimer = setInterval(() => {
				this.codeCountdown--;
				if (this.codeCountdown <= 0) {
					clearInterval(this.countdownTimer);
					this.countdownTimer = null;
				}
			}, 1000);
		},
		// 使用 Google 授权码调用后端接口完成登录（公共方法）
		// 注意：code 可能是授权码、id_token、openid 或 unionid
		async loginWithGoogleCode(code) {
								if (!code) {
				uni.showToast({
					title: '未获取到 Google 授权信息',
					icon: 'none'
				});
				return;
			}

			console.log('准备使用 Google 授权信息调用后端接口:', {
				code: code.substring(0, 20) + '...', // 只显示前20个字符
				codeLength: code.length
			});

			this.submitting = true;
			try {
				// 调用后端接口，传递授权码
				// 注意：request.js 中的 BASE_URL 已包含 /api，所以这里使用 /users/thirdPartyLogin
				const res = await post('/users/thirdPartyLogin', {
					platform: 'google',
					code: code,
					nickname: this.googleUserInfo.nickname || '',
					avatarUrl: this.googleUserInfo.avatarUrl || ''
				}, { showLoading: true });

				console.log('后端接口调用成功，返回数据:', res);

				const data = res?.data || res || {};

				// 保存 token
				const token = data.token || data.accessToken || data.access_token || '';
				if (token) {
					uni.setStorageSync('token', token);
				}

				// 保存用户信息
				const userInfo = {
					id: data.id || data.userId || data.user_id || '',
					userId: data.userId || data.user_id || data.id || '',
					email: data.email || '',
					username: data.username || data.name || '',
					name: data.name || data.username || '',
					avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
					...data
				};
				uni.setStorageSync('userInfo', userInfo);

				uni.showToast({
					title: this.texts.toast.loginSuccess,
					icon: 'success'
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 1200);
			} catch (err) {
				console.error('Google 登录失败', err);
				// 错误提示已在 request 工具中统一处理
			} finally {
				this.submitting = false;
			}
		},
		// 处理 Google OAuth 回调（H5 端）
		async handleGoogleOAuthCallback() {
			// #ifdef H5
			try {
				const callbackResult = handleOAuthCallback();
				
				console.log('Google OAuth 回调结果:', callbackResult);
				
				if (callbackResult) {
					if (callbackResult.error) {
						console.error('Google OAuth 授权错误:', callbackResult.error, callbackResult.error_description);
						uni.showToast({
							title: callbackResult.error_description || callbackResult.error || '授权失败',
							icon: 'none'
						});
						// 清除 URL 中的回调参数
						this.clearOAuthCallbackParams();
						// 尝试跳转回 APP
						this.tryRedirectToApp();
						return;
					}
					
					if (callbackResult.code) {
						console.log('成功获取到 Google 授权码，准备调用后端接口');
						
						// 检测是否在 APP 的 WebView 中
						const isInApp = this.checkIfInApp();
						
						if (isInApp) {
							// 在 APP 的 WebView 中，直接处理
							await this.loginWithGoogleCode(callbackResult.code);
							// 清除 URL 中的回调参数
							this.clearOAuthCallbackParams();
						} else {
							// 在外部浏览器中，需要跳转回 APP
							// 先将 code 存储到 localStorage，然后跳转回 APP
							localStorage.setItem('google_oauth_code', callbackResult.code);
							localStorage.setItem('google_oauth_timestamp', Date.now().toString());
							
							// 尝试跳转回 APP
							this.tryRedirectToApp();
							
							// 显示提示信息
							uni.showToast({
								title: '授权成功，正在返回应用...',
								icon: 'none',
								duration: 2000
							});
						}
					} else {
						console.warn('回调结果中没有 code 参数');
					}
				} else {
					console.log('当前页面不是 Google OAuth 回调页面');
					
					// 检查是否有存储的 code（从外部浏览器跳转回 APP 后）
					this.checkStoredOAuthCode();
				}
			} catch (error) {
				console.error('处理 Google OAuth 回调失败:', error);
				uni.showToast({
					title: '处理授权回调失败，请重试',
					icon: 'none'
				});
				// 清除 URL 中的回调参数
				this.clearOAuthCallbackParams();
				// 尝试跳转回 APP
				this.tryRedirectToApp();
			}
			// #endif
		},
		// 检测是否在 APP 的 WebView 中
		checkIfInApp() {
			// #ifdef APP-PLUS
			// 在 APP 环境中，如果在 plus.webview 中，说明是在 APP 的 WebView
			if (typeof plus !== 'undefined' && plus.webview) {
				return true;
			}
			// #endif
			
			// #ifdef H5
			// 检测 User-Agent 或其他标识
			if (typeof window !== 'undefined') {
				const ua = window.navigator.userAgent || '';
				// 检测是否是 uni-app 的 WebView
				if (ua.includes('uni-app') || ua.includes('Html5Plus')) {
					return true;
				}
				// 检测是否在 iframe 中（可能是 APP 的 WebView）
				try {
					if (window.self !== window.top) {
						return true;
					}
				} catch (e) {
					// 跨域时无法访问，可能是 WebView
					return true;
				}
			}
			// #endif
			
			return false;
		},
		// 尝试跳转回 APP（使用 URL Scheme）
		tryRedirectToApp() {
			// #ifdef H5
			if (typeof window === 'undefined') return;
			
			// 获取 APP 的 URL Scheme（需要从 manifest.json 或配置中获取）
			// uni-app 的默认 scheme 格式：appid://
			const appId = '__UNI__BFD60C1'; // 从 manifest.json 获取
			const scheme = `${appId.toLowerCase().replace(/^__uni__/, '')}://`; // 转换为小写并移除前缀
			
			// 构建跳转 URL，携带回调参数
			const currentUrl = window.location.href;
			const callbackUrl = encodeURIComponent(currentUrl);
			const appUrl = `${scheme}pages/auth/login?oauth_callback=${callbackUrl}`;
			
			console.log('尝试跳转回 APP:', appUrl);
			
			// 尝试跳转
			try {
				// 方法1：直接跳转
				window.location.href = appUrl;
				
				// 方法2：延迟后显示提示（如果跳转失败）
				setTimeout(() => {
					// 如果还在当前页面，说明跳转失败
					if (window.location.href === currentUrl) {
						uni.showModal({
							title: '提示',
							content: '请手动返回应用，或点击确定重新打开应用',
							confirmText: '确定',
							success: (res) => {
								if (res.confirm) {
									// 再次尝试跳转
									window.location.href = appUrl;
								}
							}
						});
					}
				}, 1000);
			} catch (error) {
				console.error('跳转回 APP 失败:', error);
			}
			// #endif
			
			// #ifdef APP-PLUS
			// 在 APP 环境中，如果是在 WebView 中，可以关闭 WebView
			if (typeof plus !== 'undefined' && plus.webview) {
				const currentWebview = plus.webview.currentWebview();
				if (currentWebview) {
					// 关闭当前 WebView，返回上一页
					currentWebview.close();
				}
			}
			// #endif
		},
		// 检查是否有存储的 OAuth code（从外部浏览器跳转回 APP 后）
		async checkStoredOAuthCode() {
			// #ifdef H5
			if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
			
			try {
				const storedCode = localStorage.getItem('google_oauth_code');
				const storedTimestamp = localStorage.getItem('google_oauth_timestamp');
				
				if (storedCode && storedTimestamp) {
					// 检查是否在有效期内（5分钟内）
					const timestamp = parseInt(storedTimestamp, 10);
					const now = Date.now();
					const expireTime = 5 * 60 * 1000; // 5分钟
					
					if (now - timestamp < expireTime) {
						console.log('检测到存储的 OAuth code，自动完成登录');
						
						// 清除存储的 code
						localStorage.removeItem('google_oauth_code');
						localStorage.removeItem('google_oauth_timestamp');
						
						// 使用存储的 code 完成登录
						await this.loginWithGoogleCode(storedCode);
					} else {
						// 已过期，清除
						localStorage.removeItem('google_oauth_code');
						localStorage.removeItem('google_oauth_timestamp');
					}
				}
			} catch (error) {
				console.error('检查存储的 OAuth code 失败:', error);
			}
			// #endif
		},
		// 清除 URL 中的 OAuth 回调参数
		clearOAuthCallbackParams() {
			// #ifdef H5
			if (typeof window !== 'undefined' && window.history) {
				const url = new URL(window.location.href);
				url.searchParams.delete('code');
				url.searchParams.delete('state');
				url.searchParams.delete('google_oauth_callback');
				window.history.replaceState({}, '', url.toString());
			}
			// #endif
		},
		// 获取 Google 授权码/令牌（APP-PLUS 通过 OAuth 服务获取）
		async getGoogleAuthCode() {
			// APP 端：优先使用原生 OAuth（plus.oauth），如果失败则回退到 H5 方式
			// #ifdef APP-PLUS
			return new Promise(async (resolve, reject) => {
				// 等待 plus 对象就绪（如果需要）
				if (typeof plus === 'undefined') {
					console.warn('plus 对象未定义，等待就绪...');
					// 尝试等待 plus 对象就绪
					let retryCount = 0;
					const checkPlus = setInterval(() => {
						retryCount++;
						if (typeof plus !== 'undefined' && plus.oauth) {
							clearInterval(checkPlus);
							console.log('plus 对象已就绪，继续执行');
							// 继续执行
							this.executeOAuthLogin(resolve, reject);
						} else if (retryCount >= 10) {
							clearInterval(checkPlus);
							console.warn('等待 plus 对象超时，尝试使用 H5 方式');
							this.fallbackToH5(resolve, reject);
						}
					}, 100);
					return;
				}
				
				// 检查 plus.oauth 是否可用
				if (!plus.oauth) {
					console.warn('plus.oauth 不可用，尝试使用 H5 方式');
					this.fallbackToH5(resolve, reject);
					return;
				}
				
				// 执行 OAuth 登录
				this.executeOAuthLogin(resolve, reject);
			});
			// #endif
			
			// H5 端：使用浏览器授权
			// #ifdef H5
			return this.getGoogleAuthCodeH5();
			// #endif
		},
		// 执行 OAuth 登录（APP 端）
		executeOAuthLogin(resolve, reject) {
			console.log('========== APP 端：使用原生 OAuth 服务 ==========');
			console.log('plus.oauth 对象:', typeof plus.oauth);
			console.log('调用 plus.oauth.getServices...');
			
			plus.oauth.getServices(
				async (services) => {
					console.log('========== 获取到 OAuth 服务列表 ==========');
					console.log('服务数量:', services ? services.length : 0);
					console.log('可用的 OAuth 服务:', services ? services.map(s => s.id) : []);
					
					if (!services || services.length === 0) {
						console.warn('未找到任何 OAuth 服务');
						this.fallbackToH5(resolve, reject);
						return;
					}
					
					const googleService = services.find((s) => s.id === 'google');
					if (!googleService) {
						console.warn('未找到 Google OAuth 服务');
						console.warn('可用服务:', services.map(s => s.id));
						console.warn('回退到 H5 方式');
						this.fallbackToH5(resolve, reject);
						return;
					}
					
					console.log('========== 找到 Google OAuth 服务 ==========');
					console.log('服务 ID:', googleService.id);
					console.log('服务描述:', googleService.description);
					console.log('开始调用 googleService.login...');
					
					googleService.login(
							async (res) => {
								console.log('Google OAuth 登录成功，完整响应:', JSON.stringify(res, null, 2));
								console.log('响应类型:', typeof res);
								console.log('响应键:', Object.keys(res || {}));
								
								// 尝试多种可能的数据结构
								let code = '';
								
								// 方式1: res.target.authResult (uni-app plus.oauth 的标准结构)
								// 根据实际返回的数据结构：res.target.authResult.openid 或 res.target.authResult.unionid
								if (res.target && res.target.authResult) {
									console.log('找到 target.authResult:', res.target.authResult);
									console.log('target.authResult.unionid:', res.target.authResult.unionid);
									console.log('target.authResult.openid:', res.target.authResult.openid);
									
									// 记录用户信息（如有）
									if (res.target.userInfo) {
										this.googleUserInfo.nickname = res.target.userInfo.nickname || res.target.userInfo.name || '';
										this.googleUserInfo.avatarUrl = res.target.userInfo.avatar || res.target.userInfo.picture || '';
									}
									
									// plus.oauth 返回 openid/unionid 而不是 code
									// 优先使用 unionid，如果没有则使用 openid
									const unionid = res.target.authResult.unionid;
									const openid = res.target.authResult.openid;
									
									if (unionid && unionid.trim()) {
										code = unionid;
										console.log('从 target.authResult.unionid 获取到标识符:', code.substring(0, 20) + '...');
									} else if (openid && openid.trim()) {
										code = openid;
										console.log('从 target.authResult.openid 获取到标识符:', code.substring(0, 20) + '...');
									} else {
										// 尝试其他字段
										code = res.target.authResult.id_token || 
										       res.target.authResult.code || 
										       res.target.authResult.access_token || 
										       '';
										if (code) {
											console.log('从 target.authResult 其他字段获取到标识符:', code.substring(0, 20) + '...');
										} else {
											console.warn('target.authResult 中没有找到有效的标识符');
										}
									}
								} else {
									console.warn('res.target 或 res.target.authResult 不存在');
									console.warn('res.target:', res.target);
								}
								
								// 方式2: res.target.userInfo (如果 authResult 中没有，尝试从 userInfo 获取)
								if (!code && res.target && res.target.userInfo) {
									console.log('尝试从 target.userInfo 获取:', res.target.userInfo);
									code = res.target.userInfo.unionid || 
									       res.target.userInfo.openid || 
									       '';
									if (code) {
										console.log('从 target.userInfo 获取到标识符:', code.substring(0, 20) + '...');
									}
								}
								
								// 方式3: res.target 直接包含标识符
								if (!code && res.target) {
									console.log('尝试从 res.target 直接获取');
									code = res.target.unionid || 
									       res.target.openid || 
									       res.target.id_token || 
									       res.target.code || 
									       res.target.access_token || 
									       '';
								}
								
								// 方式4: res.authResult.id_token / res.authResult.code / res.authResult.access_token
								if (!code && res.authResult) {
									console.log('找到 authResult:', res.authResult);
									code = res.authResult.unionid || 
									       res.authResult.openid || 
									       res.authResult.id_token || 
									       res.authResult.code || 
									       res.authResult.access_token || 
									       '';
								}
								
								// 方式5: res.id_token / res.code / res.access_token (直接返回)
								if (!code && res) {
									console.log('尝试直接从 res 获取');
									code = res.unionid || 
									       res.openid || 
									       res.id_token || 
									       res.code || 
									       res.access_token || 
									       res.token || 
									       '';
								}
								
								// 方式6: res.data.id_token / res.data.code
								if (!code && res.data) {
									console.log('尝试从 res.data 获取:', res.data);
									code = res.data.unionid || 
									       res.data.openid || 
									       res.data.id_token || 
									       res.data.code || 
									       res.data.access_token || 
									       res.data.token || 
									       '';
								}
								
								// 方式7: res.result.id_token / res.result.code
								if (!code && res.result) {
									console.log('尝试从 res.result 获取:', res.result);
									code = res.result.unionid || 
									       res.result.openid || 
									       res.result.id_token || 
									       res.result.code || 
									       res.result.access_token || 
									       res.result.token || 
									       '';
								}
								
								// 如果还是没有找到，输出所有可能的值
								if (!code) {
									console.error('========== OAuth 响应诊断 ==========');
									console.error('OAuth 响应中没有找到授权码');
									console.error('完整的响应对象:', res);
									console.error('响应对象的 JSON 字符串:', JSON.stringify(res, null, 2));
									console.error('响应类型:', typeof res);
									console.error('是否为数组:', Array.isArray(res));
									console.error('响应键:', Object.keys(res || {}));
									
									// 特别检查 target 结构
									if (res.target) {
										console.error('res.target 存在:', res.target);
										console.error('res.target 的键:', Object.keys(res.target));
										if (res.target.authResult) {
											console.error('res.target.authResult 存在:', res.target.authResult);
											console.error('res.target.authResult 的键:', Object.keys(res.target.authResult));
											console.error('res.target.authResult.openid 值:', res.target.authResult.openid);
											console.error('res.target.authResult.unionid 值:', res.target.authResult.unionid);
											console.error('openid 类型:', typeof res.target.authResult.openid);
											console.error('unionid 类型:', typeof res.target.authResult.unionid);
											console.error('openid 是否为空字符串:', res.target.authResult.openid === '');
											console.error('unionid 是否为空字符串:', res.target.authResult.unionid === '');
										} else {
											console.error('res.target.authResult 不存在');
										}
									} else {
										console.error('res.target 不存在');
									}
									
									console.error('尝试解析所有可能的字段:');
									
									// 递归查找所有可能的 token/code 字段
									const foundFields = [];
									const findToken = (obj, path = '') => {
										if (!obj || typeof obj !== 'object') return;
										for (const key in obj) {
											const currentPath = path ? `${path}.${key}` : key;
											const value = obj[key];
											
											if (typeof value === 'string' && value.length > 10) {
												// 可能是 token/code（长度大于10的字符串）
												const lowerKey = key.toLowerCase();
												if (lowerKey.includes('token') || 
												    lowerKey.includes('code') ||
												    lowerKey.includes('id_token') ||
												    lowerKey.includes('auth') ||
												    lowerKey.includes('credential')) {
													foundFields.push({
														path: currentPath,
														value: value.substring(0, 50) + '...',
														length: value.length
													});
													console.log(`找到可能的授权码字段: ${currentPath} = ${value.substring(0, 50)}... (长度: ${value.length})`);
												}
											} else if (typeof value === 'object' && value !== null) {
												findToken(value, currentPath);
											}
										}
									};
									
									findToken(res);
									
									if (foundFields.length > 0) {
										console.warn('找到以下可能的授权码字段，但未自动识别:');
										foundFields.forEach(field => {
											console.warn(`  - ${field.path}: ${field.value} (长度: ${field.length})`);
										});
										console.warn('请检查这些字段，可能需要手动提取授权码');
									}
									
									console.error('=====================================');
									
									// 如果 plus.oauth 失败，尝试回退到浏览器方式
									console.warn('plus.oauth 未返回授权码，尝试使用浏览器方式');
									try {
										const code = await this.getGoogleAuthCodeBrowser();
										resolve(code);
									} catch (err) {
										console.error('浏览器方式也失败:', err);
										reject(new Error('未获取到 Google 授权码。请查看控制台日志了解返回的数据结构，或联系技术支持'));
									}
									return;
								}
								
								console.log('成功获取 Google 授权码，长度:', code.length);
								resolve(code);
							},
							async (err) => {
								console.error('Google OAuth 登录失败:', err);
								console.error('错误详情:', JSON.stringify(err, null, 2));
								
								// 如果 plus.oauth 失败，尝试回退到 H5 方式
								console.warn('plus.oauth 登录失败，尝试使用 H5 方式');
								try {
									const code = await this.getGoogleAuthCodeH5();
									resolve(code);
								} catch (h5Err) {
									reject(err);
								}
							}
						);
					},
					async (err) => {
						console.error('========== 获取 OAuth 服务列表失败 ==========');
						console.error('错误:', err);
						console.error('错误类型:', typeof err);
						console.error('错误详情:', JSON.stringify(err, null, 2));
						// 如果获取服务列表失败，尝试回退到 H5 方式
						console.warn('获取 OAuth 服务列表失败，尝试使用 H5 方式');
						this.fallbackToH5(resolve, reject);
					}
				);
		},
		// 回退到 H5 授权方式
		async fallbackToH5(resolve, reject) {
			console.log('========== 回退到 H5 授权方式 ==========');
			try {
				const code = await this.getGoogleAuthCodeH5();
				resolve(code);
			} catch (err) {
				console.error('H5 授权方式也失败:', err);
				reject(err);
			}
		},
		// 获取 Google 授权码（H5 端）
		async getGoogleAuthCodeH5() {
			// #ifdef APP-PLUS
			// APP 端：如果原生 OAuth 失败，使用浏览器打开授权页面
			return new Promise(async (resolve, reject) => {
				try {
					console.log('APP 端：使用浏览器打开 Google 授权页面');
					const authUrl = await authorize('', '', 'app');
					console.log('授权 URL 已生成，准备打开浏览器...');
					
					// 在 APP 中打开外部浏览器
					if (typeof plus !== 'undefined' && plus.runtime) {
						plus.runtime.openURL(authUrl);
						console.log('已打开浏览器，等待用户完成授权...');
						// 注意：这里不会立即返回，需要等待用户完成授权后通过 URL Scheme 返回
						// 授权码会通过 handleBackendOAuthCallback 或 checkStoredOAuthCode 处理
						reject(new Error('授权流程已启动，请完成授权后返回应用'));
					} else {
						// 如果 plus.runtime 不可用，直接跳转
						window.location.href = authUrl;
						reject(new Error('授权流程已启动，请完成授权后返回应用'));
					}
				} catch (err) {
					console.error('生成授权 URL 失败:', err);
					reject(err);
				}
			});
			// #endif
			
			// #ifdef H5
			// H5 端：直接跳转到 Google 授权页面
			try {
				console.log('H5 端：跳转到 Google 授权页面');
				const authUrl = await authorize('', '', 'h5');
				window.location.href = authUrl;
				// 这里不会返回，因为页面会跳转
				return Promise.reject(new Error('页面跳转中...'));
			} catch (err) {
				console.error('H5 授权失败:', err);
				throw err;
			}
			// #endif
		},
		// 浏览器方式获取 Google 授权码（APP 环境使用）
		async getGoogleAuthCodeBrowser() {
			// #ifdef APP-PLUS
			return new Promise(async (resolve, reject) => {
				try {
					// APP 端从配置获取（会自动使用 APP 专用的 clientId）
					const config = await getOAuthConfig('app');
					const clientId = config.clientId;
					const redirectUri = config.redirectUri;
					
					if (!clientId) {
						throw new Error('后端未返回 Google OAuth Client ID');
					}
					
					// 生成授权 URL（不直接重定向）
					const authUrl = generateAuthUrl(clientId, redirectUri);
					
					console.log('在系统浏览器中打开授权页面:', authUrl);
					
					// 使用 plus.runtime.openURL 打开系统浏览器
					if (typeof plus !== 'undefined' && plus.runtime) {
						plus.runtime.openURL(authUrl, (err) => {
							if (err) {
								console.error('打开浏览器失败:', err);
								reject(new Error('无法打开浏览器进行授权'));
							} else {
								// 提示用户完成授权后会返回应用
								uni.showToast({
									title: '请在浏览器中完成授权',
									icon: 'none',
									duration: 3000
								});
								// 注意：这里不会立即返回，需要等待用户完成授权后通过 URL Scheme 返回
								// 授权码会通过 handleBackendOAuthCallback 或 checkStoredOAuthCode 处理
								reject(new Error('授权流程已启动，请完成授权后返回应用'));
							}
						});
					} else {
						// 如果 plus.runtime 不可用，尝试使用 WebView
						console.warn('plus.runtime 不可用，尝试使用 WebView');
						reject(new Error('当前环境不支持浏览器授权，请使用其他方式'));
					}
				} catch (error) {
					console.error('浏览器授权失败:', error);
					reject(error);
				}
			});
			// #endif
			
			// #ifndef APP-PLUS
			return Promise.reject(new Error('浏览器方式仅支持 APP 环境'));
			// #endif
		},
		// 谷歌登录真实调用
		async handleGoogleLogin() {
			if (this.submitting) return;
			
			console.log('========== Google 登录开始 ==========');
			console.log('当前平台:', uni.getSystemInfoSync().platform);
			console.log('是否在 APP 环境:', typeof plus !== 'undefined');
			
			let code = '';
			try {
				// 获取 Google 授权码
				console.log('开始获取 Google 授权码...');
				code = await this.getGoogleAuthCode();
				console.log('成功获取授权码，长度:', code ? code.length : 0);
			} catch (err) {
				console.error('Google 授权失败', err);
				console.error('错误堆栈:', err?.stack);
				uni.showToast({
					title: err?.message || this.texts.login.googleComingSoon,
					icon: 'none',
					duration: 3000
				});
				return;
			}

			// 使用授权码调用后端接口完成登录
			await this.loginWithGoogleCode(code);
		},
		// 苹果登录真实调用
		async handleAppleLogin() {
			// #ifndef APP-PLUS
			uni.showToast({
				title: this.texts.login.appleComingSoon,
				icon: 'none',
				duration: 3000
			});
			return;
			// #endif
			
			// #ifdef APP-PLUS
			if (this.submitting) return;
			
			// 检查是否为iOS平台
			if (!this.isIOS) {
				uni.showToast({
					title: 'Apple 登录仅支持 iOS 设备',
					icon: 'none',
					duration: 3000
				});
				return;
			}
			
			console.log('========== Apple 登录开始 ==========');
			console.log('当前平台:', uni.getSystemInfoSync().platform);
			
			let code = '';
			let nickname = '';
			let avatarUrl = '';
			
			try {
				// 获取 Apple 授权码
				console.log('开始获取 Apple 授权码...');
				const result = await this.getAppleAuthCode();
				code = result.code || '';
				nickname = result.nickname || '';
				avatarUrl = result.avatarUrl || '';
				console.log('成功获取授权码，长度:', code ? code.length : 0);
			} catch (err) {
				console.error('Apple 授权失败', err);
				console.error('错误堆栈:', err?.stack);
				uni.showToast({
					title: err?.message || this.texts.login.appleComingSoon,
					icon: 'none',
					duration: 3000
				});
				return;
			}

			// 使用授权码调用后端接口完成登录
			await this.loginWithAppleCode(code, nickname, avatarUrl);
			// #endif
		},
		// 获取 Apple 授权码（APP-PLUS 通过 OAuth 服务获取）
		async getAppleAuthCode() {
			// #ifdef APP-PLUS
			return new Promise(async (resolve, reject) => {
				// 等待 plus 对象就绪
				if (typeof plus === 'undefined') {
					console.warn('plus 对象未定义，等待就绪...');
					let retryCount = 0;
					const checkPlus = setInterval(() => {
						retryCount++;
						if (typeof plus !== 'undefined' && plus.oauth) {
							clearInterval(checkPlus);
							console.log('plus 对象已就绪，继续执行');
							this.executeAppleOAuthLogin(resolve, reject);
						} else if (retryCount >= 10) {
							clearInterval(checkPlus);
							console.warn('等待 plus 对象超时');
							reject(new Error('Apple 登录服务不可用'));
						}
					}, 100);
					return;
				}
				
				// 检查 plus.oauth 是否可用
				if (!plus.oauth) {
					console.warn('plus.oauth 不可用');
					reject(new Error('Apple 登录服务不可用'));
					return;
				}
				
				// 执行 OAuth 登录
				this.executeAppleOAuthLogin(resolve, reject);
			});
			// #endif
			
			// #ifndef APP-PLUS
			return Promise.reject(new Error('Apple 登录仅支持 APP 环境'));
			// #endif
		},
		// 执行 Apple OAuth 登录（APP 端）
		executeAppleOAuthLogin(resolve, reject) {
			console.log('========== APP 端：使用原生 Apple OAuth 服务 ==========');
			console.log('plus.oauth 对象:', typeof plus.oauth);
			console.log('调用 plus.oauth.getServices...');
			
			plus.oauth.getServices(
				async (services) => {
					console.log('========== 获取到 OAuth 服务列表 ==========');
					console.log('服务数量:', services ? services.length : 0);
					console.log('可用的 OAuth 服务:', services ? services.map(s => s.id) : []);
					
					if (!services || services.length === 0) {
						console.warn('未找到任何 OAuth 服务');
						reject(new Error('未找到 OAuth 服务'));
						return;
					}
					
					const appleService = services.find((s) => s.id === 'apple');
					if (!appleService) {
						console.warn('未找到 Apple OAuth 服务');
						console.warn('可用服务:', services.map(s => s.id));
						reject(new Error('未找到 Apple 登录服务'));
						return;
					}
					
					console.log('========== 找到 Apple OAuth 服务 ==========');
					console.log('服务 ID:', appleService.id);
					console.log('服务描述:', appleService.description);
					console.log('开始调用 appleService.login...');
					
					appleService.login(
						async (res) => {
							console.log('Apple OAuth 登录成功，完整响应:', JSON.stringify(res, null, 2));
							console.log('响应类型:', typeof res);
							console.log('响应键:', Object.keys(res || {}));
							
							let code = '';
							let nickname = '';
							let avatarUrl = '';
							
							// 提取用户信息
							if (res.target && res.target.userInfo) {
								nickname = res.target.userInfo.nickname || res.target.userInfo.name || '';
								avatarUrl = res.target.userInfo.avatar || res.target.userInfo.picture || '';
								console.log('从 userInfo 提取到昵称:', nickname, '头像:', avatarUrl);
							}
							
							// 提取授权码/标识符
							if (res.target && res.target.authResult) {
								console.log('找到 target.authResult:', res.target.authResult);
								
								// Apple 登录可能返回 identityToken、authorizationCode 或 user
								const identityToken = res.target.authResult.identityToken;
								const authorizationCode = res.target.authResult.authorizationCode;
								const user = res.target.authResult.user;
								
								if (identityToken && identityToken.trim()) {
									code = identityToken;
									console.log('从 target.authResult.identityToken 获取到标识符');
								} else if (authorizationCode && authorizationCode.trim()) {
									code = authorizationCode;
									console.log('从 target.authResult.authorizationCode 获取到标识符');
								} else if (user && user.trim()) {
									code = user;
									console.log('从 target.authResult.user 获取到标识符');
								} else {
									// 尝试其他可能的字段
									code = res.target.authResult.openid || 
										   res.target.authResult.unionid || 
										   res.target.authResult.id_token || 
										   res.target.authResult.code || 
										   res.target.authResult.access_token || '';
									if (code) {
										console.log('从 target.authResult 其他字段获取到标识符');
									} else {
										console.warn('target.authResult 中没有找到有效的标识符');
									}
								}
							}
							
							// 如果还没有找到，尝试从其他位置提取
							if (!code) {
								if (res.target && res.target.openid) {
									code = res.target.openid;
									console.log('从 target.openid 获取到标识符');
								} else if (res.target && res.target.unionid) {
									code = res.target.unionid;
									console.log('从 target.unionid 获取到标识符');
								} else if (res.identityToken) {
									code = res.identityToken;
									console.log('从 res.identityToken 获取到标识符');
								} else if (res.authorizationCode) {
									code = res.authorizationCode;
									console.log('从 res.authorizationCode 获取到标识符');
								} else if (res.user) {
									code = res.user;
									console.log('从 res.user 获取到标识符');
								}
							}
							
							if (!code) {
								console.error('========== OAuth 响应诊断 ==========');
								console.error('OAuth 响应中没有找到授权码');
								console.error('完整的响应对象:', res);
								console.error('响应对象的 JSON 字符串:', JSON.stringify(res, null, 2));
								reject(new Error('未获取到 Apple 授权码。请查看控制台日志了解返回的数据结构'));
								return;
							}
							
							console.log('成功获取 Apple 授权码，长度:', code.length);
							resolve({
								code: code,
								nickname: nickname,
								avatarUrl: avatarUrl
							});
						},
						async (err) => {
							console.error('Apple OAuth 登录失败:', err);
							console.error('错误详情:', JSON.stringify(err, null, 2));
							reject(new Error('Apple 登录失败: ' + (err.message || '未知错误')));
						}
					);
				},
				async (err) => {
					console.error('========== 获取 OAuth 服务列表失败 ==========');
					console.error('错误:', err);
					console.error('错误详情:', JSON.stringify(err, null, 2));
					reject(new Error('获取 OAuth 服务列表失败'));
				}
			);
		},
		// 使用 Apple 授权码调用后端接口完成登录
		async loginWithAppleCode(code, nickname = '', avatarUrl = '') {
			if (!code) {
				uni.showToast({
					title: '未获取到 Apple 授权信息',
					icon: 'none'
				});
				return;
			}

			console.log('准备使用 Apple 授权信息调用后端接口:', {
				code: code.substring(0, 20) + '...',
				codeLength: code.length,
				nickname: nickname,
				avatarUrl: avatarUrl
			});

			this.submitting = true;
			try {
				// 调用后端接口，传递授权码
				const res = await post('/users/thirdPartyLogin', {
					platform: 'apple',
					code: code,
					nickname: nickname || '',
					avatarUrl: avatarUrl || ''
				}, { showLoading: true });

				console.log('后端接口调用成功，返回数据:', res);

				const data = res?.data || res || {};

				// 保存 token
				const token = data.token || data.accessToken || data.access_token || '';
				if (token) {
					uni.setStorageSync('token', token);
				}

				// 保存用户信息
				const userInfo = {
					id: data.id || data.userId || data.user_id || '',
					userId: data.userId || data.user_id || data.id || '',
					email: data.email || '',
					username: data.username || data.name || '',
					name: data.name || data.username || '',
					avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
					...data
				};
				uni.setStorageSync('userInfo', userInfo);

				uni.showToast({
					title: this.texts.toast.loginSuccess,
					icon: 'success'
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 1200);
			} catch (err) {
				console.error('Apple 登录失败', err);
				// 错误提示已在 request 工具中统一处理
			} finally {
				this.submitting = false;
			}
		},
		// 登录
		async handleLogin() {
			// 表单验证
			try {
				await this.$refs.loginFormRef.validate();
			} catch (err) {
				return;
			}
			
			if (this.submitting) return;
			this.submitting = true;
			
			try {
				const res = await post('/users/login', {
					email: this.loginForm.email,
					password: this.loginForm.password
				}, { showLoading: true });
				
				// 保存登录信息
				const data = res.data || res;
				
				// 保存 token（支持多种可能的字段名）
				const token = data.token || data.accessToken || data.access_token || '';
				if (token) {
					uni.setStorageSync('token', token);
				} else {
					console.warn('登录响应中未找到 token');
				}
				
				// 构建用户信息对象，优先使用后端返回的数据
				const userInfo = {
					// 用户ID（支持多种可能的字段名）
					id: data.id || data.userId || data.user_id || '',
					userId: data.userId || data.user_id || data.id || '',
					// 邮箱
					email: data.email || this.loginForm.email || '',
					// 用户名（支持多种可能的字段名）
					username: data.username || data.name || data.userName || '',
					name: data.name || data.username || data.userName || '',
					// 头像
					avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
					// 其他信息
					birthday: data.birthday || '',
					countryCode: data.countryCode || data.country_code || '',
					phone: data.phone || data.phoneNumber || '',
					// 保存后端返回的所有其他字段
					...data
				};
				
				// 保存完整的用户信息
				uni.setStorageSync('userInfo', userInfo);
				
				uni.showToast({
					title: this.texts.toast.loginSuccess,
					icon: 'success'
				});
				
				// 延迟返回，让用户看到成功提示
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} catch (err) {
				console.error('Login fail:', err);
				// 错误提示已在 request 工具中统一处理
			} finally {
				this.submitting = false;
			}
		},
		// 注册
		async handleRegister() {
			// 表单验证
			try {
				await this.$refs.registerFormRef.validate();
			} catch (err) {
				return;
			}
			
			if (!this.registerForm.privacyAgreed) {
				uni.showToast({
					title: this.texts.toast.privacyRequired,
					icon: 'none'
				});
				return;
			}
			
			if (this.submitting) return;
			this.submitting = true;
			
			try {
				const res = await post('/users/register', {
					username: this.registerForm.username,
					email: this.registerForm.email,
					verificationCode: this.registerForm.verificationCode,
					password: this.registerForm.password,
					confirmPassword: this.registerForm.confirmPassword,
					birthday: this.registerForm.birthday || '',
					countryCode: this.registerForm.countryCode || '',
					privacyAgreed: this.registerForm.privacyAgreed,
					marketingOptIn: this.registerForm.marketingOptIn
				}, { showLoading: true });
				
				// 检查后端返回的数据
				if (!res) {
					uni.showToast({
						title: this.texts.toast.registerFailed,
						icon: 'none'
					});
					return;
				}
				
				// 获取返回的数据（支持多种数据结构）
				const data = res.data || res;
				
				// 检查后端返回的状态码或成功标识
				// 如果后端返回 code 字段，检查是否为成功
				if (data.code !== undefined && data.code !== 200 && data.code !== 1 && data.code !== 0) {
					const errorMsg = data.message || data.msg || data.error || this.texts.errorFallback.registerFailed;
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 检查是否有错误信息
				if (data.error || (data.message && data.message.toLowerCase().includes('error'))) {
					const errorMsg = data.message || data.error || this.texts.errorFallback.registerFailed;
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				// 注册成功，保存用户信息（如果有返回）
				// 如果注册后自动登录，保存 token 和用户信息
				const token = data.token || data.accessToken || data.access_token || '';
				if (token) {
					uni.setStorageSync('token', token);
					
					// 构建用户信息对象，优先使用后端返回的数据
					const userInfo = {
						// 用户ID（支持多种可能的字段名）
						id: data.id || data.userId || data.user_id || '',
						userId: data.userId || data.user_id || data.id || '',
						// 邮箱
						email: data.email || this.registerForm.email || '',
						// 用户名（支持多种可能的字段名）
						username: data.username || this.registerForm.username || data.name || '',
						name: data.name || data.username || this.registerForm.username || '',
						// 头像
						avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
						// 其他信息
						birthday: data.birthday || this.registerForm.birthday || '',
						countryCode: data.countryCode || data.country_code || this.registerForm.countryCode || '',
						phone: data.phone || data.phoneNumber || '',
						// 保存后端返回的所有其他字段
						...data
					};
					
					uni.setStorageSync('userInfo', userInfo);
				} else {
					// 注册成功但未自动登录，也保存用户基本信息（如果有）
					if (data.id || data.userId) {
						const userInfo = {
							id: data.id || data.userId || data.user_id || '',
							userId: data.userId || data.user_id || data.id || '',
							email: data.email || this.registerForm.email || '',
							username: data.username || this.registerForm.username || '',
							name: data.name || data.username || this.registerForm.username || '',
							avatar: data.avatar || '',
							birthday: data.birthday || this.registerForm.birthday || '',
							countryCode: data.countryCode || this.registerForm.countryCode || '',
							...data
						};
						// 注意：未登录状态下，不保存到 userInfo，或者只保存基本信息
						// 这里可以根据实际需求决定是否保存
					}
				}
				
				uni.showToast({
					title: this.texts.toast.registerSuccess,
					icon: 'success'
				});
				
				// 如果注册后自动登录，延迟返回；否则切换到登录页面
				if (data.token || data.accessToken) {
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					// 注册成功但不自动登录，切换到登录页面
					setTimeout(() => {
						this.switchToLogin();
						this.registerForm = {
							username: '',
							email: '',
							verificationCode: '',
							password: '',
							confirmPassword: '',
							birthday: '',
							countryCode: '',
							privacyAgreed: true,
							marketingOptIn: true
						};
						// 清理验证码相关状态
						if (this.countdownTimer) {
							clearInterval(this.countdownTimer);
							this.countdownTimer = null;
						}
						this.codeCountdown = 0;
					}, 1500);
				}
			} catch (err) {
				console.error('Register fail:', err);
				// 如果 catch 到错误，说明请求失败或后端返回了错误状态码
				// request 工具已经显示了错误提示，但这里可以额外处理
				const errorMsg = err?.data?.message || err?.data?.error || err?.message || this.texts.toast.registerFailed;
				// 如果 request 工具没有显示错误（比如网络错误），这里显示
				if (!err?.data) {
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					});
				}
			} finally {
				this.submitting = false;
			}
		}
	}
}
</script>

<style scoped>
.login-page {
	min-height: 100vh;
	background-color: #e8f4f8;
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
}

.top-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a4d6b;
}

.login-form {
	padding: 40rpx 32rpx;
	box-sizing: border-box;
}

.form-container {
	margin-top: 20rpx;
}

.form-item {
	margin-bottom: 32rpx;
	width: 100%;
	box-sizing: border-box;
}

.tab-bar {
	display: flex;
	margin-bottom: 40rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 32rpx;
	color: #999;
	position: relative;
}

.tab-item.active {
	color: #2a7fff;
	font-weight: 600;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: -2rpx;
	left: 0;
	right: 0;
	height: 4rpx;
	background-color: #2a7fff;
}

.checkbox-item {
	margin-bottom: 20rpx;
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.checkbox-text {
	font-size: 26rpx;
	color: #666;
}

.picker-view {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: #f0f7fa;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}

.picker-text {
	font-size: 28rpx;
	color: #1a4d6b;
	flex: 1;
}

.picker-text.placeholder {
	color: #999;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #2a7fff;
	color: #fff;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 500;
	margin-top: 40rpx;
	line-height: 88rpx;
	text-align: center;
	box-sizing: border-box;
	border: none;
}

.login-btn[disabled] {
	background-color: #ccc;
	color: #999;
}

.code-input-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
	width: 100%;
}

.code-input {
	flex: 1;
}

.send-code-btn {
	min-width: 180rpx;
	height: 70rpx;
	background-color: #2a7fff;
	color: #fff;
	border-radius: 8rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 24rpx;
	box-sizing: border-box;
	white-space: nowrap;
	flex-shrink: 0;
}

.send-code-btn[disabled] {
	background-color: #ccc;
	color: #999;
}

.third-party {
	margin-top: 30rpx;
}

.third-title {
	text-align: center;
	color: #999;
	font-size: 26rpx;
	margin-bottom: 20rpx;
}

.google-btn {
	width: 100%;
	height: 88rpx;
	background-color: #fff;
	border: 2rpx solid #e5e5e5;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	color: #333;
	margin-bottom: 20rpx;
	font-size: 30rpx;
}

.google-text {
	color: #333;
}

.apple-btn {
	width: 100%;
	height: 88rpx;
	background-color: #000;
	border: none;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	color: #fff;
	font-size: 30rpx;
}

.apple-text {
	color: #fff;
}
</style>

