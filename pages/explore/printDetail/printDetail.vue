<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.workDetail" @back="handleBack" />

    <scroll-view scroll-y class="content-scroll">
      <!-- 设备选择器 -->
      <view class="device-selector-section">
        <view class="device-selector" @click="showDeviceSelector">
          <text class="device-label-text">{{ texts.deviceNameLabel || '设备名称' }}</text>
          <view class="device-right">
            <text class="device-name">{{
              currentDevice.name || texts.selectDevice || '选择设备'
            }}</text>
            <uni-icons type="down" size="16" color="#666"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 打印机状态 -->
      <view class="status-section">
        <view class="status-row">
          <text class="status-label">{{ texts.printerStatusLabel || '打印机状态' }}</text>
          <view class="status-badge" :class="statusBadgeClass">
            <view class="status-dot" :class="statusDotClass"></view>
            <text class="status-badge-text">{{ displayStatus }}</text>
          </view>
        </view>
      </view>

      <!-- 模型图片 -->
      <view class="model-image-section">
        <image class="model-image" :src="modelImage" mode="aspectFit" @error="handleImageError" />
        <view class="model-name-overlay">
          <text class="model-name-text">{{ modelName }}</text>
        </view>
      </view>

      <!-- 温度卡片 -->
      <view class="section-card">
        <text class="section-title-text">{{ texts.nozzleStatus }}</text>
        <view class="temp-row">
          <view class="temp-item">
            <view class="temp-circle current">
              <text class="temp-num">{{ currentTemp }}</text>
              <text class="temp-unit">&#176;C</text>
            </view>
            <text class="temp-label">{{ texts.currentTemp }}</text>
          </view>
          <view class="temp-arrow-wrap">
            <text class="temp-arrow">&#8594;</text>
          </view>
          <view class="temp-item">
            <view class="temp-circle target">
              <text class="temp-num">{{ targetTemp }}</text>
              <text class="temp-unit">&#176;C</text>
            </view>
            <text class="temp-label">{{ texts.targetTemp }}</text>
          </view>
        </view>
      </view>

      <!-- 打印进度卡片（打印中、暂停、已完成或空闲时） -->
      <view
        v-if="
          isPrinting ||
          isPaused ||
          currentProgress >= 100 ||
          printerStatus === 'Idle' ||
          printerStatus === 'StandingBy' ||
          !printerStatus
        "
        class="section-card"
      >
        <view class="card-header-row">
          <text class="section-title-text">{{ texts.progress }}</text>
          <text class="progress-pct">{{ currentProgress }}%</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: currentProgress + `%` }"></view>
        </view>
        <view class="device-row" style="margin-top: 16rpx">
          <text class="device-label">{{ texts.printedTime || '已打印时间' }}</text>
          <text class="device-value">{{ formatTime(estimatedPrintTimeSeconds) }}</text>
        </view>
        <view class="device-row" style="margin-top: 12rpx">
          <text class="device-label">{{ texts.estimatedTotalTime || '预计总耗时（约）' }}</text>
          <text class="device-value">{{ printTimeHms || (texts.unknown || '未知') }}</text>
        </view>
        <view class="device-row" style="margin-top: 12rpx">
          <text class="device-label">{{ texts.estimatedFilament || '预计耗材' }}</text>
          <text class="device-value"
            >{{ filamentLengthM ? Number(filamentLengthM).toFixed(2) : '0.00' }} {{ texts.meter || '米' }}</text
          >
        </view>
        <!-- 控制按钮 -->
        <view class="print-actions">
          <template v-if="isPrinting && !isPaused">
            <view class="ctrl-btn pause-btn" @click="handlePause">
              <text class="ctrl-text">{{ texts.pause }}</text>
            </view>
            <view class="ctrl-btn stop-btn" @click="handleCancel">
              <text class="ctrl-text">{{ texts.cancel }}</text>
            </view>
          </template>
          <template v-if="isPaused">
            <view class="ctrl-btn resume-btn" @click="handleResume">
              <text class="ctrl-text">{{ texts.resumePrint }}</text>
            </view>
            <view class="ctrl-btn restart-btn" @click="handleRestart">
              <text class="ctrl-text">{{ texts.restartPrint }}</text>
            </view>
            <view class="ctrl-btn stop-btn" @click="handleCancel">
              <text class="ctrl-text">{{ texts.cancel }}</text>
            </view>
          </template>
          <template v-if="currentProgress >= 100 && !isPrinting && !isPaused">
            <view class="ctrl-btn complete-btn" @click="goToPrintComplete">
              <text class="ctrl-text">{{ texts.printComplete || '打印完成' }}</text>
            </view>
          </template>
          <template
            v-if="
              !isPrinting &&
              !isPaused &&
              currentProgress < 100 &&
              (printerStatus === 'Idle' || printerStatus === 'StandingBy' || !printerStatus)
            "
          >
            <view class="ctrl-btn restart-btn" @click="handleRestart">
              <text class="ctrl-text">{{ texts.reprint || '重新打印' }}</text>
            </view>
          </template>
        </view>
      </view>

      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { getDeviceList, setDefaultDevice } from '@/api/devices.ts'
