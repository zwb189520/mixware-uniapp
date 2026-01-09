<template>
  <view class="navbar-container">
    <safe-area></safe-area>
    <view class="navbar">
      <view class="navbar-left" @click="handleBackClick">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">打印机</text>
      </view>
      <view class="navbar-right" @click="handleMoreClick">
        <uni-icons type="more-filled" size="24"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'PrinterIntroNavbar',
  components: {
    SafeArea
  },
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleBackClick() {
      uni.navigateBack()
    },
    handleMoreClick() {
        uni.navigateTo({
          url: `/pages/profile/printer/printerMoreIntro/printerMoreIntro?deviceId=${this.deviceId}`
        })
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
