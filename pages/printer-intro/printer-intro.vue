<template>
  <view class="printer-intro-page">
    <printer-intro-navbar @more-click="handleMoreClick" />
    <printer-info />
    <realtime-progress />
    <PrinterMenu 
      :visible="showMenu" 
      @close="handleMenuClose"
      @device-info="handleDeviceInfo"
      @calibration="handleCalibration"
      @reconfigure-network="handleReconfigureNetwork"
      @unbind="handleUnbind"
    />
  </view>
</template>

<script>
import PrinterIntroNavbar from './components/printer-intro-navbar.vue'
import PrinterInfo from './components/printer-info.vue'
import RealtimeProgress from './components/realtime-progress.vue'
import PrinterMenu from './components/PrinterMenu.vue'

export default {
  name: 'PrinterIntro',
  components: {
    PrinterIntroNavbar,
    PrinterInfo,
    RealtimeProgress,
    PrinterMenu
  },
  data() {
    return {
      showMenu: false
    }
  },
  methods: {
    handleMoreClick() {
      this.showMenu = true
    },
    handleMenuClose() {
      this.showMenu = false
    },
    handleDeviceInfo() {
      uni.showToast({
        title: '打印机设备信息',
        icon: 'none'
      })
    },
    handleCalibration() {
      uni.showToast({
        title: '校准功能',
        icon: 'none'
      })
    },
    handleReconfigureNetwork() {
      uni.showToast({
        title: '重新配网',
        icon: 'none'
      })
    },
    handleUnbind() {
      uni.showToast({
        title: '解除绑定',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
