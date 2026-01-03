<template>
  <view class="status-container">
    <view class="status-icon">
      <view :class="['status-dot', `status-${status}`]"></view>
    </view>
    <text class="status-text">{{ statusText }}</text>
  </view>
</template>

<script>
export default {
  name: 'PrinterStatus',
  props: {
    status: {
      type: String,
      default: 'idle',
      validator: (value) => ['idle', 'printing', 'completed', 'error'].includes(value)
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        idle: '睡觉',
        printing: '工作中',
        completed: '饿了',
        error: '生病了'
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
  padding: 10rpx 0;
}

.status-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.status-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-idle {
  background: #95a5a6;
}

.status-printing {
  background: #3498db;
}

.status-completed {
  background: #2ecc71;
}

.status-error {
  background: #e74c3c;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #666;
}
</style>
