<template>
  <view class="settings-navbar">
    <view class="navbar-left">
      <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
    </view>
    <view class="navbar-title">
      <text>设置</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SettingsNavbar',
  methods: {
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.settings-navbar {
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
