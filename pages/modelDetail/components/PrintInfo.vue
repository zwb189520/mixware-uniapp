<template>
  <view class="print-info-container">
    <view class="print-section">
      <text class="section-title">3D模型打印信息</text>
      <view class="print-list">
        <view 
          v-for="(model, index) in printModels" 
          :key="index" 
          class="print-item"
          @click="handleModelClick(model)"
        >
          <image 
            class="print-image" 
            :src="model.image" 
            mode="aspectFit"
            @error="handleImageError"
          />
          <view class="print-details">
            <text class="print-name">{{ model.name }}</text>
            <text class="print-size">尺寸：{{ model.size }}</text>
            <text class="print-time">打印耗时：{{ model.printTime }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrintInfo',
  props: {
    printModels: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleImageClick(model, index) {
      const images = this.printModels.map(item => item.image)
      uni.previewImage({
        urls: images,
        current: index
      })
    },

    handleModelClick(model) {
          uni.navigateTo({
            url: `/pages/printer/3Dpreviewdetail/preview3DDetail?id=${model.id}&name=${encodeURIComponent(model.name)}&url=${encodeURIComponent(model.image)}`
          })
        },

    handleImageError(e) {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.print-info-container {
  background: #fff;
  margin-top: 20rpx;
  padding: 32rpx;
}

.print-section {
  width: 100%;
}

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 32rpx;
  display: block;
}

.print-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.print-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: background-color 0.2s;
}

.print-item:active {
  background: #e9ecef;
}

.print-image {
  width: 120rpx;
  height: 120rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.print-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.print-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.print-size,
.print-time {
  font-size: 26rpx;
  color: #666;
}
</style>