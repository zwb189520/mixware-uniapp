<template>
  <view class="device-success-page">
    <safe-area></safe-area>
    <!-- navbar -->
    <view class="navbar">
      <view class="navbar-left">
        <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>添加设备</text>
      </view>
    </view>
    
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 动态GIF动画 -->
      <view class="gif-section">
        <image 
          class="gift-gif" 
          src="https://wimg.588ku.com/gif320/24/07/09/3a365c98db3a4d75a1f7365687bf7d56.gif" 
          mode="aspectFit"
        ></image>
      </view>
      
      <!-- 成功标题 -->
      <view class="success-title-section">
        <text class="success-title">设备绑定成功</text>
      </view>
      
      <!-- 副标题 -->
      <view class="subtitle-section">
        <text class="subtitle">开启3D打印初体验！</text>
      </view>
      
      <!-- 回到首页按钮 -->
      <view class="button-section">
        <button class="home-button" @click="handleGoHome">回到首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'DeviceSuccess',
  components: {
    SafeArea
  },
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
    handleGoHome() {
      // 回到首页（探索页面）
      uni.switchTab({
        url: '/pages/explore/explore/explore'
      })
    }
  }
}
</script>

<style scoped>
.device-success-page {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 88rpx);
  padding-top: 200rpx;
}

.gif-section {
  margin-bottom: 60rpx;
}

.gift-gif {
  width: 500rpx;
  height: 500rpx;
}

.success-title-section {
  margin-bottom: 20rpx;
}

.success-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.subtitle-section {
  margin-bottom: 80rpx;
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: #666;
  text-align: center;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.home-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}
</style>