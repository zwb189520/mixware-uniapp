<template>
  <view class="profile-page">
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    <view class="header-right">
      <uni-icons type="gear" size="24" @click="handleSettings"></uni-icons>
      <uni-icons type="notification" size="24" @click="handleNotification"></uni-icons>
    </view>
    <profile-user-info />
    <profile-medals />
    <showcase-button />
    <printer-partner ref="printerPartner" />
  </view>
</template>

<script>
import ProfileUserInfo from './components/ProfileUserInfo.vue'
import ProfileMedals from './components/ProfileMedals.vue'
import ShowcaseButton from './components/ShowcaseButton.vue'
import PrinterPartner from './components/PrinterPartner.vue'

export default {
  name: 'Profile',
  components: {
    ProfileUserInfo,
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
    this.$nextTick(() => {
      const comp = this.$refs.printerPartner
      if (comp) {
        comp.checkPrinterStatus().then(() => {
          console.log('[Profile] 设备列表:', comp.printerList, 'isBound=', comp.isBound)
        })
      }
    })
  },
  methods: {
    handleSettings() {
      uni.navigateTo({
        url: '/pagesMember/settings/settings'
      })
    },
    handleNotification() {
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
  background-color: #f5f5f5;
}
.safe-area-top {
  width: 100%;
}
.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 30rpx;
  gap: 30rpx;
}
</style>
