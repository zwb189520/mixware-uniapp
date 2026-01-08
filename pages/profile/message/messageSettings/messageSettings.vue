<template>
  <view class="message-settings-page">
    <safe-area />
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">消息设置</text>
      </view>
      <view class="navbar-right"></view>
    </view>

    <view class="content">
      <view class="section-title">系统通知</view>
      <view class="setting-box" @click="goToSystemSettings">
        <view class="setting-content">
          <text class="setting-label">推送通知</text>
          <text class="setting-desc">系统中的横幅通知</text>
        </view>
        <uni-icons type="right" size="24" color="#999"></uni-icons>
      </view>

      <view class="section-title">应用内消息</view>
      <view class="setting-box">
        <view class="setting-content">
          <text class="setting-label">消息提醒</text>
          <text class="setting-desc">关闭后，将不再进行红点提示</text>
        </view>
        <switch :checked="messageReminder" @change="handleMessageReminderChange" color="#007aff" />
      </view>

      <view class="section-title">打印状态</view>
      <view class="setting-box">
        <text class="setting-label">打印成功</text>
        <switch :checked="printSuccess" @change="handlePrintSuccessChange" color="#007aff" />
      </view>
      <view class="setting-box">
        <text class="setting-label">打印失败</text>
        <switch :checked="printFailure" @change="handlePrintFailureChange" color="#007aff" />
      </view>
    </view>
  </view>
</template>

<script>
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'MessageSettings',
  components: {
    SafeArea
  },
  data() {
    return {
      messageReminder: true,
      printSuccess: true,
      printFailure: true
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    goToSystemSettings() {
      uni.showToast({
        title: '请前往系统设置',
        icon: 'none'
      })
    },
    handleMessageReminderChange(e) {
      this.messageReminder = e.detail.value
    },
    handlePrintSuccessChange(e) {
      this.printSuccess = e.detail.value
    },
    handlePrintFailureChange(e) {
      this.printFailure = e.detail.value
    }
  }
}
</script>

<style scoped>
.message-settings-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #fff;
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

.content {
  padding: 20rpx 30rpx;
}

.section-title {
  font-size: 24rpx;
  color: #999;
  margin: 30rpx 0 10rpx 0;
}

.setting-box {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.setting-content {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 400;
} 

.setting-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
