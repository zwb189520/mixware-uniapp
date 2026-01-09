<template>
  <view class="printer-more-intro-page">
    <printer-more-intro-navbar />
    
    <view class="content-container">
      <printer-info-section :device-id="deviceId" @device-info-loaded="handleDeviceInfoLoaded" />
      
      <firmware-settings :device-info="deviceInfo" />
      
      <calibration-section />
      
      <action-buttons :device-id="deviceId" />
    </view>
  </view>
</template>

<script>
import PrinterMoreIntroNavbar from './components/PrinterMoreIntroNavbar.vue'
import PrinterInfoSection from './components/PrinterInfoSection.vue'
import FirmwareSettings from './components/FirmwareSettings.vue'
import CalibrationSection from './components/CalibrationSection.vue'
import ActionButtons from './components/ActionButtons.vue'

export default {
  name: 'PrinterMoreIntro',
  components: {
    PrinterMoreIntroNavbar,
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