import {
  sendPauseCommand,
  sendResumeCommand,
  sendRestartCommand,
  sendStopCommand,
  getFirmwareInfo
} from '@/api/iot.ts'
import { getDeviceStatus } from '@/api/devices.ts'
import type { Device } from '@/types/api'

interface LocalDevice {
  id: string
  name: string
}

export default {
  components: { CustomNavbar },
  data() {
    return {
      workId: '' as string,
      modelName: '' as string,
      modelImage: '' as string,
      deviceId: '' as string,
      printerName: '' as string,
      printerStatus: '' as string,
      firmwareVersion: '' as string,
      currentTemp: 0 as number,
      targetTemp: 200 as number,
      currentProgress: 0 as number,
      estimatedPrintTimeSeconds: 0 as number,
      printTimeHms: '' as string,
      filamentLengthM: 0 as number,
      isPrinting: false as boolean,
      isPaused: false as boolean,
      isDownloading: false as boolean,
      gcodeUrl: '' as string,
      modelDimensions: '' as string,
      printTime: '' as string,
      materialWeight: '' as string,
      deviceList: [] as LocalDevice[],
      currentDevice: { id: '', name: '' } as LocalDevice,
      statusTimer: null as ReturnType<typeof setInterval> | null
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.explore
    },
    displayStatus(): string {
      if (this.printerStatus === 'Offline') return '离线'
      if (this.isPrinting) return this.texts.printing || '打印中'
      if (this.isPaused) return this.texts.paused || '已暂停'
      if (this.isDownloading) return this.texts.downloading || '下载中'
      const s = this.printerStatus
      if (s === 'Printing') return this.texts.printing || '打印中'
      if (s === 'Paused' || s === 'Pausing') return this.texts.paused || '已暂停'
      if (s === 'Downloading') return this.texts.downloading || '下载中'
      if (s === 'StandingBy' || s === 'Idle') return this.texts.idle || '空闲'
      if (s === 'Busy') return this.texts.busy || '忙碌'
      return s || this.texts.idle || '空闲'
    },
    statusDotClass(): string {
      if (this.isPrinting) return 'dot-printing'
      if (this.isPaused) return 'dot-paused'
      const s = this.printerStatus
      if (this.printerStatus === 'Offline') return 'dot-offline'
      if (s === 'Printing') return 'dot-printing'
      if (s === 'Paused' || s === 'Pausing') return 'dot-paused'
      if (s === 'Downloading') return 'dot-downloading'
      return 'dot-idle'
    },
    statusBadgeClass(): string {
      if (this.printerStatus === 'Offline') return 'badge-offline'
      if (this.isPrinting) return 'badge-printing'
      if (this.isPaused) return 'badge-paused'
      if (this.isDownloading) return 'badge-downloading'
      return 'badge-idle'
    },
    statusTextClass(): string {
      if (this.printerStatus === 'Offline') return 'text-offline'
      if (this.isPrinting) return 'text-printing'
      if (this.isPaused) return 'text-paused'
      if (this.isDownloading) return 'text-downloading'
      return 'text-idle'
    }
  },
  async onLoad(options: Record<string, string>): Promise<void> {
    this.workId = options.workId || ''
    console.log('printDetail onLoad options:', options)
    console.log('接收到的 workId:', this.workId)

    if (options.modelName) {
      try {
        this.modelName = decodeURIComponent(options.modelName)
      } catch {
        this.modelName = options.modelName || ''
      }
      try {
        this.modelImage = decodeURIComponent(options.modelImage)
      } catch {
        this.modelImage = options.modelImage || ''
      }
      if (!this.modelImage) this.modelImage = '/static/images/logo.png'
      try {
        this.gcodeUrl = decodeURIComponent(options.gcodeUrl)
      } catch {
        this.gcodeUrl = options.gcodeUrl || ''
      }
      try {
        this.printerName = decodeURIComponent(options.printerName)
      } catch {
        this.printerName = options.printerName || ''
      }
      try {
        this.modelDimensions = decodeURIComponent(options.dimensions)
      } catch {
        this.modelDimensions = options.dimensions || ''
      }
      try {
        this.printTime = decodeURIComponent(options.printTime)
      } catch {
        this.printTime = options.printTime || ''
      }
      try {
        this.materialWeight = decodeURIComponent(options.materialWeight)
      } catch {
        this.materialWeight = options.materialWeight || ''
      }
      try {
        this.printTimeHms = decodeURIComponent(options.printTimeHms)
      } catch {
        this.printTimeHms = options.printTimeHms || ''
      }
      try {
        this.filamentLengthM = Number(decodeURIComponent(options.filamentLengthM))
      } catch {
        this.filamentLengthM = Number(options.filamentLengthM) || 0
      }
      this.deviceId = options.deviceId || ''
      this.isPrinting = options.autoStart === 'true'
    } else if (this.workId) {
      this.deviceId = options.deviceId || ''
      await this.loadWorkDetail()
    }

    this.languageStore.loadLanguage()
    this.loadFirmwareInfo()
    this.$nextTick(() => {
      this.loadDeviceList().then(() => {
        this.startStatusPolling()
      })
    })
  },
  onUnload(): void {
    this.stopStatusPolling()
  },
  methods: {
    async loadDeviceList(): Promise<void> {
      try {
        const res = await getDeviceList()
        const records = res?.data ?? []
        this.deviceList = Array.isArray(records)
          ? records.map((device) => ({
              id: device.deviceId || '',
              name: device.deviceName || device.name || this.texts.unnamedDevice || '未命名设备'
            }))
          : []

        if (this.deviceId) {
          const device = this.deviceList.find(d => d.id === this.deviceId)
          if (device) {
            this.currentDevice = device
            this.printerName = device.name
          }
        } else if (this.deviceList.length > 0) {
          this.currentDevice = this.deviceList[0]
          this.deviceId = this.deviceList[0].id
          this.printerName = this.deviceList[0].name
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
      }
    },
    handleBack(): void {
      uni.navigateBack()
    },
    handleImageError(): void {
      this.modelImage = '/static/images/logo.png'
    },
    showDeviceSelector(): void {
      if (this.deviceList.length === 0) {
        uni.showToast({ title: this.texts.noAvailableDevice || '暂无可用设备', icon: 'none' })
        return
      }
      const itemList = this.deviceList.map(d => d.name)
      uni.showActionSheet({
        itemList,
        success: async (res: UniApp.ShowActionSheetRes) => {
          const selected = this.deviceList[res.tapIndex]
          this.currentDevice = selected
          this.deviceId = selected.id
          this.printerName = selected.name
          try {
            await setDefaultDevice(selected.id)
            this.loadFirmwareInfo()
          } catch (e) {
            console.error('设置默认设备失败:', e)
          }
        }
      })
    },
    async loadFirmwareInfo(): Promise<void> {
      if (!this.deviceId) return

      try {
        const res = await getFirmwareInfo(this.deviceId)
        if (res.code === 1 && res.data) {
          this.firmwareVersion = res.data.version || res.data.currentVersion || ''
        }
      } catch (e) {
        console.log('获取固件信息失败（非关键错误）:', e)
      }
    },
    async handlePause(): Promise<void> {
      if (!this.deviceId) return this._toast(this.texts.deviceIdNotFound || '设备ID不存在')
      uni.showModal({
        title: this.texts.pausePrint || '暂停打印',
        content: this.texts.confirmPausePrint || '确认暂停打印？',
        success: async (res: { confirm: boolean }) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: this.texts.pausing || '暂停中...' })
            await sendPauseCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = true
            this.isPrinting = false
            this._toast(this.texts.printPaused || '打印已暂停', 'success')
          } catch (e) {
            uni.hideLoading()
            const error = e as Error & { msg?: string }
            const errorMsg = error?.message || error?.msg || this.texts.pausePrintFailed || '暂停失败'
            this._toast(errorMsg)
          }
        }
      })
    },
    async handleResume(): Promise<void> {
      if (!this.deviceId) return this._toast(this.texts.deviceIdNotFound || '设备ID不存在')
      uni.showModal({
        title: this.texts.resumePrint || '恢复打印',
        content: this.texts.confirmResumePrint || '确认恢复打印？',
        success: async (res: { confirm: boolean }) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: this.texts.resuming || '恢复中...' })
            await sendResumeCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = false
            this.isPrinting = true
            this._toast(this.texts.printResumed || '打印已恢复', 'success')
          } catch (e) {
            uni.hideLoading()
            const error = e as Error & { msg?: string }
            const errorMsg = error?.message || error?.msg || this.texts.resumePrintFailed || '恢复失败'
            this._toast(errorMsg)
          }
        }
      })
    },
    async handleCancel(): Promise<void> {
      if (!this.deviceId) return this._toast(this.texts.deviceIdNotFound || '设备ID不存在')
      uni.showModal({
        title: this.texts.cancelPrint || '取消打印',
        content: this.texts.confirmCancelPrint || '确认取消打印？此操作不可撤销。',
        success: async (res: { confirm: boolean }) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: this.texts.stopping || '正在停止...' })
            await sendStopCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = false
            this.isPrinting = false
            this._toast(this.texts.printCancelled || '已取消打印', 'success')
            setTimeout(() => uni.navigateBack(), 1500)
          } catch (e) {
            uni.hideLoading()
            const error = e as Error & { msg?: string }
            const errorMsg =
              error?.message || error?.msg || this.texts.stopPrintFailed || '停止失败，请重试'
            this._toast(errorMsg)
          }
        }
      })
    },
    async handleRestart(): Promise<void> {
      if (!this.deviceId || !this.workId)
        return this._toast(this.texts.missingRequiredParams || '缺少必要参数')
      uni.showModal({
        title: this.texts.restartPrint || '重新打印',
        content: this.texts.confirmRestartPrint || '确认重新开始打印？',
        success: async (res: { confirm: boolean }) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: this.texts.restarting || '重启中...' })
            await sendRestartCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = false
            this.isPrinting = true
            this.currentProgress = 0
            this._toast(this.texts.printRestarted || '已重新开始打印', 'success')
          } catch (e) {
            uni.hideLoading()
            const error = e as Error & { msg?: string }
            const errorMsg = error?.message || error?.msg || this.texts.restartPrintFailed || '重启失败'
            this._toast(errorMsg)
          }
        }
      })
    },
    _toast(title: string, icon: 'success' | 'loading' | 'none' = 'none'): void {
      uni.showToast({ title, icon })
    },

    async loadWorkDetail(): Promise<void> {
      try {
        uni.showLoading({ title: this.texts.loading || '加载中...' })
        const { getPrintTaskDetail } = await import('@/api/printTasks.ts')
        const res = await getPrintTaskDetail(this.workId)
        if (res.code === 1 && res.data) {
          const data = res.data as Record<string, unknown>
          console.log('任务详情返回:', data)
          this.modelName = String(data.modelName || '')
          this.modelImage = String(data.previewUrl || '/static/images/logo.png')
          this.gcodeUrl = String(data.sliceGcodeUrl || '')
          this.deviceId = String(data.deviceId || data.device_id || '')
          this.modelDimensions = String(data.dimensions || '')
          this.printTime = String(data.printTime || '')
          this.materialWeight = String(data.materialWeight || '')
          this.isPrinting = data.status === 'printing'
          this.isPaused = data.status === 'paused'
          this.currentProgress = Number(data.progress || 0)
          console.log('设置后的 deviceId:', this.deviceId)

          if (!this.modelName && data.modelId) {
            try {
              const { getModelDetail } = await import('@/api/models.ts')
              const modelRes = await getModelDetail(data.modelId as string | number)
              if (modelRes.code === 1 && modelRes.data) {
                const modelData = modelRes.data as unknown as Record<string, unknown>
                this.modelName = String(modelData.name || '')
                if (!this.modelImage || this.modelImage === '/static/images/logo.png') {
                  this.modelImage = String(modelData.previewUrl || '/static/images/logo.png')
                }
                console.log('从模型详情获取名称:', this.modelName)
              }
            } catch (e) {
              console.error('获取模型详情失败:', e)
            }
          }
        }
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        console.error('加载任务详情失败:', e)
        this._toast(this.texts.loadWorkDetailFailed || '加载任务详情失败')
      }
    },

    startStatusPolling(): void {
      if (!this.deviceId) {
        console.log('deviceId 为空，不启动轮询')
        return
      }
      this.fetchDeviceStatus()
      this.statusTimer = setInterval(() => {
        this.fetchDeviceStatus()
      }, 3000)
    },

    stopStatusPolling(): void {
      if (this.statusTimer) {
        clearInterval(this.statusTimer)
        this.statusTimer = null
      }
    },

    async fetchDeviceStatus(): Promise<void> {
      if (!this.deviceId) return
      try {
        const res = await getDeviceStatus(this.deviceId)
        console.log('设备状态返回:', res)
        if (res.code === 1 || res.code === 0) {
          const data = res.data
          console.log('message内容:', data?.message)
          this.printerStatus = data?.printState || ''
          const printState = data?.printState
          this.isPrinting = printState === 'Printing'
          this.isPaused = printState === 'Paused' || printState === 'Pausing'
          this.isDownloading = printState === 'Downloading'
          if (data?.deviceState === 'offline') {
            this.printerStatus = 'Offline'
          }
          if (data?.message) {
            this.parseMessage(data.message, printState || '')
          }
          if (data?.printTimeHms !== undefined) {
            this.printTimeHms = data.printTimeHms
          }
          if (data?.filamentLengthM !== undefined) {
            this.filamentLengthM = data.filamentLengthM
          }
          if (
            this.currentProgress >= 100 &&
            (printState === 'StandingBy' || printState === 'Idle')
          ) {
            this.checkPrintComplete()
          }
        }
      } catch (error) {
        console.error('获取设备状态失败:', error)
      }
    },

    parseMessage(message: string, printState: string): void {
      try {
        const cleanMessage = message.replace(/\s+/g, ' ').trim()
        const msgObj = JSON.parse(cleanMessage)

        if (msgObj.temperature !== undefined) {
          this.currentTemp = Number(msgObj.temperature)
        }
        if (msgObj.target !== undefined) {
          this.targetTemp = Number(msgObj.target)
        }

        if (printState === 'Printing') {
          if (msgObj.progress !== undefined) {
            this.currentProgress = Math.round(Number(msgObj.progress) * 100)
          }
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

        console.log('解析message成功:', {
          state: printState,
          currentTemp: this.currentTemp,
          targetTemp: this.targetTemp,
          progress: this.currentProgress
        })
      } catch (e) {
        console.error('解析message失败:', message, e)
      }
    },

    updateProgress(progress: number): void {
      this.currentProgress = progress
      if (progress >= 100) {
        this.isPrinting = false
        this.checkPrintComplete()
      }
    },
    goToPrintComplete(): void {
      this.stopStatusPolling()
      const printTimeStr = this.printTimeHms || this.printTime || ''
      const materialStr = this.filamentLengthM
        ? `${Number(this.filamentLengthM).toFixed(2)}${this.texts.meter || '米'}`
        : this.materialWeight || ''
      uni.navigateTo({
        url: `/pages/explore/printComplete/printComplete?modelId=${encodeURIComponent(this.workId || '')}&modelName=${encodeURIComponent(this.modelName || '')}&modelImage=${encodeURIComponent(this.modelImage || '/static/images/logo.png')}&printTime=${encodeURIComponent(printTimeStr)}&material=${encodeURIComponent(materialStr)}&size=${encodeURIComponent(this.modelDimensions || '')}`
      })
    },

    checkPrintComplete(): void {
      if (this.currentProgress >= 100 && !this.isPrinting && !this.isPaused) {
        this.goToPrintComplete()
      }
    },

    formatTime(seconds: number): string {
      const texts = this.texts
      if (!seconds || seconds <= 0) return '0' + (texts.minutes || '分钟')
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      if (hours > 0) return `${hours}${texts.hours || '小时'}${minutes}${texts.minutes?.replace(/s$/, '') || '分'}${secs}${texts.seconds || '秒'}`
      if (minutes > 0) return `${minutes}${texts.minutes?.replace(/s$/, '') || '分'}${secs}${texts.seconds || '秒'}`
      return `${secs}${texts.seconds || '秒'}`
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
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff9f5;
}
.content-scroll {
  flex: 1;
  height: 0;
  padding-bottom: 40rpx;
}
.bottom-safe {
  height: 40rpx;
}

/* 设备选择器 */
.device-selector-section {
  padding: 24rpx 24rpx 16rpx;
}
.device-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
}
.device-label-text {
  font-size: 28rpx;
  color: #888;
}
.device-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.device-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a2e;
}

