<template>
  <view class="printer-more-intro-page">
    <view class="header-wrapper">
      <safe-area />
      <custom-navbar :title="texts.title || '打印机设置'" @back="handleBack" />
    </view>
    <view class="content-container">
      <printer-info-section :device-id="deviceId" @device-info-loaded="handleDeviceInfoLoaded" />
      <firmware-settings :device-info="deviceInfo" />
      <maintenance-section :device-info="deviceInfo" />
      <calibration-section />
      <action-buttons :device-id="deviceId" />
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import PrinterInfoSection from './components/PrinterInfoSection.vue'
import FirmwareSettings from './components/FirmwareSettings.vue'
import MaintenanceSection from './components/MaintenanceSection.vue'
import CalibrationSection from './components/CalibrationSection.vue'
import ActionButtons from './components/ActionButtons.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { getDefaultDevice } from '@/api/devices.ts'

export default {
  name: 'PrinterMoreIntro',
  components: {
    CustomNavbar,
    PrinterInfoSection,
    FirmwareSettings,
    MaintenanceSection,
    CalibrationSection,
    ActionButtons
  },
  data() {
    return {
      deviceId: '',
      deviceInfo: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.printerMoreIntro || {}
    }
  },
  async onLoad(options) {
    this.languageStore.loadLanguage()
    if (options.deviceId) {
      this.deviceId = options.deviceId
    } else {
      await this.loadDefaultDevice()
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleDeviceInfoLoaded(info) {
      this.deviceInfo = info
    },
    async loadDefaultDevice() {
      try {
        const res = await getDefaultDevice()
        if (res.data && res.data.deviceId) {
          this.deviceId = res.data.deviceId
        }
      } catch (error) {
        console.error('获取默认设备失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.printer-more-intro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFF 100%);
}

.header-wrapper {
  background: #fff;
}

.content-container {
  padding-bottom: 40rpx;
}
</style>


