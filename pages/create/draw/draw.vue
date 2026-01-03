<template>
  <view class="page-container">
    <view class="navbar">
      <view class="navbar-left" @click="handleBackClick">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>画一画</text>
      </view>
      <view class="navbar-right"></view>
    </view>
    <view class="empty-page">
      <text>功能开发中</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    handleBackClick() {
      uni.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
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
  font-weight: bold;
  color: #333;
}

.navbar-right {
  width: 60rpx;
}

.empty-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-page text {
  font-size: 32rpx;
  color: #999;
}
</style>
