<template>
  <view class="navbar-container">
    <view class="navbar">
      <view class="navbar-left" @click="handleBackClick">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">打印机信息</text>
      </view>
      <view class="navbar-right"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterMoreIntroNavbar',
  methods: {
    handleBackClick() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.navbar-container {
  background: #fff;
  z-index: 100;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.navbar-left,
.navbar-right {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
</style>
