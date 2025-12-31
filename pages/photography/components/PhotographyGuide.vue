<template>
  <view class="guide-container">
    <view class="guide-header">
      <text class="guide-title">拍照引导</text>
    </view>
    
    <view class="guide-content">
      <view class="guide-step">
        <text class="step-number">1</text>
        <text class="step-text">将物品放置在平整的表面上</text>
      </view>
      
      <view class="guide-step">
        <text class="step-number">2</text>
        <text class="step-text">确保光线充足，避免阴影</text>
      </view>
      
      <view class="guide-step">
        <text class="step-number">3</text>
        <text class="step-text">按照提示拍摄多个角度</text>
      </view>
      
      <view class="guide-step">
        <text class="step-number">4</text>
        <text class="step-text">最少拍摄3个角度才能生成3D模型</text>
      </view>
    </view>
    
    <view class="guide-example">
      <text class="example-title">示例：</text>
      <view class="example-image">
        <text class="example-placeholder">📷</text>
      </view>
      <text class="example-desc">拍摄角度示意</text>
    </view>
    
    <view class="guide-button" @click="$emit('next')">
      <text class="button-text">开始拍照</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PhotographyGuide'
}
</script>

<style scoped>
.guide-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 60rpx 40rpx;
}
.guide-header {
  text-align: center;
  margin-bottom: 60rpx;
}
.guide-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}
.guide-content {
  margin-bottom: 80rpx;
}
.guide-step {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}
.step-number {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 30rpx;
  flex-shrink: 0;
}
.step-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.5;
}
.guide-example {
  text-align: center;
  margin-bottom: 80rpx;
}
.example-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 30rpx;
}
.example-image {
  width: 300rpx;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}
.example-placeholder {
  font-size: 80rpx;
  opacity: 0.5;
}
.example-desc {
  font-size: 24rpx;
  color: #666;
}
.guide-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  padding: 30rpx;
  text-align: center;
  margin-top: auto;
}
.button-text {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}
</style>