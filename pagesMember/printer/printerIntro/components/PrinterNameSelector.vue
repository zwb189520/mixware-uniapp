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
        <uni-icons
          v-if="printer.id === currentPrinter.id"
          type="checkmarkempty"
          size="18"
          color="#007AFF"
        ></uni-icons>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { getDeviceList, setDefaultDevice } from '@/api/devices.ts'

export default {
  name: 'PrinterNameSelector',
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
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
  watch: {
    deviceId(newVal) {
      console.log(
        'PrinterNameSelector组件接收到新的deviceId:',
        newVal,
        '当前打印机列表:',
        this.printers
      )
      if (newVal) {
        const printer = this.printers.find(p => p.id === newVal)
        if (printer) {
          this.currentPrinter = printer
          console.log('已找到匹配的打印机:', printer)
        } else {
          console.log('未找到匹配的打印机，当前打印机保持不变')
        }
      }
    }
  },
  async mounted() {
    await this.loadDevices()
  },
  methods: {
    async loadDevices() {
      try {
        const res = await getDeviceList()
        const records = res?.data?.records ?? []

        this.printers = Array.isArray(records)
          ? records.map(device => ({
              id: device.id || device.deviceId,
              name: device.deviceName || device.name || device.deviceId || '未命名设备'
            }))
          : []

        if (this.printers.length > 0) {
          if (this.deviceId) {
            const printer = this.printers.find(p => p.id === this.deviceId)
            if (printer) {
              this.currentPrinter = printer
            } else {
              this.currentPrinter = this.printers[0]
            }
          } else {
            this.currentPrinter = this.printers[0]
          }
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
    async selectPrinter(printer) {
      this.currentPrinter = printer
      this.showDropdown = false

      try {
        await setDefaultDevice(printer.id)
        console.log('成功设置为默认设备:', printer.id)
      } catch (error) {
        console.error('设置默认设备失败:', error)
      }

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
  gap: 12rpx;
  padding: 32rpx 0;
  position: relative;
  width: 100%;
}

.printer-name {
  font-size: 48rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #333 0%, #666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  letter-spacing: 1rpx;
}

.dropdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dropdown-icon:active {
  background: rgba(255, 107, 53, 0.2);
  transform: scale(0.95);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  z-index: 100;
  min-width: 280rpx;
  margin-top: 12rpx;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 36rpx;
  border-bottom: 1rpx solid #fff9f5;
  transition: all 0.2s ease;
}

.dropdown-item:active {
  background: #fff9f5;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}
</style>
