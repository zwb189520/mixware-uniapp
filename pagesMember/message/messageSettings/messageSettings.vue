<template>
  <view class="message-settings-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="content">
      <view class="section-title">{{ texts.systemNotification }}</view>
      <view class="setting-box" @click="goToSystemSettings">
        <view class="setting-content">
          <text class="setting-label">{{ texts.pushNotification }}</text>
          <text class="setting-desc">{{ texts.bannerNotification }}</text>
        </view>
        <uni-icons type="right" size="24" color="#999"></uni-icons>
      </view>

      <view class="section-title">{{ texts.appMessages }}</view>
      <view class="setting-box">
        <view class="setting-content">
          <text class="setting-label">{{ texts.messageReminder }}</text>
          <text class="setting-desc">{{ texts.reminderDesc }}</text>
        </view>
        <switch :checked="messageReminder" @change="handleMessageReminderChange" color="#FF5A00" />
      </view>

      <view class="section-title">{{ texts.printStatus }}</view>
      <view class="setting-box">
        <text class="setting-label">{{ texts.printSuccess }}</text>
        <switch :checked="printSuccess" @change="handlePrintSuccessChange" color="#FF5A00" />
      </view>
      <view class="setting-box">
        <text class="setting-label">{{ texts.printFailure }}</text>
        <switch :checked="printFailure" @change="handlePrintFailureChange" color="#FF5A00" />
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'

export default {
  name: 'MessageSettings',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      messageReminder: true,
      printSuccess: true,
      printFailure: true
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.messageSettings || {}
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    goToSystemSettings() {
      uni.showToast({
        title: this.texts.goToSystemSettings,
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
  background: #FFF9F5;
}

.safe-area-top {
  background: #fff;
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
