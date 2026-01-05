<template>
  <view class="printer-print-page">
    <!-- 同款navbar -->
    <view class="navbar">
      <view class="navbar-left">
        <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>打印机打印</text>
      </view>
    </view>
    
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 操作提示 -->
      <view class="instruction-section">
        <text class="instruction-title">请按照提示操作</text>
        <text class="instruction-text">开机状态下，长按电源键7秒，直到指示灯橙灯闪烁即可</text>
      </view>
      
      <!-- 演示图 -->
      <view class="demo-image-section">
        <image class="demo-image" src="/static/images/printer/printer-demo.png" mode="aspectFit"></image>
      </view>
    </view>
    
    <!-- 我已准备好的按钮 -->
    <view class="button-section">
      <button class="ready-button" @click="handleReady">我已准备好</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterPrint',
  data() {
    return {
      printerId: null
    }
  },
  onLoad(options) {
    this.printerId = options.printerId || 1
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleReady() {
      uni.navigateTo({
        url: `/pages/profile/printer/addDevice/addDevice?printerId=${this.printerId}`
      })
    }
  }
}
</script>

<style scoped>
.printer-print-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.navbar-left {
  width: 60rpx;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #333;
}

.page-content {
  padding: 40rpx;
}

.instruction-section {
  margin-bottom: 60rpx;
}

.instruction-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.instruction-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
}

.demo-image-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.demo-image {
  width: 400rpx;
  height: 300rpx;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.ready-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}
</style>