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
        <text class="status-title">正在绑定设备...</text>
        <text class="status-subtitle">请稍候</text>
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
        <text class="status-title failed-color">绑定失败</text>
        <text class="status-subtitle">设备绑定未成功，请检查网络后重试</text>
        <view class="button-section">
          <button class="retry-button" @click="retryBind">重新绑定</button>
          <button class="home-button-outline" @click="handleGoHome">返回首页</button>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { bindDevice } from '@/api/devices.js'
import { getDeviceInfo } from '@/api/deviceManager.js'
import { getDeviceStatus, getDeviceAuth } from '@/api/iot.js'
import { useLanguageStore } from '@/stores'

export default {
  name: 'DeviceSuccess',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      printerId: null,
      bindStatus: 'loading' // loading | success | failed
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.deviceSuccess
    },
    pageTitle() {
      if (this.bindStatus === 'success') return '绑定成功'
      if (this.bindStatus === 'failed') return '绑定失败'
      return '正在绑定'
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  onLoad(options) {
    this.printerId = options.printerId || null
    if (this.printerId) {
      this.bindPrinter()
    } else {
      // 无 printerId（WiFi直连模式），直接显示成功
      this.bindStatus = 'success'
    }
  },
  methods: {
    async bindPrinter() {
      this.bindStatus = 'loading'
      console.log('开始绑定设备，设备ID:', this.printerId)
      try {
        const res = await bindDevice({
          deviceId: this.printerId
        })
        console.log('绑定API返回:', res)
        // code=1/200 绑定成功；其他已绑定的错误码也视为成功继续流程
        const bindOk = res.code === 1 || res.code === 200 || res.code === 100508 || (res.msg && res.msg.includes('已绑定'))
        if (bindOk) {
          console.log('绑定成功（或已绑定），开始获取设备信息...')
          let deviceInfo = null
          let deviceStatus = null

          try {
            deviceInfo = await getDeviceInfo(this.printerId)
            console.log('设备信息获取完成:', deviceInfo)
            if (deviceInfo.code === 1 || deviceInfo.code === 200) {
              console.log('设备信息获取成功')
            } else {
              console.warn('获取设备信息失败:', deviceInfo.msg)
            }
          } catch (infoError) {
            console.error('获取设备信息出错:', infoError)
          }

          // 获取设备MQTT授权信息
          try {
            console.log('开始获取设备MQTT授权信息...')
            const deviceAuth = await getDeviceAuth(this.printerId)
            console.log('设备授权信息获取完成:', deviceAuth)
            if (deviceAuth.code === 1 || deviceAuth.code === 200) {
              if (deviceAuth.data) {
                uni.setStorageSync('deviceMqttConfig', deviceAuth.data)
                console.log('MQTT配置已存储:', deviceAuth.data)
              }
            } else {
              console.warn('获取设备授权信息失败:', deviceAuth.msg)
            }
          } catch (authError) {
            console.error('获取设备授权信息出错:', authError)
          }

          try {
            console.log('开始获取设备状态...')
            deviceStatus = await getDeviceStatus(this.printerId)
            console.log('设备状态获取完成:', deviceStatus)
            if (deviceStatus.code === 1 || deviceStatus.code === 200) {
              console.log('设备状态获取成功')
            } else {
              console.warn('获取设备状态失败:', deviceStatus.msg)
            }
          } catch (statusError) {
            console.error('获取设备状态出错:', statusError)
          }

          // 存储设备信息到本地缓存
          if (deviceInfo && (deviceInfo.code === 1 || deviceInfo.code === 200)) {
            uni.setStorageSync('currentDeviceInfo', deviceInfo.data)
            console.log('设备信息已存储到本地缓存:', deviceInfo.data)
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

          // 绑定成功，切换页面状态
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

    retryBind() {
      this.bindPrinter()
    },

    handleBack() {
      uni.navigateBack()
    },

    handleGoHome() {
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
  background-color: #FFF9F5;
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
  border: 8rpx solid #FFE0D0;
  border-top-color: #FF5A00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.success-color { color: #333; }
.failed-color  { color: #FF3B30; }

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
  background-color: #FF5A00;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}

.retry-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #FF5A00;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}

.home-button-outline {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: transparent;
  color: #FF5A00;
  font-size: 32rpx;
  border: 2rpx solid #FF5A00;
  border-radius: 50rpx;
}
</style>
