<template>
  <view class="printer-intro-page">
    <printer-intro-navbar />
    <printer-info />
    <realtime-progress />
  </view>
</template>

<script>
import PrinterIntroNavbar from './components/printer-intro-navbar.vue'
import PrinterInfo from './components/printer-info.vue'
import RealtimeProgress from './components/realtime-progress.vue'

export default {
  name: 'PrinterIntro',
  components: {
    PrinterIntroNavbar,
    PrinterInfo,
    RealtimeProgress
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
