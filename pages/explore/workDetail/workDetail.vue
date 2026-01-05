<template>
  <view class="page-container">
    <!-- 工作详情导航栏组件 -->
    <WorkDetailNavbar
      :work-id="workId"
      @back-click="handleBack"
    />

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 模型展示组件 -->
      <ModelDisplay
        :model-name="modelName"
        :model-image="modelImage"
        :scale="modelScale"
      />

      <!-- 剩余时间组件 -->
      <PrintProgress
        :model-name="modelName"
        :estimated-time="estimatedTime"
        :progress="currentProgress"
        @pause-click="handlePause"
        @cancel-click="handleCancel"
      />

      <!-- 打印机组件 -->
      <PrinterStatus
        :printer-name="printerName"
        :printer-status="printerStatus"
        :printer-image="printerImage"
      />

      <!-- 喷头组件 -->
      <NozzleStatus
        :current-temp="currentTemp"
        :target-temp="targetTemp"
      />

      <!-- 返回首页按钮 -->
      <ReturnHomeButton
        @return-home="handleReturnHome"
      />
    </scroll-view>
  </view>
</template>

<script>
import WorkDetailNavbar from './components/WorkDetailNavbar.vue'
import ModelDisplay from './components/ModelDisplay.vue'
import PrintProgress from './components/PrintProgress.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import NozzleStatus from './components/NozzleStatus.vue'
import ReturnHomeButton from './components/ReturnHomeButton.vue'

export default {
  components: {
    WorkDetailNavbar,
    ModelDisplay,
    PrintProgress,
    PrinterStatus,
    NozzleStatus,
    ReturnHomeButton
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
      targetTemp: 200
    }
  },
  onLoad(options) {
    this.workId = options.workId || ''
    this.modelName = options.modelName || ''
    this.modelImage = options.modelImage || ''
    this.modelScale = parseInt(options.scale) || 100
    
    // 使用示例数据
    this.useMockData()
    
    // 开始模拟打印进度
    this.startPrintSimulation()
  },
  methods: {
    useMockData() {
      // 使用示例数据
      this.modelName = '机械臂底座'
      this.modelImage = '/static/img/logo.png'
      this.modelScale = 100
      this.estimatedTime = 120 // 预计剩余120分钟
      this.currentProgress = 0
      this.printerName = 'Ender-3 V2'
      this.printerStatus = '忙碌'
      this.printerImage = '/static/img/logo.png'
      this.currentTemp = 185
      this.targetTemp = 200
    },

    startPrintSimulation() {
      const interval = setInterval(() => {
        if (this.currentProgress >= 100) {
          clearInterval(interval)
          this.printerStatus = '空闲'
          this.currentProgress = 100
          this.estimatedTime = 0
          uni.showToast({
            title: '打印完成',
            icon: 'success'
          })
          return
        }
        
        this.currentProgress += 1
        this.estimatedTime = Math.max(0, this.estimatedTime - 1)
        this.currentTemp = Math.min(this.targetTemp, this.currentTemp + 1)
      }, 3000) // 每3秒更新一次
    },

    handleBack() {
      uni.navigateBack()
    },

    handlePause() {
      uni.showModal({
        title: '暂停打印',
        content: '确认暂停打印？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已暂停打印',
              icon: 'none'
            })
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
  background: #f5f5f5;
}

.content-scroll {
  flex: 1;
  height: 0;
}
</style>