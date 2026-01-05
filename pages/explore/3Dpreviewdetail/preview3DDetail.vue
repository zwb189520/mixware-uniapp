<template>
  <view class="preview-page">
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>3D预览</text>
      </view>
      <view class="navbar-right"></view>
    </view>

    <view class="content">
      <view class="model-preview">
        <image class="model-image" :src="modelUrl" mode="aspectFit"></image>
      </view>

      <view class="model-info">
        <text class="model-name">{{ modelName }}</text>
        <text class="model-id">模型ID: {{ modelId }}</text>
      </view>

      <view class="print-settings">
        <view class="setting-item">
          <text class="setting-label">打印材料</text>
          <text class="setting-value">PLA</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">打印质量</text>
          <text class="setting-value">标准</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">填充率</text>
          <text class="setting-value">20%</text>
        </view>
      </view>
    </view>

    <view class="bottom-button">
      <button class="print-button" @click="handlePrint">开始打印</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      modelId: '',
      modelName: '',
      modelUrl: ''
    }
  },
  onLoad(options) {
    this.modelId = options.id || ''
    this.modelName = options.name || '3D模型'
    this.modelUrl = options.url || '/static/images/explore-bg.png'
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handlePrint() {
      uni.navigateTo({
        url: '/pages/explore/workDetail/workDetail'
      })
    }
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.navbar-left,
.navbar-right {
  width: 60rpx;
}

.navbar-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.model-preview {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
}

.model-image {
  width: 100%;
  height: 400rpx;
}

.model-info {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.model-name {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.model-id {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.print-settings {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.setting-value {
  font-size: 28rpx;
  color: #666;
}

.bottom-button {
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}

.print-button {
  width: 100%;
  height: 88rpx;
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.print-button:active {
  opacity: 0.8;
}
</style>
