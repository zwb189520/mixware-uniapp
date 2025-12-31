<template>
  <view class="tool-button" @click="$emit('click')" :style="{ background: gradient }">
    <view class="button-icon">{{ icon }}</view>
    <text class="button-text">{{ text }}</text>
    <text class="button-desc">{{ description }}</text>
  </view>
</template>

<script>
export default {
  name: 'ToolButton',
  props: {
    text: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    gradient: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.tool-button {
  border-radius: 24rpx;
  padding: 50rpx 30rpx;
  text-align: center;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.tool-button:active {
  transform: scale(0.95);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}
.button-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}
.button-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 10rpx;
}
.button-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}
</style>