<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.slicePreview" @back="handleBack" />
    
    <scroll-view scroll-y class="content-scroll">
      <!-- 模型图片 -->
      <view class="model-image-section">
        <image 
          class="model-image" 
          :src="modelImage" 
          mode="aspectFit"
          @error="handleImageError"
        />
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress.toFixed(1) }}%</text>
      </view>
      
      <!-- 处理步骤和状态 -->
      <view class="status-box">
        <view class="steps-section">
          <view 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 'completed': step.completed, 'active': step.active }"
          >
            <view class="step-icon">
              <text v-if="step.completed" class="check-icon">✓</text>
              <view v-else-if="step.active" class="loading-circle"></view>
              <view v-else class="circle"></view>
            </view>
            <text class="step-text">{{ step.text }}</text>
          </view>
        </view>
        
        <!-- 当前状态 -->
        <view class="current-status">
          <view class="status-icon-wrapper">
            <view v-if="isProcessing" class="loading-circle"></view>
            <text v-else class="check-icon">✓</text>
          </view>
          <text class="status-text">{{ currentStatus }}</text>
        </view>
      </view>
      
      <!-- 提示信息 -->
      <view class="tips-section">
        <text class="tips-text">
          {{ texts.processingTips }}
          <text class="link-text" @click="goToPrintRecords">「{{ texts.myPrintRecords }}」</text>
          {{ texts.view }}
        </text>
      </view>
    </scroll-view>
    
    <!-- 底部按钮区域 -->
    <view class="bottom-section">
      <view class="print-hint">
        <text class="hint-text">{{ texts.autoPrintAfterProcess }}</text>
      </view>
      <view class="cancel-btn" @click="handleCancel">
        <text class="cancel-btn-text">{{ texts.cancelProcessing }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  data() {
    return {
      modelId: '',
      modelName: '',
      modelImage: '',
      progress: 0,
      isProcessing: true,
      steps: [
        { text: '待打印任务已生成', completed: false, active: true },
        { text: '打印时间已分析完成', completed: false, active: false },
        { text: '模型消耗克数已分析完成', completed: false, active: false },
        { text: '模型尺寸已分析完成', completed: false, active: false }
      ],
      currentStatus: '分析完成，请等待模型处理',
      timer: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return {
        slicePreview: '模型打印预览',
        processingTips: '模型处理需要一定时间，可在',
        myPrintRecords: '我的-打印记录',
        view: '查看',
        autoPrintAfterProcess: '处理完成后会直接打印',
        cancelProcessing: '取消处理',
        ...this.languageStore.texts.explore
      }
    }
  },
  onLoad(options) {
    this.modelId = options.modelId || ''
    this.modelName = options.modelName || ''
    this.modelImage = options.modelImage || '/static/images/3Dprinter.png'
    
    // 开始模拟进度
    this.startProgress()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    startProgress() {
      let currentStep = 0
      this.timer = setInterval(() => {
        // 更新进度
        if (this.progress < 100) {
          this.progress += Math.random() * 5
          if (this.progress > 100) this.progress = 100
        }
        
        // 更新步骤状态
        const stepProgress = this.progress / 25
        this.steps.forEach((step, index) => {
          if (stepProgress > index) {
            step.completed = true
            step.active = false
          } else if (stepProgress > index - 0.5 && stepProgress <= index + 1) {
            step.active = true
          }
        })
        
        // 更新当前状态
        if (this.progress >= 100) {
          this.currentStatus = '模型处理完成，准备打印'
          this.isProcessing = false
          clearInterval(this.timer)
          
          // 延迟后跳转到workDetail
          // setTimeout(() => {
          //   uni.redirectTo({
          //     url: `/pages/explore/workDetail/workDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelImage)}`
          //   })
          // }, 1500)
        }
      }, 500)
    },
    handleBack() {
      uni.navigateBack()
    },
    handleImageError() {
      this.modelImage = '/static/images/3Dprinter.png'
    },
    goToPrintRecords() {
      uni.navigateTo({
        url: '/pagesMember/printRecords/printRecords'
      })
    },
    handleCancel() {
      uni.showModal({
        title: '确认取消',
        content: '取消后将停止模型处理，是否确认？',
        success: (res) => {
          if (res.confirm) {
            if (this.timer) {
              clearInterval(this.timer)
            }
            uni.navigateBack()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
}

.model-image-section {
  display: flex;
  justify-content: center;
  margin: 20rpx 30rpx 40rpx 30rpx;
}

.model-image {
  width: 400rpx;
  height: 400rpx;
  border-radius: 20rpx;
  background-color: #fff;
}

.progress-section {
  display: flex;
  align-items: center;
  margin: 0 30rpx 40rpx 30rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background-color: #e0e0e0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a7fff, #4a9fff);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #2a7fff;
  font-weight: 500;
}

.status-box {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 20rpx 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.steps-section {
  margin-bottom: 20rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  width: auto;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.circle {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%;
}

.check-icon {
  color: #2a7fff;
  font-size: 32rpx;
  font-weight: bold;
}

.loading-circle {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid #e0e0e0;
  border-top-color: #2a7fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.step-text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s;
}

.step-item.completed .step-text {
  color: #333;
}

.step-item.active .step-text {
  color: #2a7fff;
  font-weight: 500;
}

.current-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.status-icon-wrapper {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.status-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.tips-section {
  text-align: center;
  padding: 20rpx 0;
}

.tips-text {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
}

.link-text {
  color: #2a7fff;
}

.bottom-section {
  background-color: #fff;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.print-hint {
  text-align: center;
  margin-bottom: 20rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
}

.cancel-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn-text {
  font-size: 28rpx;
  color: #666;
}

.cancel-btn:active {
  background-color: #f5f5f5;
}
</style>