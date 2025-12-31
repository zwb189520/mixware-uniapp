<template>
  <view class="scale-control-container">
    <view class="scale-info">
      <text class="scale-label">缩放</text>
      <text class="scale-value">{{ scale }}%</text>
    </view>
    <view class="scale-slider-container">
      <slider
        class="scale-slider"
        :value="scale"
        min="0"
        max="100"
        step="1"
        @change="handleScaleChange"
        @input="handleScaleInput"
        activeColor="#1296db"
        backgroundColor="#e0e0e0"
        block-size="24"
      />
    </view>
    <view class="scale-range">
      <text class="range-text">0%</text>
      <text class="range-text">100%</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ScaleControl',
  props: {
    scale: {
      type: Number,
      default: 100
    }
  },
  methods: {
    handleScaleChange(e) {
      this.$emit('scale-change', e.detail.value)
    },

    handleScaleInput(e) {
      // 实时更新缩放值
      this.$emit('scale-change', e.detail.value)
    }
  }
}
</script>

<style scoped>
.scale-control-container {
  margin-bottom: 32rpx;
}

.scale-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.scale-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.scale-value {
  font-size: 28rpx;
  color: #1296db;
  font-weight: 600;
}

.scale-slider-container {
  margin: 16rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scale-slider {
  width: 80%;
}

.scale-range {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.range-text {
  font-size: 24rpx;
  color: #999;
}
</style>