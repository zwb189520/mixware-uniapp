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
          <text>未扫描到蓝牙设备</text>
        </view>
        <view v-else>
          <view v-for="device in deviceList" :key="device.id || device.deviceId" class="printer-item">
            <view class="printer-main" @tap="handleSelectPrinter(device.deviceId)">
              <image class="printer-icon" src="/static/img/printer-icon.png" mode="aspectFit" />
              <view class="printer-info">
                <text class="printer-name">{{ device.deviceName || device.name || '未命名设备' }}</text>
                <text class="printer-model">{{ device.deviceId || '未知设备' }}</text>
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
import { deleteDevice, bindDevice } from '@/api/devices.js'
import { initBluetooth, startBluetoothScan, stopBluetoothScan, getBluetoothDevices } from '@/utils/bluetooth.js'
import { checkAllPermissions } from '@/utils/permission.js'

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
      loading: false,
      bluetoothDevices: [],
      scanType: 'bluetooth', // 默认蓝牙扫描，不要API设备
      scanTimer: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadDeviceList()
      } else {
        this.stopBluetoothScan()
      }
    }
  },
  methods: {
    async loadDeviceList() {
      this.loading = true
      try {
        // 只使用蓝牙扫描，不要API设备
        await this.scanBluetoothDevices()
      } catch (error) {
        console.error('扫描设备失败:', error)
      } finally {
        this.loading = false
      }
    },
    

    
    async scanBluetoothDevices() {
      console.log('扫描蓝牙设备...')
      
      try {
        const hasPermission = await checkAllPermissions()
        if (!hasPermission) {
          console.log('权限不足，无法扫描')
          return
        }
        
        await initBluetooth()
        await startBluetoothScan()
        
        uni.showLoading({
          title: '扫描中...'
        })
        
        this.scanTimer = setTimeout(async () => {
          const devices = await getBluetoothDevices()
          console.log('蓝牙扫描结果:', devices)
          
          uni.hideLoading()
          
          this.bluetoothDevices = devices.map(device => ({
            id: device.deviceId,
            name: device.displayName,
            deviceId: device.deviceId,
            deviceName: device.displayName,
            rssi: device.RSSI,
            isBluetooth: true
          }))
          
          this.deviceList = this.bluetoothDevices
          await stopBluetoothScan()
          
          if (this.bluetoothDevices.length === 0) {
            uni.showToast({
              title: '未扫描到任何蓝牙设备',
              icon: 'none'
            })
          }
        }, 10000) // 10秒扫描时间
        
      } catch (error) {
        uni.hideLoading()
        console.error('蓝牙扫描失败:', error)
        uni.showToast({
          title: '蓝牙扫描失败: ' + error.message,
          icon: 'none'
        })
      }
    },
    
    stopBluetoothScan() {
      try {
        if (this.scanTimer) {
          clearTimeout(this.scanTimer)
          this.scanTimer = null
        }
        uni.hideLoading()
        stopBluetoothScan()
        console.log('蓝牙扫描已停止')
      } catch (error) {
        console.log('停止扫描失败:', error)
      }
    },
    

    handleSelectPrinter(printerId) {
      this.$emit('select-printer', printerId)
    },
    async handleBindDevice(deviceId) {
      // 蓝牙设备直接选择，不需要绑定
      this.$emit('select-printer', deviceId)
    },
    handleCancel() {
      this.stopBluetoothScan()
      this.$emit('cancel')
    },

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
  position: relative;
  text-align: center;
  margin-bottom: 40rpx;
}

.scan-type-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;
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

.add-device-hint {
  margin-top: 20rpx;
  padding: 20rpx 40rpx;
  background-color: #007aff;
  border-radius: 50rpx;
  display: inline-block;
}

.hint-text {
  color: white;
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
