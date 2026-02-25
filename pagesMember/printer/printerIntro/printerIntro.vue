<template>
  <view class="printer-intro-page">
    <view class="header-wrapper">
      <safe-area />
      <custom-navbar :title="texts.title" @back="handleBack">
        <template #right>
          <view class="more-btn" @click="handleMoreInfo">
            <uni-icons type="more-filled" size="24" color="#333"></uni-icons>
          </view>
        </template>
      </custom-navbar>
    </view>
    <view class="content-container">
      <printer-name-selector :device-id="deviceId" @printer-change="handlePrinterChange" />
      <printer-status :status="printerStatus" />
      <printer-image />
      <printer-progress 
        :progress="progress" 
        :estimated-time="estimatedTime"
      />
      <view v-if="showEncouragement" class="encouragement-text">
        <view class="encouragement-icon">🎉</view>
        <text>你的创造正在诞生，快去打印机旁看看吧！</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import PrinterNameSelector from './components/PrinterNameSelector.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import PrinterImage from './components/PrinterImage.vue'
import PrinterProgress from './components/PrinterProgress.vue'
import { getDeviceStatus } from '@/api/iot.js'
import { getDefaultDevice, getDeviceList, setDefaultDevice } from '@/api/devices.js'
import { useLanguageStore } from '@/stores'

export default {
  name: 'PrinterIntro',
  components: {
    CustomNavbar,
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
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.printerIntro || {}
    }
  },
  async mounted() {
    this.languageStore.loadLanguage()
    // 确保语言数据加载完成后再执行后续逻辑
    await this.$nextTick()
    try {
      await this.loadDefaultDevice()
      await this.loadDeviceStatus()
    } catch (error) {
      console.error('初始化设备信息失败:', error)
      uni.showToast({
        title: this.texts.connectionFailed || '加载设备信息失败',
        icon: 'none'
      })
    }
  },
  onLoad(options) {
    console.log('printerIntro页面接收到的options:', options)
    if (options.deviceId) {
      this.deviceId = options.deviceId
      console.log('设置deviceId:', this.deviceId)
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    async loadDefaultDevice() {
      // 如果已经有deviceId了，就不需要再加载默认设备
      console.log('loadDefaultDevice方法被调用，当前deviceId:', this.deviceId)
      if (this.deviceId) {
        console.log('已有deviceId，跳过加载默认设备')
        return
      }
      
      try {
        const res = await getDefaultDevice()
        console.log('getDefaultDevice响应:', res)
        if (res.data && res.data.deviceId) {
          this.deviceId = res.data.deviceId
          console.log('从默认设备获取到deviceId:', this.deviceId)
        } else {
          const listRes = await getDeviceList()
          console.log('getDeviceList响应:', listRes)
          if (listRes.data && listRes.data.records && listRes.data.records.length > 0) {
            const firstDevice = listRes.data.records[0]
            this.deviceId = firstDevice.deviceId
            console.log('从设备列表获取第一个设备ID:', this.deviceId)
            await setDefaultDevice(firstDevice.deviceId)
          }
        }
      } catch (error) {
        console.error('获取默认设备失败:', error)
      }
    },
    async loadDeviceStatus() {
      console.log('loadDeviceStatus方法被调用，deviceId:', this.deviceId)
      if (!this.deviceId) {
        console.log('deviceId为空，跳过加载设备状态')
        return
      }
      
      try {
        const res = await getDeviceStatus(this.deviceId)
        console.log('getDeviceStatus响应:', res)
        if (res.code === 1 && res.data) {
          const status = res.data
          const printProgress = status.virtualSdcard?.progress || 0
          const printState = status.printStats?.state || ''
          this.progress = Math.round(printProgress)
          
          if (printState === 'Printing' || (this.progress > 0 && this.progress < 100)) {
            this.printerStatus = 'printing'
          } else if (printState === 'Pausing' || printState === 'Aborting') {
            this.printerStatus = 'paused'
          } else {
            this.printerStatus = 'idle'
          }
          this.showEncouragement = this.printerStatus === 'printing'
        } else {
          console.log('设备状态数据为空或接口返回失败')
          this.printerStatus = 'offline'
          this.showEncouragement = false
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
    },
    
    handleMoreInfo() {
      uni.navigateTo({
        url: '/pagesMember/printer/printerMoreIntro/printerMoreIntro'
      })
    }
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFF 100%);
  position: relative;
  overflow: hidden;
}

.header-wrapper {
  background: #fff;
  position: relative;
  z-index: 10;
}

.printer-intro-page::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -15%;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-bg 8s ease-in-out infinite;
}

.printer-intro-page::after {
  content: '';
  position: absolute;
  bottom: -15%;
  left: -10%;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255, 142, 83, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-bg 10s ease-in-out infinite reverse;
}

@keyframes pulse-bg {
  0%, 100% { transform: scale(1) translateY(0); opacity: 0.5; }
  50% { transform: scale(1.2) translateY(-30rpx); opacity: 0.8; }
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
  position: relative;
  z-index: 1;
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  transition: all 0.3s ease;
}

.more-btn:active {
  opacity: 0.6;
  transform: scale(0.95);
}

.encouragement-text {
  margin-top: 60rpx;
  padding: 32rpx 60rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 80rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 53, 0.4);
  position: relative;
  overflow: hidden;
  animation: slide-up 0.6s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.encouragement-text::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 240rpx;
  height: 240rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

.encouragement-text::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -15%;
  width: 180rpx;
  height: 180rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 5s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20rpx) scale(1.1); }
}

.encouragement-icon {
  font-size: 48rpx;
  text-align: center;
  margin-bottom: 16rpx;
  animation: bounce 1s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.encouragement-text text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 700;
  text-align: center;
  display: block;
  position: relative;
  z-index: 2;
  text-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
  line-height: 1.6;
  letter-spacing: 1rpx;
}
</style>
