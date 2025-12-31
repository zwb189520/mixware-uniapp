<template>
  <view class="model-display-container">
    <view class="model-display">
      <image 
        class="model-image" 
        :src="modelImage" 
        mode="aspectFit"
        @error="handleImageError"
      />
      <view class="model-info">
        <text class="model-name">{{ modelName }}</text>
        <text class="model-scale">缩放比例: {{ scale }}%</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModelDisplay',
  props: {
    modelName: {
      type: String,
      default: ''
    },
    modelImage: {
      type: String,
      default: ''
    },
    scale: {
      type: Number,
      default: 100
    }
  },
  methods: {
    handleImageError(e) {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.model-display-container {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.model-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.model-image {
  width: 200rpx;
  height: 200rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
}

.model-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.model-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.model-scale {
  font-size: 24rpx;
  color: #666;
}
</style>