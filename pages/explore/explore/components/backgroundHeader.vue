<template>
  <view class="header">
    <image class="bg-img" :src="backgroundImage" mode="aspectFill"/>
    <view class="banner">
      <image class="logo" :src="logoImage" mode="aspectFit"/>
      <text class="welcome">{{ welcomeText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BackgroundHeader',
  props: {
    backgroundImage: {
      type: String,
      default: '/static/images/explore-bg.png'
    },
    logoImage: {
      type: String,
      default: '/static/images/logo.png'
    },
    welcomeText: {
      type: String,
      default: '欢迎来到Mixwar'
    }
  }
}
</script>

<style scoped>
.header {
  position: relative;
  height: 300rpx;
  overflow: hidden;
}
.bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
}
.banner {
  position: absolute;
  left: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
}
.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}
.welcome {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,.3);
}
</style>