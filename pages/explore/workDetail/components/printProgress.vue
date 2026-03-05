<template>
  <view class="print-progress-container">
    <view class="print-progress-section">
      <text class="section-title">{{ texts.progress }}</text>
      
      <!-- 模型名称 -->
      <view class="model-name-section">
        <text class="model-name">{{ modelName }}</text>
      </view>

      <!-- 预计剩余时间 -->
      <view class="time-section">
        <text class="time-label">{{ texts.estimatedTime }}</text>
        <text class="time-value">{{ estimatedTime }} 分钟</text>
      </view>

      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{ width: progress + '%' }"
          ></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <!-- 打印中状态 -->
        <view v-if="isPrinting && !isPaused" class="action-buttons">
          <view 
            class="action-button pause-button"
            @click="handlePauseClick"
          >
            <text class="action-button-icon">⏸️</text>
            <text class="action-button-text">{{ texts.pause }}</text>
          </view>
          <view 
            class="action-button cancel-button"
            @click="handleCancelClick"
          >
            <text class="action-button-icon">❌</text>
            <text class="action-button-text">{{ texts.cancel }}</text>
          </view>
        </view>
        
        <!-- 暂停状态 -->
        <view v-if="isPaused" class="action-buttons">
          <view 
            class="action-button resume-button"
            @click="handleResumeClick"
          >
            <text class="action-button-icon">▶️</text>
            <text class="action-button-text">{{ texts.resumePrint }}</text>
          </view>
          <view 
            class="action-button restart-button"
            @click="handleRestartClick"
          >
            <text class="action-button-icon">🔄</text>
            <text class="action-button-text">{{ texts.restartPrint }}</text>
          </view>
          <view 
            class="action-button cancel-button"
            @click="handleCancelClick"
          >
            <text class="action-button-icon">❌</text>
            <text class="action-button-text">{{ texts.cancel }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  name: 'PrintProgress',
  props: {
    modelName: {
      type: String,
      default: ''
    },
    estimatedTime: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    isPrinting: {
      type: Boolean,
      default: true
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
  mounted() {
    this.languageStore.loadLanguage()
    console.log('PrintProgress mounted:', {
      modelName: this.modelName,
      estimatedTime: this.estimatedTime,
      progress: this.progress,
      isPrinting: this.isPrinting,
      isPaused: this.isPaused
    })
  },
  methods: {
    handlePauseClick() {
      this.$emit('pause-click')
    },

    handleCancelClick() {
      this.$emit('cancel-click')
    },

    handleResumeClick() {
      this.$emit('resume-click')
    },

    handleRestartClick() {
      this.$emit('restart-click')
    }
  }
}
</script>

<style scoped>
.print-progress-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.print-progress-section {
  width: 100%;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.model-name-section {
  margin-bottom: 16rpx;
}

.model-name {
  font-size: 28rpx;
  color: #2a7fff;
  font-weight: 600;
}

.time-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.time-label {
  font-size: 24rpx;
  color: #666;
}

.time-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.progress-section {
  margin-bottom: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 10rpx;
  background: #e0e0e0;
  border-radius: 5rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a7fff, #4a9fff);
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 12rpx;
}

.action-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  transition: background-color 0.2s;
}

.pause-button {
  background: #FFF9F5;
  border: 2rpx solid #e9ecef;
}

.pause-button:active {
  background: #e9ecef;
}

.cancel-button {
  background: #FFF9F5;
  border: 2rpx solid #FF5A00;
}

.cancel-button:active {
  background: #FF5A00;
}

.action-button-icon {
  font-size: 28rpx;
}

.action-button-text {
  font-size: 22rpx;
  font-weight: 500;
}

.pause-button .action-button-text {
  color: #666;
}

.cancel-button .action-button-text {
  color: #FF5A00;
}

.resume-button {
  background: #FFF9F5;
  border: 2rpx solid #7ED321;
}

.resume-button:active {
  background: #7ED321;
}

.restart-button {
  background: #FFF9F5;
  border: 2rpx solid #FFD600;
}

.restart-button:active {
  background: #FFD600;
}

.resume-button .action-button-text {
  color: #7ED321;
}

.restart-button .action-button-text {
  color: #FFD600;
}
</style>