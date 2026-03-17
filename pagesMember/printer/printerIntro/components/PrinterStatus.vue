<template>
  <view class="status-container">
    <view class="status-icon">
      <view :class="['status-dot', `status-${status}`]"></view>
    </view>
    <text class="status-text">{{ statusText }}</text>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'PrinterStatus',
  props: {
    status: {
      type: String,
      default: 'idle',
      validator: (value) => ['idle', 'printing', 'hungry', 'error', 'offline'].includes(value)
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    statusText() {
      const texts = this.languageStore?.texts?.printerIntro || {}
      const statusMap = {
        idle: texts.idle || '睡觉',
        printing: texts.printing || '工作中',
        hungry: texts.hungry || '饿了',
        error: texts.error || '生病了',
        offline: texts.offline || '失联了'
      }
      return statusMap[this.status]
    }
  }
}
</script>

<style scoped>
.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 48rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50rpx;
  backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.6);
}

.status-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.status-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.status-idle,
.status-offline {
  background: #95a5a6;
  color: #95a5a6;
}

.status-printing {
  background: #FF6B35;
  color: #FF6B35;
}

.status-hungry {
  background: #f1c40f;
  color: #f1c40f;
}

.status-error {
  background: #e74c3c;
  color: #e74c3c;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.status-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 1rpx;
}
</style>


