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
import { useLanguageStore } from '@/stores'

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
    },
    status: {
      type: String,
      default: 'idle'
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    progressStatusText() {
      const texts = this.languageStore?.texts?.printerIntro || {}
      
      if (this.status === 'offline') {
        return texts.offline || '失联了'
      }
      
      if (this.status === 'error') {
        return texts.error || '生病了'
      }
      
      if (this.status === 'hungry') {
        return texts.hungry || '饿了'
      }
      
      if (this.progress >= 100) {
        return texts.completed || '已完成'
      }
      
      if (this.status === 'printing') {
        return texts.printing || '工作中'
      }
      
      return texts.idle || '睡觉'
    }
  }
}
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx 0;
  width: 100%;
}

.progress-status {
  font-size: 30rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 28rpx;
}

.filament-container {
  width: 620rpx;
  height: 16rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.filament-line {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 8rpx;
  position: relative;
  transition: width 0.5s ease;
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
    transparent 12rpx,
    rgba(255, 255, 255, 0.25) 12rpx,
    rgba(255, 255, 255, 0.25) 24rpx
  );
  animation: wave 1.2s linear infinite;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(24rpx);
  }
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  margin-top: 28rpx;
}

.progress-text {
  font-size: 42rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-time {
  font-size: 30rpx;
  color: #999;
  font-weight: 500;
}
</style>
