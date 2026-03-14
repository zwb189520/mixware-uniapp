<script>
	import { useLanguageStore, useUserStore } from '@/stores'
	import { checkAllPermissions } from '@/utils/permission.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// ✅ 初始化用户状态（恢复加密的 Token 和用户信息）
			const userStore = useUserStore()
			userStore.initFromStorage()
			
			// 初始化语言设置（不更新TabBar，等页面显示时再更新）
			const languageStore = useLanguageStore()
			languageStore.loadLanguage(false)
			
			// 仅在 APP 平台初始化权限检查（不主动请求）
			// 权限应该在真正需要使用时再申请（按需请求）
			this.initPermissionCheck()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			/**
			 * 初始化权限检查（不主动弹窗）
			 * 仅在 APP 平台检查权限状态，实际请求延迟到使用时
			 */
			initPermissionCheck() {
				// #ifdef APP-PLUS
				try {
					// 可选：在后台检查权限状态，但不弹窗请求
					// 实际权限请求应该在以下场景触发：
					// - 蓝牙：用户点击"连接设备"时
					// - 相机：用户点击"拍照"或"扫描二维码"时
					// - 存储：用户点击"保存文件"时
					// - 位置：用户点击"定位"时
					console.log('权限检查已初始化，将在需要时按需请求')
				} catch (error) {
					console.error('权限初始化失败:', error)
				}
				// #endif
			},
			
			/**
			 * 请求蓝牙权限（在用户点击连接设备时调用）
			 */
			async requestBluetoothPermission() {
				return this.requestAppPlusPermission('bluetooth', '用于连接和管理蓝牙设备')
			},
			
			/**
			 * 请求相机权限（在用户点击拍照/扫描时调用）
			 */
			async requestCameraPermission() {
				return this.requestAppPlusPermission('camera', '用于拍照和扫描二维码')
			},
			
			/**
			 * 请求存储权限（在用户点击保存时调用）
			 */
			async requestStoragePermission() {
				return this.requestAppPlusPermission('storage', '用于保存图片和文件')
			},
			
			/**
			 * 请求位置权限（在用户点击定位时调用）
			 */
			async requestLocationPermission() {
				return this.requestAppPlusPermission('location', '用于定位服务')
			},
			
			/**
			 * 通用权限请求方法
			 */
			async requestAppPlusPermission(permission, desc) {
				// #ifdef APP-PLUS
				try {
					const result = await this.checkAndRequestPermission(permission, desc)
					return result
				} catch (error) {
					console.error(`${permission}权限请求出错:`, error)
					return false
				}
				// #endif
				return true
			},
			
			checkAndRequestPermission(permission, desc) {
				return new Promise((resolve, reject) => {
					plus.android.requestPermissions(
						[this.getAndroidPermission(permission)],
						(resultObj) => {
							if (resultObj.grantedPermissions.length > 0) {
								console.log(`${permission}权限获取成功`)
								resolve(true)
							} else {
								console.log(`${permission}权限被拒绝`)
								// 显示提示信息
								uni.showModal({
									title: '需要权限',
									content: desc + '，请在设置中手动开启',
									showCancel: true,
									cancelText: '暂不开启',
									confirmText: '去设置',
									success: (modalResult) => {
										if (modalResult.confirm) {
											// 跳转到应用设置页面
											plus.runtime.openSettings()
										}
										resolve(false)
									}
								})
							}
						},
						(error) => {
							console.error(`权限请求失败: ${error.message}`)
							reject(error)
						}
					)
				})
			},
			
			getAndroidPermission(permission) {
				const permissionMap = {
					bluetooth: "android.permission.BLUETOOTH",
					camera: "android.permission.CAMERA",
					storage: "android.permission.WRITE_EXTERNAL_STORAGE",
					location: "android.permission.ACCESS_FINE_LOCATION",
					locationAlways: "android.permission.ACCESS_BACKGROUND_LOCATION",
					microphone: "android.permission.RECORD_AUDIO",
					contacts: "android.permission.READ_CONTACTS",
					systemAlertWindow: "android.permission.SYSTEM_ALERT_WINDOW",
					notifications: "android.permission.POST_NOTIFICATIONS"
				}
				return permissionMap[permission] || permission
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
