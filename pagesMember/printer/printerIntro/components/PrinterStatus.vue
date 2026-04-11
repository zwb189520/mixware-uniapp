<template>
  <view class="status-container">
    <view class="status-icon">
      <view :class="['status-dot', `status-${statusClass}`]"></view>
    </view>
    <text class="status-text">{{ statusText }}</text>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'PrinterStatus',
  props: {
    status: {
      type: String,
      default: 'StandingBy'
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    statusText(): string {
      const texts = this.languageStore?.texts?.printerIntro?.printStatus || {}
      return texts[this.status] || this.status
    },
    statusClass(): string {
      const statusMap: Record<string, string> = {
        Printing: 'printing',
        Downloading: 'printing',
        Initializing: 'printing',
        Error: 'error',
        offline: 'offline',
        Pausing: 'idle',
        Aborting: 'idle',
        StandingBy: 'idle',
        Loading: 'idle',
        Unloading: 'idle',
        online: 'idle'
      }
      return statusMap[this.status] || 'idle'
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
  background: #ff6b35;
  color: #ff6b35;
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
  0%,
  100% {
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
