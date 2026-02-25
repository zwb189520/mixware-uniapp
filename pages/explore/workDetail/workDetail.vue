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
      <PrintProgress
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
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import ModelDisplay from './components/ModelDisplay.vue'
import PrintProgress from './components/PrintProgress.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import NozzleStatus from './components/NozzleStatus.vue'
import { useLanguageStore } from '@/stores'
import { sendPauseCommand, sendResumeCommand, sendRestartCommand } from '@/api/iot.js'

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
      isPrinting: true
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
    this.modelName = options.modelName || ''
    this.modelImage = options.modelImage || ''
    this.modelScale = parseInt(options.scale) || 100
    this.deviceId = options.deviceId || ''
    
    this.languageStore.loadLanguage()
    this.useMockData()
    this.startPrintSimulation()
  },
  onUnload() {
    // 清理定时器
    if (this.printInterval) {
      clearInterval(this.printInterval)
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

    handleCancel() {
      uni.showModal({
        title: '取消打印',
        content: '确认取消打印？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已取消打印',
              icon: 'none'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
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

    handleReturnHome() {
      uni.switchTab({
        url: '/pages/explore/explore/explore'
      })
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