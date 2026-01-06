<template>
  <view class="preview-page">
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>{{ modelName }}</text>
      </view>
      <view class="navbar-right"></view>
    </view>

    <view class="content">
      <view class="model-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <canvas canvas-id="modelCanvas" class="model-canvas"></canvas>
        <image 
          v-if="!isCanvasReady" 
          class="model-image" 
          :src="modelUrl" 
          mode="aspectFit"
          :style="{
            transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          }"
        ></image>
      </view>

      <view class="zoom-control">
        <text class="zoom-label">缩放</text>
        <slider 
          class="zoom-slider" 
          :value="scale * 100" 
          min="50" 
          max="200" 
          @change="handleZoomChange"
          activeColor="#007aff"
          backgroundColor="#e0e0e0"
        ></slider>
        <text class="zoom-value">{{ Math.round(scale * 100) }}%</text>
      </view>
    </view>

    <view class="bottom-button">
      <button class="print-button" @click="handlePrint">开始打印</button>
    </view>
  </view>
</template>

<script>
import { sendPrintCommand } from '@/api/iot.js'

export default {
  data() {
    return {
      modelId: '',
      modelName: '',
      modelUrl: '',
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      lastTouchX: 0,
      lastTouchY: 0,
      isCanvasReady: false
    }
  },
  onLoad(options) {
    this.modelId = options.id || ''
    this.modelName = options.name || '3D模型'
    this.modelUrl = decodeURIComponent(options.url || '/static/images/explore-bg.png')
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleTouchStart(e) {
      this.lastTouchX = e.touches[0].clientX
      this.lastTouchY = e.touches[0].clientY
    },
    handleTouchMove(e) {
      const deltaX = e.touches[0].clientX - this.lastTouchX
      const deltaY = e.touches[0].clientY - this.lastTouchY
      
      this.rotateY += deltaX * 0.5
      this.rotateX -= deltaY * 0.5
      
      this.lastTouchX = e.touches[0].clientX
      this.lastTouchY = e.touches[0].clientY
    },
    handleTouchEnd() {
    },
    handleZoomChange(e) {
      this.scale = e.detail.value / 100
    },
    async handlePrint() {
      try {
        uni.showLoading({
          title: '发送打印命令...'
        })
        
        const deviceId = uni.getStorageSync('deviceId') || 'default-device'
        const res = await sendPrintCommand(deviceId, this.modelId, 'start')
        
        uni.hideLoading()
        uni.showToast({
          title: '打印命令已发送',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/explore/workDetail/workDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelUrl)}&scale=${Math.round(this.scale * 100)}`
          })
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '发送打印命令失败',
          icon: 'none'
        })
      }
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
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}

.model-container {
  flex: 1;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.model-canvas {
  width: 100%;
  height: 100%;
}

.model-image {
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease-out;
}

.zoom-control {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.zoom-label {
  font-size: 28rpx;
  color: #333;
  width: 80rpx;
}

.zoom-slider {
  flex: 1;
}

.zoom-value {
  font-size: 28rpx;
  color: #666;
  width: 100rpx;
  text-align: right;
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
