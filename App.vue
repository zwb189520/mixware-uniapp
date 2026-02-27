<script>
	import { useLanguageStore } from '@/stores'
	import { checkAllPermissions } from '@/utils/permission.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 初始化语言设置
			const languageStore = useLanguageStore()
			languageStore.loadLanguage()
			
			// 请求必要权限
			this.requestAppPermissions()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			async requestAppPermissions() {
				// #ifdef APP-PLUS
				try {
					// Android/iOS权限请求
					await this.requestAppPlusPermissions();
				} catch (error) {
					console.error('权限请求失败:', error);
				}
				// #endif
				
				// 通用权限检查
				await checkAllPermissions();
			},
			
			async requestAppPlusPermissions() {
				const permissions = [
					// 蓝牙权限
					{ permission: "bluetooth", desc: "用于连接和管理蓝牙设备" },
					// 相机权限
					{ permission: "camera", desc: "用于拍照和扫描二维码" },
					// 存储权限
					{ permission: "storage", desc: "用于保存图片和文件" },
					// 位置权限
					{ permission: "location", desc: "用于定位服务" }
				];
				
				for (const perm of permissions) {
					try {
						const result = await this.checkAndRequestPermission(perm.permission, perm.desc);
						if (!result) {
							console.warn(`${perm.permission}权限被拒绝`);
						}
					} catch (error) {
						console.error(`${perm.permission}权限请求出错:`, error);
					}
				}
			},
			
			checkAndRequestPermission(permission, desc) {
				return new Promise((resolve, reject) => {
					plus.android.requestPermissions(
						[this.getAndroidPermission(permission)],
						(resultObj) => {
							if (resultObj.grantedPermissions.length > 0) {
								console.log(`${permission}权限获取成功`);
								resolve(true);
							} else {
								console.log(`${permission}权限被拒绝`);
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
											plus.runtime.openSettings();
										}
										resolve(false);
									}
								});
							}
						},
						(error) => {
							console.error(`权限请求失败: ${error.message}`);
							reject(error);
						}
					);
				});
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
			};
			return permissionMap[permission] || permission;
		}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
