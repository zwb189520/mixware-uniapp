<template>
  <view class="nozzle-status-container">
    <view class="nozzle-status-section">
      <text class="section-title">喷头温度</text>
      
      <view class="temperature-info">
        <view class="temp-display">
          <text class="temp-label">当前温度</text>
          <text class="temp-value current-temp">{{ currentTemp }}°C</text>
        </view>
        <view class="temp-arrow">→</view>
        <view class="temp-display">
          <text class="temp-label">目标温度</text>
          <text class="temp-value target-temp">{{ targetTemp }}°C</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NozzleStatus',
  props: {
    currentTemp: {
      type: Number,
      default: 0
    },
    targetTemp: {
      type: Number,
      default: 200
    }
  },
  computed: {
    isReached() {
      return this.currentTemp >= this.targetTemp
    }
  }
}
</script>

<style scoped>
.nozzle-status-container {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.nozzle-status-section {
  width: 100%;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.temperature-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.temp-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.temp-label {
  font-size: 24rpx;
  color: #666;
}

.temp-value {
  font-size: 32rpx;
  font-weight: 700;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  min-width: 100rpx;
  text-align: center;
}

.current-temp {
  color: #d69e2e;
  background: #fefcbf;
  border: 2rpx solid #f6e05e;
}

.target-temp {
  color: #e53e3e;
  background: #fed7d7;
  border: 2rpx solid #feb2b2;
}

.temp-arrow {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}
</style>