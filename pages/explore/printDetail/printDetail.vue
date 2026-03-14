<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.workDetail" @back="handleBack" />

    <scroll-view scroll-y class="content-scroll">
      <!-- 设备选择器 -->
      <view class="device-selector-section">
        <view class="device-selector" @click="showDeviceSelector">
          <text class="device-label-text">设备名称</text>
          <view class="device-right">
            <text class="device-name">{{ currentDevice.name || '选择设备' }}</text>
            <uni-icons type="down" size="16" color="#666"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 打印机状态 -->
      <view class="status-section">
        <view class="status-row">
          <text class="status-label">打印机状态</text>
          <view class="status-badge" :class="statusBadgeClass">
            <view class="status-dot" :class="statusDotClass"></view>
            <text class="status-badge-text">{{ displayStatus }}</text>
          </view>
        </view>
      </view>

      <!-- 模型图片 -->
      <view class="model-image-section">
        <image
          class="model-image"
          :src="modelImage"
          mode="aspectFit"
          @error="handleImageError"
        />
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

      <!-- 打印进度卡片（打印中或暂停时） -->
      <view v-if="isPrinting || isPaused" class="section-card">
        <view class="card-header-row">
          <text class="section-title-text">{{ texts.progress }}</text>
          <text class="progress-pct">{{ currentProgress }}%</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: currentProgress + `%` }"></view>
        </view>
        <view class="device-row" style="margin-top:16rpx;">
          <text class="device-label">{{ texts.estimatedTime }}</text>
          <text class="device-value">{{ estimatedTime }} 分钟</text>
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
        </view>
      </view>

      <!-- 临时测试按钮 -->
      <view class="test-btn" @click="goToPrintComplete">
        <text class="test-btn-text">测试：跳转打印完成页</text>
      </view>

      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { useLanguageStore } from '@/stores'
import { getDeviceList, setDefaultDevice } from '@/api/devices.js'
import {
  sendPauseCommand,
  sendResumeCommand,
  sendRestartCommand,
  sendStopCommand,
  getFirmwareInfo
} from '@/api/iot.js'

