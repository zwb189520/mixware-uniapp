<template>
  <view class="profile-page">
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    <view class="header-right">
      <view class="icon-btn" @click="handleSettings">
        <uni-icons type="gear" size="22" color="#333"></uni-icons>
      </view>
      <view class="icon-btn" @click="handleNotification">
        <uni-icons type="notification" size="22" color="#333"></uni-icons>
      </view>
    </view>
    <view class="profile-content">
      <profile-user-info />
      <profile-stats />
      <!-- <profile-medals /> -->
      <showcase-button />
      <printer-partner ref="printerPartner" />
    </view>
  </view>
</template>

<script>
import ProfileUserInfo from './components/ProfileUserInfo.vue'
import ProfileStats from './components/ProfileStats.vue'
import ProfileMedals from './components/ProfileMedals.vue'
import ShowcaseButton from './components/ShowcaseButton.vue'
import PrinterPartner from './components/PrinterPartner.vue'
import { useLanguageStore, useUserStore } from '@/stores'

export default {
  name: 'Profile',
  components: {
    ProfileUserInfo,
    ProfileStats,
    ProfileMedals,
    ShowcaseButton,
    PrinterPartner
  },
  data() {
    return {
      statusBarHeight: 0
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  onShow() {
    // 页面显示时更新TabBar语言
    const languageStore = useLanguageStore()
    languageStore.updateTabBar()

    this.$nextTick(() => {
      const comp = this.$refs.printerPartner
      if (comp) {
        comp.checkPrinterStatus()
      }
    })
  },
  methods: {
    handleSettings() {
      uni.navigateTo({
        url: '/pagesMember/user/settings/settings'
      })
    },
    handleNotification() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: '/pagesMember/message/message/message'
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.safe-area-top {
  width: 100%;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.profile-content {
  margin-top: -40rpx;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.icon-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 1);
}
</style>
