<template>
  <view class="printer-name-container">
    <text class="printer-name">{{ currentPrinter.name }}</text>
    <view class="dropdown-icon" @click="toggleDropdown">
      <uni-icons type="down" size="20"></uni-icons>
    </view>
    
    <view v-if="showDropdown" class="dropdown-menu" @click="handleDropdownClick">
      <view 
        v-for="printer in printers" 
        :key="printer.id" 
        class="dropdown-item"
        @click="selectPrinter(printer)"
      >
        <text class="dropdown-item-text">{{ printer.name }}</text>
        <uni-icons v-if="printer.id === currentPrinter.id" type="checkmarkempty" size="18" color="#007AFF"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import { getDeviceList } from '@/api/devices.js'

export default {
  name: 'PrinterNameSelector',
  data() {
    return {
      showDropdown: false,
      currentPrinter: {
        id: '',
        name: '选择设备'
      },
      printers: []
    }
  },
  async mounted() {
    await this.loadDevices()
  },
  methods: {
    async loadDevices() {
      try {
        console.log('扫描可用设备...')
        const res = await getDeviceList()
        const data = res?.data ?? res ?? []
        console.log('扫描到的设备:', data)
        
        this.printers = Array.isArray(data) ? data
          .filter(device => {
            const deviceName = device.deviceName || device.name || ''
            return deviceName && deviceName.startsWith('WG')
          })
          .map(device => ({
            id: device.id || device.deviceId,
            name: device.deviceName || device.name || device.deviceId || '未命名设备'
          })) : []
          
        if (this.printers.length > 0) {
          this.currentPrinter = this.printers[0]
        }
      } catch (error) {
        console.error('扫描设备失败:', error)
      }
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    handleDropdownClick() {
      this.showDropdown = false
    },
    selectPrinter(printer) {
      this.currentPrinter = printer
      this.$emit('printer-change', printer)
    }
  }
}
</script>

<style scoped>
.printer-name-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  position: relative;
}

.printer-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.dropdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 240rpx;
  margin-top: 8rpx;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item-text {
  font-size: 28rpx;
  color: #333;
}
</style>
