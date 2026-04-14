<template>
  <view class="printer-intro-page">
    <view class="header-wrapper">
      <safe-area />
      <custom-navbar :title="String(texts.title || '')" @back="handleBack">
        <!-- 打印机设置入口，暂时隐藏 -->
        <!-- <template #right>
          <view class="more-btn" @click="handleMoreInfo">
            <uni-icons type="more-filled" size="24" color="#333"></uni-icons>
          </view>
        </template> -->
      </custom-navbar>
    </view>
    <view class="content-container">
      <printer-name-selector :device-id="deviceId" @printer-change="handlePrinterChange" />
      <printer-status :status="printerStatus" />
      <printer-image />
      <printer-progress
        :progress="progress"
        :estimated-time="formatTime(estimatedPrintTimeSeconds)"
        :print-time-hms="printTimeHms"
        :filament-length-m="filamentLengthM"
        :status="printerStatus"
      />
      <view v-if="showEncouragement" class="encouragement-text">
        <view class="encouragement-icon">🎉</view>
        <text>{{ texts.encouragementText || '你的创造正在诞生，快去打印机旁看看吧！' }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import PrinterNameSelector from './components/PrinterNameSelector.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import PrinterImage from './components/PrinterImage.vue'
import PrinterProgress from './components/PrinterProgress.vue'
import {
  getDeviceStatus,
  getDefaultDevice,
  getDeviceList,
  setDefaultDevice
} from '@/api/devices.ts'
import { useLanguageStore } from '@/stores/index.ts'

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
      printerStatus: 'StandingBy' as string,
      progress: 0 as number,
      estimatedTime: '' as string,
      printTimeHms: '' as string,
      filamentLengthM: 0 as number,
      estimatedPrintTimeSeconds: 0 as number,
      showEncouragement: true as boolean,
      deviceId: '' as string,
      statusTimer: null as ReturnType<typeof setInterval> | null
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string | Record<string, string>> {
      return this.languageStore?.texts?.printerIntro || {}
    }
  },
  onLoad(options: Record<string, string>): void {
    console.log('printerIntro页面接收到的options:', options)
    if (options.deviceId) {
      this.deviceId = options.deviceId
      console.log('设置deviceId:', this.deviceId)
    }
  },
  onShow(): void {
    this.languageStore.loadLanguage()
    this.initDevice()
  },
  onHide(): void {
    this.stopStatusPolling()
  },
  onUnload(): void {
    this.stopStatusPolling()
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },
    async initDevice(): Promise<void> {
      try {
        if (!this.deviceId) {
          await this.loadDefaultDevice()
        }
        if (this.deviceId) {
          await this.loadDeviceStatus()
          this.startStatusPolling()
        }
      } catch (error) {
        console.error('初始化设备信息失败:', error)
        uni.showToast({
          title: String(this.texts.connectionFailed || '加载设备信息失败'),
          icon: 'none'
        })
      }
    },
    startStatusPolling(): void {
      this.stopStatusPolling()
      this.statusTimer = setInterval(() => {
        this.loadDeviceStatus()
      }, 3000)
    },
    stopStatusPolling(): void {
      if (this.statusTimer) {
        clearInterval(this.statusTimer)
        this.statusTimer = null
      }
    },
    async loadDefaultDevice(): Promise<void> {
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
          if (listRes.data && listRes.data.length > 0) {
            const firstDevice = listRes.data[0]
            this.deviceId = firstDevice.deviceId
            console.log('从设备列表获取第一个设备ID:', this.deviceId)
            await setDefaultDevice(firstDevice.deviceId)
          }
        }
      } catch (error) {
        console.error('获取默认设备失败:', error)
      }
    },
    async loadDeviceStatus(): Promise<void> {
      if (!this.deviceId) return

      try {
        const res = await getDeviceStatus(this.deviceId)
        console.log('--- [设备状态调试] ---')
        console.log('接口响应:', JSON.stringify(res, null, 2))
        if (res.data) {
          console.log('核心数据(data):', JSON.stringify(res.data, null, 2))
        }
        console.log('---------------------')

        if (res.code === 1 && res.data) {
          const status = res.data

          if (status.deviceId === null && status.deviceState === null) {
            console.warn('--- [状态异常] 后端返回了空状态对象，请检查设备是否已激活或上报数据 ---')
            this.printerStatus = 'offline'
            this.showEncouragement = false
            return
          }

          const deviceState = (status.deviceState || '').toLowerCase()
          const printState = status.printState || ''

          if (
            deviceState === 'offline' ||
            (status.deviceState === null && status.printState === null)
          ) {
            this.printerStatus = 'offline'
            this.progress = 0
            this.showEncouragement = false
            return
          }

          this.printerStatus = printState || 'online'

          if (status.progress !== undefined && this.printerStatus !== 'offline') {
            this.progress = Math.round(status.progress)
          }
          if (status.printTimeHms !== undefined) {
            this.printTimeHms = status.printTimeHms
          }
          if (status.filamentLengthM !== undefined) {
            this.filamentLengthM = status.filamentLengthM
          }
          if (status.message) {
            this.parseMessage(status.message, status.printState)
          }
          if (status.printTimeHms !== undefined && this.estimatedPrintTimeSeconds === 0) {
            this.estimatedTime = status.printTimeHms
          }
          this.showEncouragement = this.printerStatus === 'Printing'
        } else {
          this.printerStatus = 'offline'
          this.progress = 0
          this.showEncouragement = false
        }
      } catch (error) {
        console.error('获取设备状态异常:', error)
        this.printerStatus = 'offline'
      }
    },
    handlePrinterChange(printer: Record<string, unknown>): void {
      this.deviceId = String(printer.id || printer.deviceId || '')
      this.loadDeviceStatus()
    },

    handleMoreInfo(): void {
      uni.navigateTo({
        url: '/pagesMember/printer/printerMoreIntro/printerMoreIntro'
      })
    },

    parseMessage(message: string, printState: string): void {
      try {
        const cleanMessage = message.replace(/\s+/g, ' ').trim()
        const msgObj = JSON.parse(cleanMessage)
        if (msgObj.progress !== undefined && printState === 'Printing') {
          this.progress = Math.round(Number(msgObj.progress) * 100)
        }
        if (msgObj.print_duration !== undefined) {
          if (typeof msgObj.print_duration === 'string' && msgObj.print_duration.includes('m')) {
            this.estimatedPrintTimeSeconds = this.parseDuration(msgObj.print_duration)
          } else {
            this.estimatedPrintTimeSeconds = Number(msgObj.print_duration)
          }
        }
        if (msgObj.total_duration !== undefined) {
          this.estimatedPrintTimeSeconds = this.parseDuration(msgObj.total_duration)
        }
      } catch (e) {
        console.error('解析message失败:', message, e)
      }
    },

    parseDuration(durationStr: string): number {
      if (!durationStr || typeof durationStr !== 'string') return 0
      let totalSeconds = 0
      const hourMatch = durationStr.match(/(\d+)h/)
      const minMatch = durationStr.match(/(\d+)m/)
      const secMatch = durationStr.match(/(\d+)s/)
      if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600
      if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60
      if (secMatch) totalSeconds += parseInt(secMatch[1])
      return totalSeconds
    },

    formatTime(seconds: number): string {
      if (!seconds || seconds <= 0) return '0分钟'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      if (hours > 0) return `${hours}小时${minutes}分${secs}秒`
      if (minutes > 0) return `${minutes}分${secs}秒`
      return `${secs}秒`
    },

    addMinutesToTimeStr(timeStr: string, minutesToAdd: number): string {
      if (!timeStr || typeof timeStr !== 'string') return timeStr
      let totalMinutes = 0
      const hourMatch = timeStr.match(/(\d+)\s*小时/)
      const minMatch = timeStr.match(/(\d+)\s*分/)
      if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60
      if (minMatch) totalMinutes += parseInt(minMatch[1])
      totalMinutes += minutesToAdd
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      if (hours > 0) return `${hours}小时${mins}分`
      return `${mins}分`
    }
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9f5 0%, #fff 100%);
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
  0%,
  100% {
    transform: scale(1) translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2) translateY(-30rpx);
    opacity: 0.8;
  }
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0rpx 32rpx;
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
  margin-top: 16rpx;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%);
  border-radius: 80rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(255, 107, 53, 0.25);
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
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.1);
  }
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
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