export default {
  components: { CustomNavbar },
  data() {
    return {
      workId: '',
      modelName: '',
      modelImage: '',
      deviceId: '',
      printerName: '',
      printerStatus: '',
      firmwareVersion: '',
      currentTemp: 0,
      targetTemp: 200,
      currentProgress: 0,
      estimatedTime: 0,
      isPrinting: false,
      isPaused: false,
      gcodeUrl: '',
      deviceList: [],
      currentDevice: { id: '', name: '' }
    }
  },
  computed: {
    languageStore() { return useLanguageStore() },
    texts() { return this.languageStore.texts.explore },
    displayStatus() {
      if (this.isPrinting) return '打印中'
      if (this.isPaused) return '已暂停'
      const s = this.printerStatus
      if (s === 'Printing') return '打印中'
      if (s === 'Paused' || s === 'Pausing') return '已暂停'
      if (s === 'StandingBy' || s === 'Idle') return this.texts.idle || '空闲'
      if (s === 'Busy') return this.texts.busy || '忙碌'
      return s || '空闲'
    },
    statusDotClass() {
      if (this.isPrinting) return 'dot-printing'
      if (this.isPaused) return 'dot-paused'
      const s = this.printerStatus
      if (s === 'Printing') return 'dot-printing'
      if (s === 'Paused' || s === 'Pausing') return 'dot-paused'
      return 'dot-idle'
    },
    statusBadgeClass() {
      if (this.isPrinting) return 'badge-printing'
      if (this.isPaused) return 'badge-paused'
      return 'badge-idle'
    },
    statusTextClass() {
      if (this.isPrinting) return 'text-printing'
      if (this.isPaused) return 'text-paused'
      return 'text-idle'
    }
  },
  onLoad(options) {
    this.workId = options.workId || ''
    try { this.modelName = options.modelName ? decodeURIComponent(options.modelName) : '' } catch { this.modelName = options.modelName || '' }
    try { this.modelImage = options.modelImage ? decodeURIComponent(options.modelImage) : '' } catch { this.modelImage = options.modelImage || '' }
    if (!this.modelImage) this.modelImage = '/static/images/logo.png'
    try { this.gcodeUrl = options.gcodeUrl ? decodeURIComponent(options.gcodeUrl) : '' } catch { this.gcodeUrl = options.gcodeUrl || '' }
    try { this.printerName = options.printerName ? decodeURIComponent(options.printerName) : '' } catch { this.printerName = options.printerName || '' }
    this.deviceId = options.deviceId || ''
    this.isPrinting = options.autoStart === 'true'
    this.languageStore.loadLanguage()
    if (this.deviceId) {
      this.loadFirmwareInfo()
    }
    this.$nextTick(() => {
      this.loadDeviceList()
    })
  },
  methods: {
    async loadDeviceList() {
      try {
        const res = await getDeviceList()
        const records = res?.data?.records ?? []
        this.deviceList = Array.isArray(records) ? records.map(device => ({
          id: device.id || device.deviceId,
          name: device.deviceName || device.name || device.deviceId || '未命名设备'
        })) : []
        
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
    handleBack() { uni.navigateBack() },
    handleImageError() { this.modelImage = '/static/images/logo.png' },
    showDeviceSelector() {
      if (this.deviceList.length === 0) {
        uni.showToast({ title: '暂无可用设备', icon: 'none' })
        return
      }
      const itemList = this.deviceList.map(d => d.name)
      uni.showActionSheet({
        itemList,
        success: async (res) => {
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
    async loadFirmwareInfo() {
      try {
        const res = await getFirmwareInfo(this.deviceId)
        if (res.code === 1 && res.data) {
          this.firmwareVersion = res.data.version || res.data.currentVersion || ''
        }
      } catch (e) { console.error('获取固件信息失败:', e) }
    },
    async handlePause() {
      if (!this.deviceId) return this._toast('设备ID不存在')
      uni.showModal({
        title: this.texts.pausePrint || '暂停打印', content: '确认暂停打印？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: '暂停中...' })
            await sendPauseCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = true; this.isPrinting = false
            this._toast('打印已暂停', 'success')
          } catch (e) { uni.hideLoading(); this._toast(this.texts.pausePrintFailed || '暂停失败') }
        }
      })
    },
    async handleResume() {
      if (!this.deviceId) return this._toast('设备ID不存在')
      uni.showModal({
        title: this.texts.resumePrint || '恢复打印', content: '确认恢复打印？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: '恢复中...' })
            await sendResumeCommand(this.deviceId)
            uni.hideLoading()
            this.isPaused = false; this.isPrinting = true
            this._toast('打印已恢复', 'success')
          } catch (e) { uni.hideLoading(); this._toast(this.texts.resumePrintFailed || '恢复失败') }
        }
      })
    },
    async handleCancel() {
      if (!this.deviceId) return this._toast('设备ID不存在')
      uni.showModal({
        title: '取消打印', content: '确认取消打印？此操作不可撤销。',
        success: async (res) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: '正在停止...' })
            await sendStopCommand(this.deviceId)
            uni.hideLoading()
            this.isPrinting = false; this.isPaused = false
            this._toast('已取消打印', 'success')
            setTimeout(() => uni.navigateBack(), 1500)
          } catch (e) { uni.hideLoading(); this._toast('停止失败，请重试') }
        }
      })
    },
    async handleRestart() {
      if (!this.deviceId || !this.workId) return this._toast('缺少必要参数')
      uni.showModal({
        title: this.texts.restartPrint || '重新打印', content: '确认重新开始打印？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            uni.showLoading({ title: '重启中...' })
            await sendRestartCommand(this.deviceId, this.workId)
            uni.hideLoading()
            this.isPaused = false; this.isPrinting = true; this.currentProgress = 0
            this._toast('已重新开始打印', 'success')
          } catch (e) { uni.hideLoading(); this._toast(this.texts.restartPrintFailed || '重启失败') }
        }
      })
    },
    _toast(title, icon = 'none') { uni.showToast({ title, icon }) },
    goToPrintComplete() {
      uni.navigateTo({
        url: `/pages/explore/printComplete/printComplete?modelName=${encodeURIComponent(this.modelName || '测试模型')}&modelImage=${encodeURIComponent(this.modelImage || '/static/images/logo.png')}&printTime=${encodeURIComponent('10分钟')}&material=${encodeURIComponent('0.64g')}&size=${encodeURIComponent('10mm(X)*10mm(Y)*15mm(Z)')}&userAvatar=${encodeURIComponent('/static/images/Default avatar.png')}&userName=${encodeURIComponent('智小白3D')}&userId=${encodeURIComponent('智小白用户9467')}`
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFF9F5;
}
.content-scroll {
  flex: 1;
  height: 0;
  padding-bottom: 40rpx;
}
.bottom-safe { height: 40rpx; }

/* 设备选择器 */
.device-selector-section {
  padding: 24rpx 24rpx 16rpx;
}
.device-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: rgba(255,255,255,0.95);
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
  background: rgba(255,255,255,0.95);
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
  background: rgba(255,255,255,0.6);
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
  background: linear-gradient(transparent, rgba(0,0,0,0.45));
}
.model-name-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3);
}

