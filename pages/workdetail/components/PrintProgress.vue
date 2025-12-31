<template>
  <view class="print-progress-container">
    <view class="print-progress-section">
      <text class="section-title">打印进度</text>
      
      <!-- 模型名称 -->
      <view class="model-name-section">
        <text class="model-name">{{ modelName }}</text>
      </view>

      <!-- 预计剩余时间 -->
      <view class="time-section">
        <text class="time-label">预计剩余</text>
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
        <view 
          class="action-button pause-button"
          @click="handlePauseClick"
        >
          <text class="action-button-icon">⏸️</text>
          <text class="action-button-text">暂停打印</text>
        </view>
        <view 
          class="action-button cancel-button"
          @click="handleCancelClick"
        >
          <text class="action-button-icon">❌</text>
          <text class="action-button-text">取消打印</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
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
    }
  },
  methods: {
    handlePauseClick() {
      this.$emit('pause-click')
    },

    handleCancelClick() {
      this.$emit('cancel-click')
    }
  }
}
</script>

<style scoped>
.print-progress-container {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
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
  font-size: 26rpx;
  color: #1296db;
  font-weight: 500;
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
  background: #1296db;
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
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
}

.pause-button:active {
  background: #e9ecef;
}

.cancel-button {
  background: #fff5f5;
  border: 2rpx solid #fed7d7;
}

.cancel-button:active {
  background: #fed7d7;
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
  color: #e53e3e;
}
</style>