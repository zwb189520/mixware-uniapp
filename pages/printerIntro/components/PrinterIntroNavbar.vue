<template>
  <view class="printer-intro-navbar">
    <view class="navbar-left">
      <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
    </view>
    <view class="navbar-title">
      <text>打印机</text>
    </view>
    <view class="navbar-right">
      <uni-icons type="more-filled" size="24" @click="handleMoreClick"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterIntroNavbar',
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleMoreClick() {
      this.$emit('more-click')
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

.navbar-right {
  width: 60rpx;
  display: flex;
  justify-content: flex-end;
}
</style>
