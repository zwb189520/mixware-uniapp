<template>
  <view class="model-info-container">
    <!-- 轮播图区域 -->
    <view class="carousel-section">
      <swiper 
        class="carousel" 
        :indicator-dots="true"
        :autoplay="false"
        :circular="true"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#1296db"
        @change="handleCarouselChange"
      >
        <swiper-item v-for="(image, index) in modelInfo.images" :key="index">
          <image 
            class="carousel-image" 
            :src="image" 
            mode="aspectFit"
            @click="handleImageClick(index)"
            @error="handleImageError"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 模型基本信息区域 -->
    <view class="basic-info-section">
      <view class="model-header">
        <text class="model-name">{{ modelInfo.name }}</text>
        <view class="model-stats">
          <view class="stat-item" @click="handleLike">
            <text class="stat-icon">{{ modelInfo.isLiked ? '❤️' : '🤍' }}</text>
            <text class="stat-text">{{ modelInfo.likes }}</text>
          </view>
          <view class="stat-item" @click="handleCollect">
            <text class="stat-icon">{{ modelInfo.isCollected ? '⭐' : '☆' }}</text>
            <text class="stat-text">{{ modelInfo.collections }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-icon">📥</text>
            <text class="stat-text">{{ modelInfo.downloads }}</text>
          </view>
        </view>
      </view>

      <!-- 模型描述 -->
      <view class="model-description">
        <text class="description-text">{{ modelInfo.description }}</text>
      </view>

      <!-- 模型详情信息 -->
      <view class="model-details">
        <view class="detail-item">
          <text class="detail-label">类目：</text>
          <text class="detail-value">{{ modelInfo.category }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">版权：</text>
          <text class="detail-value">{{ modelInfo.copyright }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModelInfo',
  props: {
    modelInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentCarouselIndex: 0
    }
  },
  methods: {
    handleCarouselChange(e) {
      this.currentCarouselIndex = e.detail.current
    },

    handleImageClick(index) {
      // 预览图片
      uni.previewImage({
        urls: this.modelInfo.images,
        current: index
      })
    },

    handleImageError(e) {
      console.log('图片加载失败:', e)
    },

    handleLike() {
      this.$emit('like-click')
    },

    handleCollect() {
      this.$emit('collect-click')
    },

    handleDownload() {
      this.$emit('download-click')
    },

    handleShare() {
      this.$emit('share-click')
    }
  }
}
</script>

<style scoped>
.model-info-container {
  background: #fff;
  min-height: 100%;
}

/* 轮播图区域 */
.carousel-section {
  width: 100%;
  height: 500rpx;
  background: #f8f8f8;
  position: relative;
}

.carousel {
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

/* 基本信息区域 */
.basic-info-section {
  padding: 32rpx;
}

.model-header {
  margin-bottom: 32rpx;
}

.model-name {
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  display: block;
  margin-bottom: 24rpx;
}

.model-stats {
  display: flex;
  align-items: center;
  gap: 48rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 32rpx;
}

.stat-text {
  font-size: 28rpx;
  color: #666;
}

/* 模型描述 */
.model-description {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.description-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

/* 模型详情信息 */
.model-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  min-width: 140rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}
</style>