/* 通用卡片 */
.section-card {
  margin: 0 24rpx 24rpx;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 32rpx;
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
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 48rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #FF5A00, #FF8C00);
  border-radius: 2rpx;
}
.card-header-row .section-title-text {
  margin-bottom: 0;
  padding-bottom: 0;
}
.card-header-row .section-title-text::after { display: none; }

/* 状态徽章 */
.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}
.badge-printing { background: rgba(42,127,255,0.1); }
.badge-paused   { background: rgba(246,166,35,0.1); }
.badge-idle     { background: rgba(82,196,26,0.1); }
.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}
.dot-printing { background: #2a7fff; }
.dot-paused   { background: #f6a623; }
.dot-idle     { background: #52c41a; }
.status-badge-text {
  font-size: 24rpx;
  font-weight: 600;
}
.badge-printing .status-badge-text { color: #2a7fff; }
.badge-paused   .status-badge-text { color: #f6a623; }
.badge-idle     .status-badge-text { color: #52c41a; }

/* 设备行 */
.device-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid rgba(0,0,0,0.05);
}
.device-row:last-child { border-bottom: none; }
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
  background: #FFF8E6;
  border: 4rpx solid #f6a623;
}
.temp-circle.target {
  background: #FFF0F0;
  border: 4rpx solid #FF5A00;
}
.temp-num {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}
.temp-circle.current .temp-num { color: #f6a623; }
.temp-circle.target  .temp-num { color: #FF5A00; }
.temp-unit { font-size: 20rpx; }
.temp-circle.current .temp-unit { color: #f6a623; }
.temp-circle.target  .temp-unit { color: #FF5A00; }
.temp-label { font-size: 24rpx; color: #888; }
.temp-arrow-wrap { display: flex; align-items: center; }
.temp-arrow { font-size: 32rpx; color: #ccc; }

/* 进度 */
.progress-pct {
  font-size: 34rpx;
  font-weight: 800;
  color: #FF5A00;
}
.progress-bar-bg {
  width: 100%;
  height: 14rpx;
  background: #F0EDE8;
  border-radius: 7rpx;
  overflow: hidden;
  margin-bottom: 4rpx;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5A00, #FF8C00);
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
.ctrl-btn:active { opacity: 0.75; }
.ctrl-text { font-size: 28rpx; font-weight: 700; }
.pause-btn  { background: #FFF9F5; border-color: #FF8C00; }
.pause-btn  .ctrl-text { color: #FF8C00; }
.resume-btn { background: #F0FFF4; border-color: #52c41a; }
.resume-btn .ctrl-text { color: #52c41a; }
.restart-btn { background: #FFF9F5; border-color: #FF5A00; }
.restart-btn .ctrl-text { color: #FF5A00; }
.stop-btn   { background: #FFF5F5; border-color: #ff4d4f; }
.stop-btn   .ctrl-text { color: #ff4d4f; }

/* 临时测试按钮 */
.test-btn {
  margin: 32rpx 24rpx;
  height: 80rpx;
  background: #2a7fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.test-btn:active { opacity: 0.8; }
.test-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
</style>
