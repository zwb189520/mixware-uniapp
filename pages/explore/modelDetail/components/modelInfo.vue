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
          <view class="stat-item" :class="{ 'liked': modelInfo.isLiked }" @click="handleLike">
            <uni-icons :type="modelInfo.isLiked ? 'heart-filled' : 'heart'" size="24"></uni-icons>
            <text class="stat-text">{{ modelInfo.likes }}</text>
          </view>
          <view class="stat-item" :class="{ 'liked': modelInfo.isCollected }" @click="handleCollect">
            <uni-icons :type="modelInfo.isCollected ? 'star-filled' : 'star'" size="24"></uni-icons>
            <text class="stat-text">{{ modelInfo.collections }}</text>
          </view>
        </view>
          <view class="author-info" @click="handleAuthorClick">
          <image class="author-avatar" :src="modelInfo.authorAvatar" mode="aspectFill" @error="handleImageError"/>
          <text class="author-name">{{ modelInfo.author }}</text>
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

      <!-- 3D模型打印信息 -->
      <view class="print-section">
        <text class="section-title">3D模型打印信息</text>
        <view class="print-list">
          <view 
            v-for="(model, index) in printModels" 
            :key="index" 
            class="print-item"
            @click="handlePrintModelClick(model)"
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

      <!-- 作品展示 -->
      <view class="showcase-section">
        <text class="section-title">作品展示</text>
        <view class="showcase-grid">
          <view 
            v-for="(work, index) in showcaseWorks" 
            :key="index" 
            class="showcase-item"
            @click="handleWorkClick(work.image, index)"
          >
            <image 
              class="showcase-image" 
              :src="work.image" 
              mode="aspectFill"
              @error="handleImageError"
            />
            <view class="showcase-overlay">
              <text class="showcase-info">{{ work.info }}</text>
            </view>
          </view>
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
    },
    printModels: {
      type: Array,
      default: () => []
    },
    showcaseWorks: {
      type: Array,
      default: () => []
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
    },

    handlePrintModelClick(model) {
      uni.navigateTo({
        url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${model.id}&name=${encodeURIComponent(model.name)}&url=${encodeURIComponent(model.modelFile || model.image)}`
      })
    },

    handleWorkClick(image, index) {
      uni.navigateTo({
        url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?workId=${index}`
      })
    },

    handleAuthorClick() {
      uni.showToast({
        title: '查看作者主页',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.model-info-container {
  background: #fff;
}

.carousel-section {
  width: 100%;
  height: 400rpx;
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

.author-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.author-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e0e0e0;
}

.author-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-item.liked {
  color: #ff2d55;
}

.stat-item.liked .uni-icons,
.stat-item.liked .uni-icons .uni-icons {
  color: #ff2d55 !important;
}

.stat-text {
  font-size: 28rpx;
  color: #666;
}

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

.model-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 32rpx;
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

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.print-section {
  margin-bottom: 32rpx;
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

.showcase-section {
  margin-bottom: 32rpx;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.showcase-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f0f0f0;
}

.showcase-image {
  width: 100%;
  height: 100%;
}

.showcase-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 20rpx 16rpx 16rpx;
}

.showcase-info {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}
</style>