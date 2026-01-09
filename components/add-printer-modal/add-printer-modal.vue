<template>
  <view v-if="visible" class="modal-overlay" @tap="handleCancel">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">添加打印机</text>
      </view>
      
      <view class="modal-body">
        <view v-if="loading" class="loading">
          <text>加载中...</text>
        </view>
        <view v-else-if="deviceList.length === 0" class="empty">
          <text>暂无可用设备</text>
        </view>
        <view v-else>
          <view v-for="device in deviceList" :key="device.deviceId" class="printer-item">
            <view class="printer-main" @tap="handleSelectPrinter(device.deviceId)">
              <image class="printer-icon" src="/static/img/printer-icon.png" mode="aspectFit" />
              <view class="printer-info">
                <text class="printer-name">{{ device.deviceName || '未命名设备' }}</text>
                <text class="printer-model">{{ device.deviceModel || '未知型号' }}</text>
              </view>
            </view>
            <view class="printer-actions">
              <view class="bind-btn" @tap="handleBindDevice(device.deviceId)">
                <uni-icons type="link" size="18" color="#007aff"></uni-icons>
              </view>
              <view class="delete-btn" @tap="handleDeleteDevice(device.deviceId)">
                <uni-icons type="trash" size="18" color="#ff4d4f"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="btn-cancel" @tap="handleCancel">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getDeviceList, deleteDevice, bindDevice } from '@/api/devices.js'

export default {
  name: 'AddPrinterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      deviceList: [],
      loading: false
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadDeviceList()
      }
    }
  },
  methods: {
    async loadDeviceList() {
      this.loading = true
      try {
        const res = await getDeviceList()
        const currentUserId = uni.getStorageSync('userId') || ''
        console.log('当前用户ID:', currentUserId)
        console.log('设备列表完整响应:', res)
        console.log('设备列表数据:', res.data)
        console.log('设备列表记录:', res.data?.records)
        if (res.data && res.data.records) {
          this.deviceList = res.data.records
          console.log('最终设备列表:', this.deviceList)
          this.deviceList.forEach((device, index) => {
            console.log(`设备${index}:`, {
              deviceId: device.deviceId,
              deviceName: device.deviceName,
              deviceModel: device.deviceModel,
              userId: device.userId,
              deviceStatus: device.deviceStatus
            })
          })
        }
      } catch (error) {
        console.error('获取设备列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    handleSelectPrinter(printerId) {
      console.log('选择的设备ID:', printerId)
      const selectedDevice = this.deviceList.find(d => d.deviceId === printerId)
      console.log('选择的设备详情:', selectedDevice)
      this.$emit('select-printer', printerId)
    },
    async handleBindDevice(deviceId) {
      try {
        uni.showLoading({
          title: '绑定中...'
        })
        
        await bindDevice({
          deviceId: deviceId
        })
        
        uni.hideLoading()
        uni.showToast({
          title: '绑定成功',
          icon: 'success'
        })
        
        await this.loadDeviceList()
      } catch (error) {
        uni.hideLoading()
        console.error('绑定设备失败:', error)
        uni.showToast({
          title: error.message || '绑定失败',
          icon: 'none'
        })
      }
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 40rpx;
}

.loading,
.empty {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.printer-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.printer-main {
  flex: 1;
  display: flex;
  align-items: center;
}

.printer-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 30rpx;
}

.printer-info {
  flex: 1;
}

.printer-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.printer-model {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.printer-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bind-btn,
.delete-btn {
  padding: 10rpx;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.btn-cancel {
  width: 100%;
  padding: 16rpx 40rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  border: none;
  background-color: #007aff;
  color: white;
}
</style>
