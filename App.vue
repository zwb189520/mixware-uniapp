<script lang="ts">
import { useLanguageStore, useUserStore } from '@/stores'
import { checkUpdate } from '@/api/ota'
import { cancelAllRequests } from '@/api/request'

const APP_VERSION = '1.0.0'

interface UniShowModalResult {
  confirm: boolean
  cancel: boolean
}

interface CheckUpdateResponse {
  code: number
  data?: {
    hasUpdate: boolean
    latestVersion: string
    downloadUrl: string
    remark?: string
  }
}

interface DownloadResult {
  statusCode: number
  tempFilePath: string
}

interface InstallError {
  message: string
}

const errorMessages: Record<string, string> = {
  '3D渲染错误': '3D模型加载失败，请刷新重试',
  'Network Error': '网络连接失败，请检查网络',
  'timeout': '请求超时，请稍后重试',
  'chunk': '资源加载失败，请刷新页面'
}

const getErrorMessage = (error: Error): string => {
  const errorMsg = error.message || ''
  for (const [key, value] of Object.entries(errorMessages)) {
    if (errorMsg.includes(key)) {
      return value
    }
  }
  return '应用发生错误，请刷新重试'
}

const handleGlobalError = (error: Error, context?: string): void => {
  console.error('[全局错误]', context || '', error)

  const message = getErrorMessage(error)

  uni.showModal({
    title: '错误提示',
    content: message,
    showCancel: true,
    cancelText: '取消',
    confirmText: '刷新',
    success: (res: UniShowModalResult) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/explore/explore/explore' })
      }
    }
  })
}

export default {
  onLaunch: function () {
    console.log('App Launch')

    const userStore = useUserStore()
    userStore.initFromStorage()

    const languageStore = useLanguageStore()
    languageStore.loadLanguage(false)

    this.initPermissionCheck()
    this.checkAppUpdate()
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
    cancelAllRequests()
  },
  onError: function (error: string) {
    handleGlobalError(new Error(error), 'Vue Error')
  },
  onUnhandledRejection: function (promise: PromiseRejectionEvent) {
    handleGlobalError(promise.reason instanceof Error ? promise.reason : new Error(String(promise.reason)), 'Unhandled Promise')
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
                    ;(plus.runtime as any).openSettings()
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
        const typedRes = res as CheckUpdateResponse
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
