<template>
  <view class="info-section">
    <view class="info-item">
      <text class="info-label">名称</text>
      <text class="info-value">{{ printerName }}</text>
    </view>
    <view class="info-item">
      <text class="info-label">SN</text>
      <text class="info-value">{{ printerSN }}</text>
    </view>
    <view class="info-item">
      <text class="info-label">MAC</text>
      <text class="info-value">{{ printerMAC }}</text>
    </view>
  </view>
</template>

<script>
import { getDeviceInfo } from '@/api/devices.js'

export default {
  name: 'PrinterInfoSection',
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      printerName: 'KD-3D Printer Pro',
      printerSN: 'KD2024010001',
      printerMAC: '00:1A:2B:3C:4D:5E'
    }
  },
  async mounted() {
    if (this.deviceId) {
      await this.loadDeviceInfo()
    }
  },
  methods: {
    async loadDeviceInfo() {
      try {
        const res = await getDeviceInfo(this.deviceId)
        if (res.data) {
          const info = res.data
          this.printerName = info.deviceName || 'KD-3D Printer Pro'
          this.printerSN = info.snCode || 'KD2024010001'
          this.printerMAC = info.deviceId || '00:1A:2B:3C:4D:5E'
          this.$emit('device-info-loaded', info)
        }
      } catch (error) {
        console.error('获取设备信息失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.info-section {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 400;
}
</style>
