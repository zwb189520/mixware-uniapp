<template>
  <view class="toolbar-container">
    <view class="toolbar">
      <view class="toolbar-item" :class="{ 'liked': modelInfo.isLiked }" @click="handleLike">
        <uni-icons :type="modelInfo.isLiked ? 'heart-filled' : 'heart'" size="24"></uni-icons>
        <text class="toolbar-text">点赞 {{ modelInfo.likes }}</text>
      </view>
      <view class="toolbar-item" :class="{ 'liked': modelInfo.isCollected }" @click="handleCollect">
        <uni-icons :type="modelInfo.isCollected ? 'star-filled' : 'star'" size="24"></uni-icons>
        <text class="toolbar-text">收藏 {{ modelInfo.collections }}</text>
      </view>
      <view class="toolbar-item primary" @click="handlePrint">
        <text class="toolbar-text">打印</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BottomToolbar',
  props: {
    modelInfo: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleLike() {
      this.$emit('like-click')
    },

    handleCollect() {
      this.$emit('collect-click')
    },

    handlePrint() {
      uni.navigateTo({
        url: '/pages/3Dpreviewdetail/preview3DDetail'
      })
    }
  }
}
</script>

<style scoped>
.toolbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  height: 100rpx;
}

.toolbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  transition: background-color 0.2s;
}

.toolbar-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.toolbar-item.primary {
  background: #1296db;
  color: #fff;
  margin: 0 16rpx;
}

.toolbar-item.primary:active {
  background: #0d7bb8;
}

.toolbar-icon {
  font-size: 32rpx;
}

.toolbar-text {
  font-size: 24rpx;
  font-weight: 500;
}

.toolbar-item:not(.primary) .toolbar-text {
  color: #666;
}

.toolbar-item.primary .toolbar-text {
  color: #fff;
}

/* 已点赞和已收藏状态 */
.toolbar-item.liked {
  color: #ff2d55;
}

.toolbar-item.liked .uni-icons,
.toolbar-item.liked .uni-icons .uni-icons {
  color: #ff2d55 !important;
}
</style>