/* 状态区域 */
.status-section {
  padding: 0 24rpx 16rpx;
}
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
}
.status-label {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
}

/* 模型图片 */
.model-image-section {
  position: relative;
  width: 100%;
  height: 500rpx;
  margin: 0 24rpx 24rpx;
  width: calc(100% - 48rpx);
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}
.model-image {
  width: 100%;
  height: 100%;
}
.model-name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.45));
}
.model-name-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

/* 通用卡片 */
.section-card {
  margin: 0 24rpx 24rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
  position: relative;
  padding-bottom: 12rpx;
  display: block;
  margin-bottom: 20rpx;
}
.section-title-text::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 48rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #ff5a00, #ff8c00);
  border-radius: 2rpx;
}
.card-header-row .section-title-text {
  margin-bottom: 0;
  padding-bottom: 0;
}
.card-header-row .section-title-text::after {
  display: none;
}

/* 状态徽章 */
.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}
.badge-printing {
  background: rgba(42, 127, 255, 0.1);
}
.badge-paused {
  background: rgba(246, 166, 35, 0.1);
}
.badge-idle {
  background: rgba(82, 196, 26, 0.1);
}
.badge-offline {
  background: rgba(153, 153, 153, 0.1);
}
.badge-downloading {
  background: rgba(114, 46, 209, 0.1);
}
.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}
.dot-printing {
  background: #2a7fff;
}
.dot-paused {
  background: #f6a623;
}
.dot-idle {
  background: #52c41a;
}
.dot-offline {
  background: #999;
}
.dot-downloading {
  background: #722ed1;
}
.status-badge-text {
  font-size: 24rpx;
  font-weight: 600;
}
.badge-printing .status-badge-text {
  color: #2a7fff;
}
.badge-paused .status-badge-text {
  color: #f6a623;
}
.badge-idle .status-badge-text {
  color: #52c41a;
}
.badge-offline .status-badge-text {
  color: #999;
}
.badge-downloading .status-badge-text {
  color: #722ed1;
}

