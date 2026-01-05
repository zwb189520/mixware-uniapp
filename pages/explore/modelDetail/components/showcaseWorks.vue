<template>
  <view class="showcase-container">
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
</template>

<script>
export default {
  name: 'ShowcaseWorks',
  props: {
    showcaseWorks: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleWorkClick(image, index) {
          uni.navigateTo({
            url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?workId=${index}`
          })
        },

    handleImageError(e) {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.showcase-container {
  background: #fff;
  margin-top: 20rpx;
  padding: 32rpx;
}

.showcase-section {
  width: 100%;
}

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 32rpx;
  display: block;
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