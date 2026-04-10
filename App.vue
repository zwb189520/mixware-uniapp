<script lang="ts">
import { useLanguageStore, useUserStore } from '@/stores'
import { checkUpdate } from '@/api/ota'

const APP_VERSION = '1.0.0'

export default {
  onLaunch: function () {
    console.log('App Launch')

    // 初始化用户状态，从本地存储加载 Token 等信息
    const userStore = useUserStore()
    userStore.initFromStorage()

    // 初始化语言设置，确保 TabBar 等UI组件显示正确语言
    const languageStore = useLanguageStore()
    languageStore.loadLanguage(false)

    // 检查并请求必要的权限
    this.initPermissionCheck()

    // 检查OTA更新
    this.checkAppUpdate()
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return (this.languageStore.texts.common || {}) as Record<string, string>
    }
  },
  methods: {
    /**
     * 初始化权限检查
     * 在 APP 启动时检查并请求必要的权限
     */
    initPermissionCheck() {
      // #ifdef APP-PLUS
      try {
        // 以下是需要检查的权限列表
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
     * 请求蓝牙权限
     */
    async requestBluetoothPermission() {
      return this.requestAppPlusPermission('bluetooth', '需要蓝牙权限')
    },

    /**
     * 请求相机权限（用于扫码/拍照）
     */
    async requestCameraPermission() {
      return this.requestAppPlusPermission('camera', '需要相机权限')
    },

    /**
     * 请求存储权限（用于保存文件）
     */
    async requestStoragePermission() {
      return this.requestAppPlusPermission('storage', '需要存储权限')
    },

    /**
     * 请求定位权限（用于蓝牙扫描）
     */
    async requestLocationPermission() {
      return this.requestAppPlusPermission('location', '需要定位权限')
    },

    /**
     * 请求权限
     */
    async requestAppPlusPermission(permission: string, desc: string): Promise<boolean> {
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

    checkAndRequestPermission(permission: string, desc: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        plus.android.requestPermissions(
          [this.getAndroidPermission(permission)],
          (resultObj: { grantedPermissions: string[] }) => {
            if (resultObj.grantedPermissions.length > 0) {
              console.log(`${permission}权限请求成功`)
              resolve(true)
            } else {
              console.log(`${permission}权限请求失败`)
              uni.showModal({
                title: this.texts.tip || '提示',
                content: desc + (this.texts.permissionDenied || '权限被拒绝，可能影响部分功能使用'),
                showCancel: true,
                cancelText: this.texts.cancel || '取消',
                confirmText: this.texts.settings || '设置',
                success: (modalResult: { confirm: boolean }) => {
                  if (modalResult.confirm) {
                    plus.runtime.openSettings()
                  }
                  resolve(false)
                }
              })
            }
          },
          (error: { message: string }) => {
            console.error(`权限请求失败: ${error.message}`)
            reject(error)
          }
        )
      })
    },

    getAndroidPermission(permission: string): string {
      const permissionMap: Record<string, string> = {
        bluetooth: 'android.permission.BLUETOOTH',
        camera: 'android.permission.CAMERA',
        storage: 'android.permission.WRITE_EXTERNAL_STORAGE',
        location: 'android.permission.ACCESS_FINE_LOCATION',
        locationAlways: 'android.permission.ACCESS_BACKGROUND_LOCATION',
        microphone: 'android.permission.RECORD_AUDIO',
        contacts: 'android.permission.READ_CONTACTS',
        systemAlertWindow: 'android.permission.SYSTEM_ALERT_WINDOW',
        notifications: 'android.permission.POST_NOTIFICATIONS'
      }
      return permissionMap[permission] || permission
    },

    /**
     * 检查OTA更新
     */
    checkAppUpdate(): void {
      checkUpdate(APP_VERSION).then((res: unknown) => {
        const typedRes = res as {
          code: number
          data?: { hasUpdate: boolean; latestVersion: string; downloadUrl: string; remark?: string }
        }
        if (typedRes.code !== 0 || !typedRes.data?.hasUpdate) return

        const { latestVersion, downloadUrl, remark } = typedRes.data

        uni.showModal({
          title: `${this.texts.newVersionFound || '发现新版本'} ${latestVersion}`,
          content: remark || this.texts.updateAvailable || '有新版本可用，是否更新？',
          confirmText: this.texts.updateNow || '立即更新',
          success: (r: { confirm: boolean }) => {
            if (!r.confirm) return

            // #ifdef APP-PLUS
            this.downloadAndInstall(downloadUrl)
            // #endif

            // #ifdef H5
            window.open(downloadUrl)
            // #endif

            // #ifdef MP
            uni.showToast({
              title: this.texts.pleaseGoToAppStore || '请前往应用商店更新',
              icon: 'none'
            })
            // #endif
          }
        })
      })
    },

    /**
     * 下载并安装更新包
     */
    downloadAndInstall(url: string): void {
      uni.showLoading({ title: this.texts.downloading || '下载中...', mask: true })

      uni.downloadFile({
        url,
        success: (res: { statusCode: number; tempFilePath: string }) => {
          uni.hideLoading()
          if (res.statusCode !== 200) {
            uni.showToast({ title: this.texts.downloadFailed || '下载失败', icon: 'none' })
            return
          }
          plus.runtime.install(
            res.tempFilePath,
            {},
            () => {
              plus.runtime.restart()
            },
            (e: { message: string }) => {
              uni.showToast({
                title: (this.texts.installFailed || '安装失败') + ':' + e.message,
                icon: 'none'
              })
            }
          )
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: this.texts.downloadFailed || '下载失败', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style>
/* 全局样式 */
@import '@dcloudio/uni-ui/lib/uni-icons/uniicons.css';
</style>
