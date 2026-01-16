<template>
  <view class="device-success-page">
    <safe-area />
    <custom-navbar title="添加设备" @back="handleBack" />
    <view class="page-content">
      <view class="gif-section">
        <image 
          class="gift-gif" 
          src="https://wimg.588ku.com/gif320/24/07/09/3a365c98db3a4d75a1f7365687bf7d56.gif" 
          mode="aspectFit"
        ></image>
      </view>
      <view class="success-title-section">
        <text class="success-title">设备绑定成功</text>
      </view>
      <view class="subtitle-section">
        <text class="subtitle">开启3D打印初体验！</text>
      </view>
      <view class="button-section">
        <button class="home-button" @click="handleGoHome">回到首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { bindDevice } from '@/api/devices.js'

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
  onLoad(options) {
    this.printerId = options.printerId || null
    if (this.printerId) {
      this.bindPrinter()
    }
  },
  methods: {
    async bindPrinter() {
      try {
        const res = await bindDevice({
          deviceId: this.printerId
        })
        console.log('设备绑定结果:', res)
      } catch (error) {
        console.error('设备绑定失败:', error)
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
  background-color: #f5f5f5;
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
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}
</style>