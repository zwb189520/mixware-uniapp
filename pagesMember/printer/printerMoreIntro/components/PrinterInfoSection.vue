<template>
  <view class="info-section">
    <view class="info-item" @click="handleEditName">
      <text class="info-label">名称</text>
      <view class="value-wrapper">
        <text class="info-value">{{ printerName }}</text>
        <uni-icons type="compose" size="16" color="#999" class="edit-icon"></uni-icons>
      </view>
    </view>
    <view class="info-item">
      <text class="info-label">SN</text>
      <text class="info-value">{{ printerSN }}</text>
    </view>
    <view class="info-item">
      <text class="info-label">MAC</text>
      <text class="info-value">{{ printerMAC }}</text>
    </view>
    <view class="info-item">
      <text class="info-label">绑定时间</text>
      <text class="info-value">{{ bindTime }}</text>
    </view>
  </view>
</template>

<script>
import { getDeviceInfo, updateDeviceInfo } from '@/api/devices.js'

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
      printerName: '',
      printerSN: '',
      printerMAC: '',
      bindTime: '-'
    }
  },
  watch: {
    deviceId: {
      handler(val) {
        if (val) {
          this.loadDeviceInfo()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadDeviceInfo() {
      if (!this.deviceId) return
      try {
        const res = await getDeviceInfo(this.deviceId)
        if (res.data) {
          const info = res.data
          this.printerName = info.deviceName || '未命名设备'
          this.printerSN = info.snCode || '-'
          this.printerMAC = info.deviceId || '-' 
          this.bindTime = info.bindTime ? info.bindTime.split('T')[0] : '-'
          this.$emit('device-info-loaded', info)
        }
      } catch (error) {
        console.error('获取设备信息失败:', error)
      }
    },
    handleEditName() {
      uni.showModal({
        title: '修改设备名称',
        editable: true,
        placeholderText: '请输入新的设备名称',
        content: this.printerName,
        success: async (res) => {
          if (res.confirm && res.content.trim()) {
            const newName = res.content.trim()
            try {
              const updateData = {
                deviceId: this.deviceId,
                deviceName: newName
              }
              await updateDeviceInfo(updateData)
              this.printerName = newName
              uni.showToast({
                title: '修改成功',
                icon: 'success'
              })
              // 刷新信息
              this.loadDeviceInfo()
            } catch (error) {
              uni.showToast({
                title: '修改失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.info-section {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.08);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 107, 53, 0.08);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}

.value-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.edit-icon {
  opacity: 0.6;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
