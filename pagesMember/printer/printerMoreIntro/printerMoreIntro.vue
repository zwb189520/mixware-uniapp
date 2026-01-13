<template>
  <view class="printer-more-intro-page">
    <safe-area />
    <custom-navbar title="打印机详情" @back="handleBack" />
    <view class="content-container">
      <printer-info-section :device-id="deviceId" @device-info-loaded="handleDeviceInfoLoaded" />
      <firmware-settings :device-info="deviceInfo" />
      <calibration-section />
      <action-buttons :device-id="deviceId" />
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import PrinterInfoSection from './components/PrinterInfoSection.vue'
import FirmwareSettings from './components/FirmwareSettings.vue'
import CalibrationSection from './components/CalibrationSection.vue'
import ActionButtons from './components/ActionButtons.vue'

export default {
  name: 'PrinterMoreIntro',
  components: {
    CustomNavbar,
    PrinterInfoSection,
    FirmwareSettings,
    CalibrationSection,
    ActionButtons
  },
  data() {
    return {
      deviceId: '',
      deviceInfo: null
    }
  },
  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleDeviceInfoLoaded(info) {
      this.deviceInfo = info
    }
  }
}
</script>

<style scoped>
.printer-more-intro-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content-container {
  padding-bottom: 40rpx;
}
</style>
