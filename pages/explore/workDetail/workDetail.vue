<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.workDetail" @back="handleBack" />
    <scroll-view scroll-y class="content-scroll">
      <ModelDisplay
        :model-name="modelName"
        :model-image="modelImage"
        :scale="modelScale"
      />
      
      <!-- 如果未在打印，显示切片按钮 -->
      <view v-if="!isPrinting" class="pre-print-actions">
        <button class="slice-btn" @click="showSliceModal = true">
          <text class="btn-icon">⚙️</text>
          <text>{{ texts.sliceSettings }}</text>
        </button>
      </view>

      <PrintProgress
        v-if="isPrinting || isPaused"
        :model-name="modelName"
        :estimated-time="estimatedTime"
        :progress="currentProgress"
        :is-paused="isPaused"
        :is-printing="isPrinting"
        @pause-click="handlePause"
        @cancel-click="handleCancel"
        @resume-click="handleResume"
        @restart-click="handleRestart"
      />
      <PrinterStatus
        :printer-name="printerName"
        :printer-status="printerStatus"
        :printer-image="printerImage"
      />
      <NozzleStatus
        :current-temp="currentTemp"
        :target-temp="targetTemp"
      />
      <view 
        class="return-home-button"
        @click="handleReturnHome"
      >
        <text class="return-home-text">{{ texts.returnHome }}</text>
      </view>
    </scroll-view>

    <!-- 切片设置弹窗 -->
    <SliceSettingsModal
      :visible="showSliceModal"
      :model-url="modelUrl"
      @cancel="showSliceModal = false"
      @success="handleSliceSuccess"
    />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import ModelDisplay from './components/ModelDisplay.vue'
import PrintProgress from './components/PrintProgress.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import NozzleStatus from './components/NozzleStatus.vue'
import SliceSettingsModal from './components/SliceSettingsModal.vue'
import { useLanguageStore } from '@/stores'
import { sendPauseCommand, sendResumeCommand, sendRestartCommand, sendStopCommand, getDeviceStatus } from '@/api/iot.js'

