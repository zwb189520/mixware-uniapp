<template>
  <view class="size-control">
    <view class="control-header">
      <text class="control-title">大小调节</text>
      <text class="control-value">{{ scale }}%</text>
    </view>
    
    <view class="slider-container">
      <slider
        class="size-slider"
        :value="scale"
        min="50"
        max="200"
        step="10"
        backgroundColor="#e0e0e0"
        activeColor="#667eea"
        block-size="40"
        @change="handleScaleChange"
      />
      
      <view class="scale-labels">
        <text class="scale-label">50%</text>
        <text class="scale-label">100%</text>
        <text class="scale-label">200%</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SizeControl',
  props: {
    scale: {
      type: Number,
      default: 100
    }
  },
  methods: {
    handleScaleChange(e) {
      this.$emit('scale-change', e.detail.value)
    }
  }
}
</script>

<style scoped>
.size-control {
  margin-bottom: 48rpx;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.control-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.control-value {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 600;
}

.slider-container {
  position: relative;
}

.size-slider {
  width: 100%;
  margin: 0;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
}

.scale-label {
  font-size: 24rpx;
  color: #999;
}
</style>