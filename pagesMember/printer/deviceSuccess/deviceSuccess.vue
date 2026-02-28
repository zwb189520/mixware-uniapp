<template>
  <view class="device-success-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="page-content">
      <view class="gif-section">
        <image 
          class="gift-gif" 
          src="https://wimg.588ku.com/gif320/24/07/09/3a365c98db3a4d75a1f7365687bf7d56.gif" 
          mode="aspectFit"
        ></image>
      </view>
      <view class="success-title-section">
        <text class="success-title">{{ texts.bindingSuccess }}</text>
      </view>
      <view class="subtitle-section">
        <text class="subtitle">{{ texts.openExperience }}</text>
      </view>
      <view class="button-section">
        <button class="home-button" @click="handleGoHome">{{ texts.goHome }}</button>
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
      printerId: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.deviceSuccess
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  onLoad(options) {
    this.printerId = options.printerId || null
    if (this.printerId) {
      this.bindPrinter()
    }
  },
  methods: {
    async bindPrinter() {
      console.log('开始绑定设备，设备ID:', this.printerId)
      try {
        const res = await bindDevice({
          deviceId: this.printerId
        })
        console.log('绑定API返回:', res)
        if (res.code === 1 || res.code === 200) {
          console.log('绑定成功，开始获取设备信息...')
          let deviceInfo = null
          let deviceStatus = null
          
          try {
            deviceInfo = await getDeviceInfo(this.printerId)
            console.log('设备信息获取完成:', deviceInfo)
            
            if (deviceInfo.code === 1 || deviceInfo.code === 200) {
              console.log('设备信息获取成功')
            } else {
              console.warn('获取设备信息失败:', deviceInfo.msg)
              uni.showToast({
                title: '设备信息获取不完整，但绑定成功',
                icon: 'none'
              })
            }
          } catch (infoError) {
            console.error('获取设备信息出错:', infoError)
            uni.showToast({
              title: '设备信息获取异常，但绑定成功',
              icon: 'none'
            })
          }
          
          // 先获取设备MQTT授权信息（状态接口依赖MQTT连接）
          let deviceAuth = null
          try {
            console.log('开始获取设备MQTT授权信息...')
            deviceAuth = await getDeviceAuth(this.printerId)
            console.log('设备授权信息获取完成:', deviceAuth)
            
            if (deviceAuth.code === 1 || deviceAuth.code === 200) {
              console.log('设备授权信息获取成功')
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
              uni.showToast({
                title: '设备状态获取不完整，但绑定成功',
                icon: 'none'
              })
            }
          } catch (statusError) {
            console.error('获取设备状态出错:', statusError)
            uni.showToast({
              title: '设备状态获取异常，但绑定成功',
              icon: 'none'
            })
          }
          
          console.log('准备存储设备信息到本地缓存...')
          // 即使某些信息获取失败，也要尝试存储可用的数据
          if (deviceInfo && (deviceInfo.code === 1 || deviceInfo.code === 200)) {
            uni.setStorageSync('currentDeviceInfo', deviceInfo.data)
            console.log('设备信息已存储到本地缓存:', deviceInfo.data)
          } else {
            console.log('设备信息获取失败，不存储设备信息')
          }
          
          if (deviceStatus && (deviceStatus.code === 1 || deviceStatus.code === 200)) {
            // 根据新API接口结构处理设备状态数据
            const statusData = {
              deviceId: deviceStatus.data?.deviceId || this.printerId,
              deviceState: deviceStatus.data?.deviceState || 'offline',
              printState: deviceStatus.data?.printState || 'StandingBy',
              message: deviceStatus.data?.message || '',
              updateTime: deviceStatus.data?.updateTime || new Date().toISOString(),
              // 保持兼容旧数据结构的字段
              print_state: deviceStatus.data?.printState || 'StandingBy',
              device_id: deviceStatus.data?.deviceId || this.printerId,
              device_online: deviceStatus.data?.deviceState === 'online'
            }
            uni.setStorageSync('currentDeviceStatus', statusData)
            console.log('设备状态已存储到本地缓存:', statusData)
          } else {
            console.log('设备状态获取失败，不存储设备状态')
          }
          
          // 验证数据是否正确存储
          const storedDeviceInfo = uni.getStorageSync('currentDeviceInfo')
          const storedDeviceStatus = uni.getStorageSync('currentDeviceStatus')
          console.log('验证存储的数据 - 设备信息:', storedDeviceInfo)
          console.log('验证存储的数据 - 设备状态:', storedDeviceStatus)
          
          // 显示成功提示
          uni.showToast({
            title: this.texts.bindingSuccessToast,
            icon: 'success'
          })
        } else {
          console.log('绑定失败，code:', res.code)
          uni.showToast({
            title: this.texts.bindingFailed,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('设备绑定失败:', error)
        console.error('详细错误信息:', error.message, error.stack)
        uni.showToast({
          title: this.texts.bindingFailed,
          icon: 'none'
        })
      }
    },
    handleBack() {
      uni.navigateBack()
    },
    handleGoHome() {
      // 如果有打印机ID，表示是通过蓝牙配网添加的设备，可以跳转到设备管理页面
      // 否则，表示是WiFi连接模式，直接跳转到首页
      if (this.printerId) {
        // 跳转到设备详情或设备列表页面
        uni.switchTab({
          url: '/pages/profile/profile'
        })
      } else {
        // 回到首页（探索页面）
        uni.switchTab({
          url: '/pages/explore/explore/explore'
        })
      }
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
  padding-top: 200rpx;
}

.gif-section {
  margin-bottom: 60rpx;
}

.gift-gif {
  width: 500rpx;
  height: 500rpx;
}

.success-title-section {
  margin-bottom: 20rpx;
}

.success-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.subtitle-section {
  margin-bottom: 80rpx;
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: #666;
  text-align: center;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
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
</style>