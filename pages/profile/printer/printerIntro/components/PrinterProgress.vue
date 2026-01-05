<template>
  <view class="progress-container">
    <text class="progress-status">{{ progressStatusText }}</text>
    
    <view class="filament-container">
      <view 
        class="filament-line" 
        :style="{ width: progress + '%' }"
      >
        <view class="filament-wave"></view>
      </view>
    </view>
    
    <view class="progress-info">
      <text class="progress-text">{{ progress }}%</text>
      <text class="progress-time">{{ estimatedTime }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterProgress',
  props: {
    progress: {
      type: Number,
      default: 0
    },
    estimatedTime: {
      type: String,
      default: '0分钟'
    }
  },
  computed: {
    progressStatusText() {
      return this.progress >= 100 ? '已完成' : '打印中'
    }
  }
}
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.progress-status {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
  margin-bottom: 20rpx;
}

.filament-container {
  width: 600rpx;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  position: relative;
}

.filament-line {
  height: 100%;
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  border-radius: 6rpx;
  position: relative;
  transition: width 0.3s ease;
}

.filament-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10rpx,
    rgba(255, 255, 255, 0.3) 10rpx,
    rgba(255, 255, 255, 0.3) 20rpx
  );
  animation: wave 1s linear infinite;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(20rpx);
  }
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin-top: 20rpx;
}

.progress-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #3498db;
}

.progress-time {
  font-size: 28rpx;
  color: #999;
}
</style>