export default {
  components: {
    CustomNavbar,
    ModelDisplay,
    PrintProgress,
    PrinterStatus,
    NozzleStatus
  },
  data() {
    return {
      workId: '',
      modelName: '',
      modelImage: '',
      modelUrl: '', // 模型原始文件地址
      modelScale: 100,
      estimatedTime: 0,
      currentProgress: 0,
      printerName: '',
      printerStatus: '忙碌',
      printerImage: '',
      currentTemp: 0,
      targetTemp: 200,
      deviceId: '',
      isPaused: false,
      isPrinting: false, // 默认改为 false，等待切片或指令启动
      showSliceModal: false,
      statusTimer: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    }
  },
  onLoad(options) {
    this.workId = options.workId || ''
    this.modelName = options.modelName ? decodeURIComponent(options.modelName) : ''
    this.modelImage = options.modelImage ? decodeURIComponent(options.modelImage) : ''
    this.modelUrl = options.modelUrl ? decodeURIComponent(options.modelUrl) : 'http://app.mixwarebot.cn/static/models/demo.stl' // 默认演示模型
    this.modelScale = parseInt(options.scale) || 100
    this.deviceId = options.deviceId || ''
    
    this.languageStore.loadLanguage()
    this.useMockData()
    
    // 如果有设备ID，开始轮询设备状态
    if (this.deviceId) {
      this.startStatusPolling()
    }
    
    // 如果没有打印任务，不自动启动模拟
    if (this.workId || options.autoStart === 'true') {
      this.isPrinting = true
      this.startPrintSimulation()
    }
  },
  onUnload() {
    // 清理定时器
    if (this.printInterval) {
      clearInterval(this.printInterval)
    }
    if (this.statusTimer) {
      clearInterval(this.statusTimer)
    }
  },
  methods: {
    useMockData() {
      this.modelName = '机械臂底座'
      this.modelImage = '/static/images/logo.png'
      this.modelScale = 100
      this.estimatedTime = 120
      this.currentProgress = 0
      this.printerName = 'Ender-3 V2'
      this.printerStatus = this.texts.busy
      this.printerImage = '/static/images/logo.png'
      this.currentTemp = 185
      this.targetTemp = 200
    },

    startPrintSimulation() {
      this.printInterval = setInterval(() => {
        // 如果暂停或完成，不继续增加进度
        if (this.isPaused || this.currentProgress >= 100) {
          if (this.currentProgress >= 100) {
            clearInterval(this.printInterval)
            this.printerStatus = this.texts.idle
            this.currentProgress = 100
            this.estimatedTime = 0
            this.isPrinting = false
            uni.showToast({
              title: '打印完成',
              icon: 'success'
            })
          }
          return
        }
        
        this.currentProgress += 1
        this.estimatedTime = Math.max(0, this.estimatedTime - 1)
        this.currentTemp = Math.min(this.targetTemp, this.currentTemp + 1)
      }, 3000)
    },

    handleBack() {
      uni.navigateBack()
    },

    async handlePause() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不存在',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: this.texts.pausePrint,
        content: '确认暂停打印？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: this.texts.pausingPrint
              })
              
              await sendPauseCommand(this.deviceId)
              
              uni.hideLoading()
              this.isPaused = true
              this.isPrinting = false
              
              uni.showToast({
                title: '打印已暂停',
                icon: 'success'
              })
            } catch (error) {
              uni.hideLoading()
              console.error('暂停打印失败:', error)
              uni.showToast({
                title: this.texts.pausePrintFailed,
                icon: 'none'
              })
            }
          }
        }
      })
    },

    async handleCancel() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不存在',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '取消打印',
        content: '确认取消打印？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '正在停止打印'
              })
              
              await sendStopCommand(this.deviceId)
              
              uni.hideLoading()
              
              uni.showToast({
                title: '已取消打印',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            } catch (error) {
              uni.hideLoading()
              console.error('停止打印失败:', error)
              uni.showToast({
                title: '停止打印失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    async handleResume() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不存在',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: this.texts.resumePrint,
        content: '确认恢复打印？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: this.texts.resumingPrint
              })
              
              await sendResumeCommand(this.deviceId)
              
              uni.hideLoading()
              this.isPaused = false
              this.isPrinting = true
              
              uni.showToast({
                title: '打印已恢复',
                icon: 'success'
              })
            } catch (error) {
              uni.hideLoading()
              console.error('恢复打印失败:', error)
              uni.showToast({
                title: this.texts.resumePrintFailed,
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    async handleRestart() {
      if (!this.deviceId || !this.workId) {
        uni.showToast({
          title: '缺少必要参数',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: this.texts.restartPrint,
        content: '确认重新开始打印？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: this.texts.restartingPrint
              })
              
              await sendRestartCommand(this.deviceId, this.workId)
              
              uni.hideLoading()
              this.isPaused = false
              this.isPrinting = true
              this.currentProgress = 0
              
              uni.showToast({
                title: '已开始重新打印',
                icon: 'success'
              })
            } catch (error) {
              uni.hideLoading()
              console.error('重新开始打印失败:', error)
              uni.showToast({
                title: this.texts.restartPrintFailed,
                icon: 'none'
              })
            }
          }
        }
      })
    },

    async handleSliceSuccess(gcodeUrl) {
      this.showSliceModal = false
      uni.showToast({
        title: this.texts.sliceSuccess,
        icon: 'success'
      })
      
      // 模拟切片成功后开始打印
      setTimeout(() => {
        uni.showModal({
          title: this.texts.readyToPrint,
          content: '切片已完成，是否立即发送给打印机？',
          success: (res) => {
            if (res.confirm) {
              this.isPrinting = true
              this.currentProgress = 0
              this.estimatedTime = 120 // 假设120分钟
              this.startPrintSimulation()
            }
          }
        })
      }, 500)
    },

    handleReturnHome() {
      uni.switchTab({
        url: '/pages/explore/explore/explore'
      })
    },

    startStatusPolling() {
      // 立即获取一次状态
      this.fetchDeviceStatus()
      // 每5秒轮询一次
      this.statusTimer = setInterval(() => {
        this.fetchDeviceStatus()
      }, 5000)
    },

    async fetchDeviceStatus() {
      if (!this.deviceId) return
      try {
        const res = await getDeviceStatus(this.deviceId)
        if (res.code === 1 && res.data) {
          const data = res.data
          // 更新设备状态
          this.printerStatus = data.printState || data.deviceState || this.printerStatus
          // 根据打印状态更新UI
          if (data.printState === 'Printing') {
            this.isPrinting = true
            this.isPaused = false
          } else if (data.printState === 'Pausing' || data.printState === 'Paused') {
            this.isPrinting = false
            this.isPaused = true
          } else if (data.printState === 'StandingBy' || data.printState === 'Idle') {
            this.isPrinting = false
            this.isPaused = false
          }
        }
      } catch (error) {
        console.error('获取设备状态失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FFF9F5;
}

.content-scroll {
  flex: 1;
  height: 0;
}

.pre-print-actions {
  padding: 30rpx;
  display: flex;
  justify-content: center;
}

.slice-btn {
  width: 80%;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 53, 0.3);
  border: none;
}

.slice-btn:active {
  transform: scale(0.96);
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.2);
}

.btn-icon {
  font-size: 36rpx;
}

.return-home-button {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  width: calc(100% - 32rpx);
  height: 80rpx;
  background: #1296db;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.return-home-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.return-home-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
</style>