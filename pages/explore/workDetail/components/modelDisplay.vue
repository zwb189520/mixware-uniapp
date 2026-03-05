<template>
  <view class="model-display-container">
    <view class="model-display">
      <image 
        class="model-image" 
        :src="modelImage" 
        mode="aspectFit"
        lazy-load
        @error="handleImageError"
      />
      <view class="model-info">
        <text class="model-name">{{ modelName }}</text>
        <text class="model-scale">{{ texts.scale }}: {{ scale }}%</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

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
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
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
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
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
  background: #f5f5f5;
  border-radius: 16rpx;
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