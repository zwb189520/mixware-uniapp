<script>
	import { useLanguageStore, useUserStore } from '@/stores'
	import { checkAllPermissions } from '@/utils/permission.ts'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 初始化用户状态，从本地存储加载 Token 等信息
			const userStore = useUserStore()
			userStore.initFromStorage()
			
			// 初始化语言设置，确保 TabBar 等UI组件显示正确语言
			const languageStore = useLanguageStore()
			languageStore.loadLanguage(false)
			
			// ?? APP ????????????????
			// 检查并请求必要的权限??
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
			 * ??????????????
			 * ?? APP ???????????????????
			 */
			initPermissionCheck() {
				// #ifdef APP-PLUS
				try {
					// 以下是需要检查的权限列表???
					// ????????????????
					// - 蓝牙权限（用于连接设备）
					// - 相机权限（用于扫码）
					// - 存储权限（用于保存文件）
					// - 定位权限（用于蓝牙扫描）
					console.log('开始检查应用权限...')
				} catch (error) {
					console.error('权限检查失败:', error)
				}
				// #endif
			},
			
			/**
			 * ????????????????????
			 */
			async requestBluetoothPermission() {
				return this.requestAppPlusPermission('bluetooth', '???????????')
			},
			
			/**
			 * ??????????????/??????
			 */
			async requestCameraPermission() {
				return this.requestAppPlusPermission('camera', '??????????')
			},
			
			/**
			 * ??????????????????
			 */
			async requestStoragePermission() {
				return this.requestAppPlusPermission('storage', '?????????')
			},
			
			/**
			 * ??????????????????
			 */
			async requestLocationPermission() {
				return this.requestAppPlusPermission('location', '??????')
			},
			
			/**
			 * ????????
			 */
			async requestAppPlusPermission(permission, desc) {
				// #ifdef APP-PLUS
				try {
					const result = await this.checkAndRequestPermission(permission, desc)
					return result
				} catch (error) {
					console.error(`${permission}权限请求失败:`, error)
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
								console.log(`${permission}权限请求成功`)
								resolve(true)
							} else {
								console.log(`${permission}权限请求失败`)
								uni.showModal({
									title: '提示',
									content: desc + '权限被拒绝，可能影响部分功能使用',
									showCancel: true,
									cancelText: '取消',
									confirmText: '设置',
									success: (modalResult) => {
										if (modalResult.confirm) {
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
	/*??????css */
</style>
