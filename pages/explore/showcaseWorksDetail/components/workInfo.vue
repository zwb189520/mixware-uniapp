<template>
  <view class="work-info-container">
    <view class="work-info">
      <!-- 3D模型拍摄图 -->
      <view class="model-image-section">
        <image 
          class="model-image" 
          :src="modelImage" 
          mode="aspectFill"
          lazy-load
          @click="handleImageClick"
          @error="handleImageError"
        />
      </view>
      
      <!-- 文字说明 -->
      <view class="description-section">
        <text class="work-description">{{ description }}</text>
        
        <!-- 作品信息 -->
        <view class="work-meta">
          <view class="meta-item">
            <text class="meta-label">打印时间:</text>
            <text class="meta-value">{{ workInfo.printTime }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">材料:</text>
            <text class="meta-value">{{ workInfo.material }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">尺寸:</text>
            <text class="meta-value">{{ workInfo.size }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WorkInfo',
  props: {
    modelImage: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    workInfo: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleImageClick() {
      uni.previewImage({
        urls: [this.modelImage]
      })
    },

    handleImageError(e) {
      console.log('模型图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.work-info-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.work-info {
  width: 100%;
}

.model-image-section {
  margin-bottom: 20rpx;
}

.model-image {
  width: 100%;
  height: 400rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
}

.description-section {
  width: 100%;
}

.work-description {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: block;
}

.work-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-label {
  font-size: 24rpx;
  color: #666;
  min-width: 80rpx;
}

.meta-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}
</style>