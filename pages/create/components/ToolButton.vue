<template>
  <view class="tool-button" @click="$emit('click')" :style="{ height: cardHeight + 'rpx', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
    <view class="button-overlay"></view>
    <view class="button-content">
      <uni-icons :type="icon" size="40" color="#333"></uni-icons>
      <text class="button-text">{{ text }}</text>
      <text class="button-desc">{{ description }}</text>
    </view>
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
    backgroundImage: {
      type: String,
      required: true
    },
    cardHeight: {
      type: Number,
      default: 250
    }
  }
}
</script>

<style scoped>
.tool-button {
  position: relative;
  border-radius: 24rpx;
  padding: 50rpx 30rpx;
  text-align: center;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}
.tool-button:active {
  transform: scale(0.95);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}
.button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}
.button-content {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  z-index: 2;
  text-align: left;
}
.button-content uni-icons {
  margin-bottom: 12rpx;
  display: block;
}
.button-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.button-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
}
</style>