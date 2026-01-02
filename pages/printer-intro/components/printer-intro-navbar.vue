<template>
  <view class="printer-intro-navbar">
    <view class="navbar-left">
      <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
    </view>
    <view class="navbar-title">
      <text>打印机</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterIntroNavbar',
  methods: {
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.printer-intro-navbar {
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
</style>
