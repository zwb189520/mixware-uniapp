<template>
  <view class="device-success-page">
    <safe-area />
    <custom-navbar :title="pageTitle" @back="handleBack" />
    <view class="page-content">
      <!-- 加载中 -->
      <view v-if="bindStatus === 'loading'" class="status-section">
        <view class="loading-icon">
          <view class="loading-spinner"></view>
        </view>
        <text class="status-title">{{ texts.binding || '正在绑定设备...' }}</text>
        <text class="status-subtitle">{{ texts.pleaseWait || '请稍候' }}</text>
      </view>

      <!-- 绑定成功 -->
      <view v-else-if="bindStatus === 'success'" class="status-section">
        <view class="status-icon success">
          <text class="icon-text">✓</text>
        </view>
        <text class="status-title success-color">{{ texts.bindingSuccess }}</text>
        <text class="status-subtitle">{{ texts.openExperience }}</text>
        <view class="button-section">
          <button class="home-button" @click="handleGoHome">{{ texts.goHome }}</button>
        </view>
      </view>

      <!-- 绑定失败 -->
      <view v-else-if="bindStatus === 'failed'" class="status-section">
        <view class="status-icon failed">
          <text class="icon-text">✕</text>
        </view>
        <text class="status-title failed-color">{{ texts.bindingFailed || '绑定失败' }}</text>
        <text class="status-subtitle">{{
          texts.bindingFailedHint || '设备绑定未成功，请检查网络后重试'
        }}</text>
        <view class="button-section">
          <button class="retry-button" @click="retryBind">
            {{ texts.retryBind || '重新绑定' }}
          </button>
          <button class="home-button-outline" @click="handleGoHome">
            {{ texts.goHome || '返回首页' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { bindDevice, getDeviceInfo, setDefaultDevice } from '@/api/devices.ts'
import { getDeviceStatus, getDeviceAuth } from '@/api/iot.ts'
import { useLanguageStore } from '@/stores/index.ts'
import type { ApiResponse, Device } from '@/types/api'

interface DeviceStatusData {
  deviceId?: string
  deviceState?: string
  printState?: string
  message?: string
  updateTime?: string
}

export default {
  name: 'DeviceSuccess',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      printerId: null as string | null,
      bindStatus: 'loading' as 'loading' | 'success' | 'failed'
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.deviceSuccess
    },
    pageTitle(): string {
      if (this.bindStatus === 'success') return this.texts.bindingSuccess || '绑定成功'
      if (this.bindStatus === 'failed') return this.texts.bindingFailed || '绑定失败'
      return this.texts.binding || '正在绑定'
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  onLoad(options: Record<string, string>): void {
    this.printerId = options.printerId || null
    if (this.printerId) {
      this.bindPrinter()
    } else {
      this.bindStatus = 'success'
    }
  },
  methods: {
    async bindPrinter(): Promise<void> {
      this.bindStatus = 'loading'
      console.log('开始绑定设备，设备ID:', this.printerId)
      try {
        const res = await bindDevice({
          deviceId: this.printerId as string
        })
        console.log('绑定API返回:', res)
        const bindOk =
          res.code === 1 ||
          res.code === 200 ||
          res.code === 100508 ||
          (res.msg && res.msg.includes('已绑定'))
        if (bindOk) {
          console.log('绑定成功（或已绑定），开始获取设备信息...')
          let deviceInfo: ApiResponse<Device> | null = null
          let deviceStatus: ApiResponse<DeviceStatusData> | null = null

          try {
            deviceInfo = await getDeviceInfo(this.printerId as string)
            console.log('设备信息获取完成:', deviceInfo)
            if (deviceInfo && (deviceInfo.code === 1 || deviceInfo.code === 200)) {
              console.log('设备信息获取成功')
            } else if (deviceInfo) {
              console.warn('获取设备信息失败:', deviceInfo.msg)
            }
          } catch (infoError) {
            console.error('获取设备信息出错:', infoError)
          }

          try {
            console.log('开始获取设备MQTT授权信息...')
            const deviceAuth = await getDeviceAuth(this.printerId as string)
            console.log('设备授权信息获取完成:', deviceAuth)
            if (deviceAuth && (deviceAuth.code === 1 || deviceAuth.code === 200)) {
              if (deviceAuth.data) {
                uni.setStorageSync('deviceMqttConfig', deviceAuth.data)
                console.log('MQTT配置已存储:', deviceAuth.data)
              }
            } else if (deviceAuth) {
              console.warn('获取设备授权信息失败:', deviceAuth.msg)
            }
          } catch (authError) {
            console.error('获取设备授权信息出错:', authError)
          }

          try {
            console.log('开始获取设备状态...')
            deviceStatus = await getDeviceStatus(this.printerId as string)
            console.log('设备状态获取完成:', deviceStatus)
            if (deviceStatus && (deviceStatus.code === 1 || deviceStatus.code === 200)) {
              console.log('设备状态获取成功')
            } else if (deviceStatus) {
              console.warn('获取设备状态失败:', deviceStatus.msg)
            }
          } catch (statusError) {
            console.error('获取设备状态出错:', statusError)
          }

          if (deviceInfo && (deviceInfo.code === 1 || deviceInfo.code === 200)) {
            uni.setStorageSync('currentDeviceInfo', deviceInfo.data)
            console.log('设备信息已存储到本地缓存:', deviceInfo.data)

            try {
              const setDefaultRes = await setDefaultDevice(this.printerId as string)
              console.log('设置默认设备响应:', setDefaultRes)
            } catch (setDefaultError) {
              console.error('设置默认设备失败:', setDefaultError)
            }
          }

          if (deviceStatus && (deviceStatus.code === 1 || deviceStatus.code === 200)) {
            const statusData = {
              deviceId: deviceStatus.data?.deviceId || this.printerId,
              deviceState: deviceStatus.data?.deviceState || 'offline',
              printState: deviceStatus.data?.printState || 'StandingBy',
              message: deviceStatus.data?.message || '',
              updateTime: deviceStatus.data?.updateTime || new Date().toISOString(),
              print_state: deviceStatus.data?.printState || 'StandingBy',
              device_id: deviceStatus.data?.deviceId || this.printerId,
              device_online: deviceStatus.data?.deviceState === 'online'
            }
            uni.setStorageSync('currentDeviceStatus', statusData)
            console.log('设备状态已存储到本地缓存:', statusData)
          }

          this.bindStatus = 'success'
        } else {
          console.log('绑定失败，code:', res.code)
          this.bindStatus = 'failed'
        }
      } catch (error) {
        console.error('设备绑定失败:', error)
        this.bindStatus = 'failed'
      }
    },

    retryBind(): void {
      this.bindPrinter()
    },

    handleBack(): void {
      uni.navigateBack()
    },

    handleGoHome(): void {
      uni.switchTab({
        url: '/pages/profile/profile'
      })
    }
  }
}
</script>

<style scoped>
.device-success-page {
  min-height: 100vh;
  background-color: #fff9f5;
}

.page-content {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 88rpx);
  padding-top: 160rpx;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.status-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

.success {
  background-color: #52c41a;
}

.failed {
  background-color: #ff4d4f;
}

.icon-text {
  color: white;
  font-size: 80rpx;
  font-weight: bold;
}

/* 加载状态 */
.loading-icon {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

.loading-spinner {
  width: 100rpx;
  height: 100rpx;
  border: 8rpx solid #ffe0d0;
  border-top-color: #ff5a00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 标题 */
.status-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}

.success-color {
  color: #333;
}
.failed-color {
  color: #ff3b30;
}

.status-subtitle {
  display: block;
  font-size: 30rpx;
  color: #888;
  text-align: center;
  margin-bottom: 80rpx;
  padding: 0 40rpx;
  line-height: 1.6;
}

/* 按钮 */
.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.home-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #ff5a00;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 90, 0, 0.3);
}

.retry-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #ff5a00;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 90, 0, 0.3);
}

.home-button-outline {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: transparent;
  color: #ff5a00;
  font-size: 32rpx;
  border: 2rpx solid #ff5a00;
  border-radius: 50rpx;
}
</style>
