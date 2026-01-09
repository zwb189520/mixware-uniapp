<template>
  <view class="printer-intro-page">
    <printer-intro-navbar :device-id="deviceId" />
    
    <view class="content-container">
      <printer-name-selector @printer-change="handlePrinterChange" />
      
      <printer-status :status="printerStatus" />
      
      <printer-image />
      
      <printer-progress 
        :progress="progress" 
        :estimated-time="estimatedTime"
      />
      
      <view v-if="showEncouragement" class="encouragement-text">
        <text>你的创造正在诞生，快去打印机旁看看吧！</text>
      </view>
    </view>
  </view>
</template>

<script>
import PrinterIntroNavbar from './components/PrinterIntroNavbar.vue'
import PrinterNameSelector from './components/PrinterNameSelector.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import PrinterImage from './components/PrinterImage.vue'
import PrinterProgress from './components/PrinterProgress.vue'
import { getDeviceStatus } from '@/api/iot.js'
import { getDefaultDevice } from '@/api/devices.js'

export default {
  name: 'PrinterIntro',
  components: {
    PrinterIntroNavbar,
    PrinterNameSelector,
    PrinterStatus,
    PrinterImage,
    PrinterProgress
  },
  data() {
    return {
      printerStatus: 'idle',
      progress: 0,
      estimatedTime: '0分钟',
      showEncouragement: true,
      deviceId: ''
    }
  },
  async mounted() {
    await this.loadDefaultDevice()
    await this.loadDeviceStatus()
  },
  methods: {
    async loadDefaultDevice() {
      try {
        const res = await getDefaultDevice()
        if (res.data && res.data.deviceId) {
          this.deviceId = res.data.deviceId
        }
      } catch (error) {
        console.error('获取默认设备失败:', error)
      }
    },
    async loadDeviceStatus() {
      if (!this.deviceId) return
      
      try {
        const res = await getDeviceStatus(this.deviceId)
        if (res.data) {
          const status = res.data
          const printProgress = status.virtualSdcard?.progress || 0
          this.progress = Math.round(printProgress)
          this.printerStatus = this.progress > 0 && this.progress < 100 ? 'printing' : 'idle'
          this.showEncouragement = this.printerStatus === 'printing'
        }
      } catch (error) {
        console.error('获取设备状态失败:', error)
        this.printerStatus = 'offline'
        this.showEncouragement = false
      }
    },
    handlePrinterChange(printer) {
      this.deviceId = printer.id
      this.loadDeviceStatus()
    }
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
}

.encouragement-text {
  margin-top: 40rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.encouragement-text text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
  text-align: center;
  display: block;
}
</style>