/* 设备行 */
.device-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
}
.device-row:last-child {
  border-bottom: none;
}
.device-label {
  font-size: 28rpx;
  color: #888;
  font-weight: 500;
}
.device-value {
  font-size: 28rpx;
  color: #1a1a2e;
  font-weight: 600;
}

/* 温度 */
.temp-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding-top: 8rpx;
}
.temp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.temp-circle {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.temp-circle.current {
  background: #fff8e6;
  border: 4rpx solid #f6a623;
}
.temp-circle.target {
  background: #fff0f0;
  border: 4rpx solid #ff5a00;
}
.temp-num {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}
.temp-circle.current .temp-num {
  color: #f6a623;
}
.temp-circle.target .temp-num {
  color: #ff5a00;
}
.temp-unit {
  font-size: 20rpx;
}
.temp-circle.current .temp-unit {
  color: #f6a623;
}
.temp-circle.target .temp-unit {
  color: #ff5a00;
}
.temp-label {
  font-size: 24rpx;
  color: #888;
}
.temp-arrow-wrap {
  display: flex;
  align-items: center;
}
.temp-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 进度 */
.progress-pct {
  font-size: 34rpx;
  font-weight: 800;
  color: #ff5a00;
}
.progress-bar-bg {
  width: 100%;
  height: 14rpx;
  background: #f0ede8;
  border-radius: 7rpx;
  overflow: hidden;
  margin-bottom: 4rpx;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff5a00, #ff8c00);
  border-radius: 7rpx;
  transition: width 0.4s ease;
}

/* 控制按钮 */
.print-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}
.ctrl-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  border: 2rpx solid transparent;
}
.ctrl-btn:active {
  opacity: 0.75;
}
.ctrl-text {
  font-size: 28rpx;
  font-weight: 700;
}
.pause-btn {
  background: #fff9f5;
  border-color: #ff8c00;
}
.pause-btn .ctrl-text {
  color: #ff8c00;
}
.resume-btn {
  background: #f0fff4;
  border-color: #52c41a;
}
.resume-btn .ctrl-text {
  color: #52c41a;
}
.restart-btn {
  background: #fff9f5;
  border-color: #ff5a00;
}
.restart-btn .ctrl-text {
  color: #ff5a00;
}
.stop-btn {
  background: #fff5f5;
  border-color: #ff4d4f;
}
.stop-btn .ctrl-text {
  color: #ff4d4f;
}
.complete-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}
.complete-btn .ctrl-text {
  color: #fff;
}
</style>
