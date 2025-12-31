<template>
  <view class="toolbar-container">
    <view class="toolbar">
      <view class="toolbar-item" @click="handleLike">
        <text class="toolbar-icon">{{ modelInfo.isLiked ? '❤️' : '🤍' }}</text>
        <text class="toolbar-text">点赞 {{ modelInfo.likes }}</text>
      </view>
      <view class="toolbar-item" @click="handleCollect">
        <text class="toolbar-icon">{{ modelInfo.isCollected ? '⭐' : '☆' }}</text>
        <text class="toolbar-text">收藏 {{ modelInfo.collections }}</text>
      </view>
      <view class="toolbar-item primary" @click="handlePrint">
        <text class="toolbar-icon">🖨️</text>
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
      // 跳转到3D模型预览编辑页面
      uni.navigateTo({
        url: '/pages/modelDetail/3Dpreviewdetail/3Dpreviewdetail'
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
</style>