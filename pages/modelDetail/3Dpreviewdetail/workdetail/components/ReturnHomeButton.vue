<template>
  <view class="return-home-container">
    <view 
      class="return-home-button"
      @click="handleReturnHome"
    >
      <text class="return-home-icon">🏠</text>
      <text class="return-home-text">返回首页</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ReturnHomeButton',
  methods: {
    handleReturnHome() {
      this.$emit('return-home')
    }
  }
}
</script>

<style scoped>
.return-home-container {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.return-home-button {
  width: 100%;
  height: 80rpx;
  background: #1296db;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.return-home-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.return-home-icon {
  font-size: 28rpx;
}

.return-home-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
</style>