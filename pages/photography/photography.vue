<template>
  <view class="page">
    <!-- 安全区域 -->
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    
    <view class="photography-content">
      <!-- 拍照引导 -->
      <view class="guide-section">
        <text class="guide-title">拍照引导</text>
        <view class="guide-steps">
          <view class="step-item">
            <text class="step-number">1</text>
            <text class="step-text">将物品放置在平整的表面上</text>
          </view>
          <view class="step-item">
            <text class="step-number">2</text>
            <text class="step-text">确保光线充足，避免阴影</text>
          </view>
          <view class="step-item">
            <text class="step-number">3</text>
            <text class="step-text">按照提示拍摄多个角度</text>
          </view>
          <view class="step-item">
            <text class="step-number">4</text>
            <text class="step-text">最少拍摄3个角度才能生成3D模型</text>
          </view>
        </view>
      </view>
      
      <!-- 拍照框 -->
      <view class="photo-frame">
        <view class="frame-guide">
          <text class="frame-text">请将物品放在框内</text>
          <text class="angle-text">{{ currentAngleName }}</text>
        </view>
        
        <!-- 拍照预览 -->
        <view class="photo-preview" v-if="currentPhoto">
          <image :src="currentPhoto" class="preview-image" mode="aspectFit" />
        </view>
        
        <!-- 拍照按钮 -->
        <view class="capture-button" @click="takePhoto">
          <view class="button-inner">
            <uni-icons type="camera-filled" size="30"></uni-icons>
          </view>
        </view>
      </view>
      
      <!-- 角度选择器 -->
      <view class="angle-selector">
        <view class="selector-title">
          <text class="title-text">选择拍摄角度</text>
          <text class="progress-text">{{ capturedCount }}/{{ angleOptions.length }}</text>
        </view>
        
        <scroll-view scroll-x class="angle-list" :show-scrollbar="false">
          <view class="angle-items">
            <view 
              v-for="angle in angleOptions" 
              :key="angle.key"
              class="angle-item"
              :class="{ 
                active: currentAngle === angle.key,
                captured: capturedPhotos[angle.key]
              }"
              @click="changeAngle(angle.key)"
            >
              <text class="angle-name">{{ angle.name }}</text>
              <view v-if="capturedPhotos[angle.key]" class="capture-status">
                <text class="status-icon">✓</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      
    </view>
    
    <!-- 固定的生产按钮 -->
    <view class="fixed-production-container">
      <view 
        class="production-button"
        :class="{ disabled: !canProduce, active: canProduce }"
        @click="canProduce && startProduction()"
      >
        <text class="button-text">{{ buttonText }}</text>
        <text class="button-progress" v-if="!canProduce">{{ minPhotos }}张起</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      currentAngle: 'front',
      capturedPhotos: {}, // 已拍摄的照片 { front: photoPath, back: photoPath, ... }
      angleOptions: [
        { key: 'front', name: '正面' },
        { key: 'back', name: '背面' },
        { key: 'left', name: '左面' },
        { key: 'right', name: '右面' },
        { key: 'top', name: '顶面' },
        { key: 'bottom', name: '底面' }
      ]
    }
  },
  computed: {
    canProduce() {
      return Object.keys(this.capturedPhotos).length >= 3 // 至少需要3个角度
    },
    currentAngleName() {
      const angleNames = {
        front: '正面',
        back: '背面',
        left: '左面',
        right: '右面',
        top: '顶面',
        bottom: '底面'
      }
      return angleNames[this.currentAngle] || '正面'
    },
    currentPhoto() {
      return this.capturedPhotos[this.currentAngle]
    },
    capturedCount() {
      return Object.keys(this.capturedPhotos).length
    },
    buttonText() {
      return this.canProduce ? '生成3D模型' : '请先拍摄照片'
    },
    minPhotos() {
      return 3
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    changeAngle(angle) {
      this.currentAngle = angle
    },
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          const photoPath = res.tempFilePaths[0]
          this.capturedPhotos[this.currentAngle] = photoPath
          uni.showToast({
            title: `${this.angleOptions.find(a => a.key === this.currentAngle)?.name}拍摄完成`,
            icon: 'success'
          })
        },
        fail: (err) => {
          uni.showToast({
            title: '拍照失败',
            icon: 'none'
          })
        }
      })
    },
    startProduction() {
      uni.showLoading({ title: '生成中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.navigateTo({
          url: '/pages/modelDetail/3Dpreviewdetail/3Dpreviewdetail'
        })
      }, 2000)
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #ffffff;
}
.safe-area-top {
  width: 100%;
}
.photography-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--status-bar-height));
  padding: 20rpx;
  padding-bottom: 120rpx; /* 为底部固定按钮留出空间 */
}

/* 拍照引导样式 */
.guide-section {
  margin-bottom: 60rpx;
}
.guide-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 40rpx;
  text-align: center;
}
.guide-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.step-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 300rpx;
}
.step-number {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 15rpx;
  flex-shrink: 0;
}
.step-text {
  font-size: 24rpx;
  color: #333;
}

/* 拍照框样式 */
.photo-frame {
  position: relative;
  height: 400rpx;
  background: #f8f8f8;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
}
.frame-guide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.frame-text {
  color: white;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  display: block;
}
.angle-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  display: block;
}
.photo-preview {
  width: 100%;
  height: 100%;
}
.preview-image {
  width: 100%;
  height: 100%;
}
.capture-button {
  position: absolute;
  bottom: 50rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}
.button-inner {
  width: 100rpx;
  height: 100rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}
.button-icon {
  font-size: 50rpx;
}

/* 角度选择器样式 */
.angle-selector {
  margin-bottom: 40rpx;
}
.selector-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}
.title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.progress-text {
  font-size: 24rpx;
  color: #666;
}
.angle-list {
  white-space: nowrap;
}
.angle-items {
  display: inline-flex;
  gap: 15rpx;
}
.angle-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 15rpx;
  background: #f5f5f5;
  border-radius: 15rpx;
  min-width: 100rpx;
  position: relative;
  transition: all 0.3s ease;
}
.angle-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.05);
}
.angle-item.captured {
  background: #e8f5e8;
}
.angle-item.captured.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.angle-item.active .angle-name {
  color: white;
}
.angle-name {
  font-size: 20rpx;
  color: #666;
}
.capture-status {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 30rpx;
  height: 30rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-icon {
  color: white;
  font-size: 18rpx;
  font-weight: bold;
}

/* 固定的生产按钮容器 */
.fixed-production-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.production-button {
  background: #e0e0e0;
  border-radius: 50rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.production-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
}
.production-button.active:active {
  transform: scale(0.98);
  box-shadow: 0 5rpx 20rpx rgba(102, 126, 234, 0.2);
}
.button-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #999;
}
.production-button.active .button-text {
  color: white;
}
.button-progress {
  font-size: 20rpx;
  color: #999;
  margin-left: 15rpx;
}
.production-button.active .button-progress {
  color: rgba(255, 255, 255, 0.8);
}
</style>