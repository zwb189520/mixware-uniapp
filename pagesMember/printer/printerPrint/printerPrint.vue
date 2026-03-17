<template>
  <view class="printer-print-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="page-content">
      <view v-if="deviceInfo" class="device-info-section">
        <text class="device-info-title">设备信息</text>
        <view class="device-info-item">
          <text class="info-label">设备名称:</text>
          <text class="info-value">{{ deviceInfo.deviceName || '未知' }}</text>
        </view>
        <view class="device-info-item">
          <text class="info-label">设备ID:</text>
          <text class="info-value">{{ deviceInfo.deviceId || '未知' }}</text>
        </view>
        <view v-if="deviceStatus" class="device-info-item">
          <text class="info-label">设备状态:</text>
          <text class="info-value">{{ deviceStatus.deviceState || deviceStatus.connectionStatus || '未知' }}</text>
        </view>
      </view>
      <view class="instruction-section">
        <text class="instruction-title">{{ texts.instructionTitle }}</text>
        <text class="instruction-text">{{ texts.instructionText }}</text>
      </view>
      <view class="demo-image-section">
        <image class="demo-image" src="/static/images/printer/printer-demo.png" mode="aspectFit"></image>
      </view>
    </view>
    <view class="button-section">
      <button class="ready-button" @click="handleReady">{{ texts.readyButton }}</button>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'PrinterPrint',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      printerId: null,
      deviceInfo: null,
      deviceStatus: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.printerPrint
    }
  },
  onLoad(options) {
    this.languageStore.loadLanguage()
    this.printerId = options.printerId || 1
  },
  mounted() {
    this.loadDeviceInfo()
  },
  methods: {
    loadDeviceInfo() {
      this.deviceInfo = uni.getStorageSync('currentDeviceInfo')
      this.deviceStatus = uni.getStorageSync('currentDeviceStatus')
    },
    handleBack() {
      uni.navigateBack()
    },
    handleReady() {
      uni.navigateTo({
        url: `/pagesMember/printer/addDevice/addDevice?printerId=${this.printerId}`
      })
    }
  }
}
</script>

<style scoped>
.printer-print-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.page-content {
  padding: 40rpx;
}

.device-info-section {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.device-info-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.device-info-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.device-info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.instruction-section {
  margin-bottom: 60rpx;
}

.instruction-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.instruction-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
}

.demo-image-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.demo-image {
  width: 400rpx;
  height: 300rpx;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.ready-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #FF5A00;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}
</style>

