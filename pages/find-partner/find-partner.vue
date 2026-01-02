<template>
  <view class="find-partner-page">
    <find-partner-navbar />
    <power-on-tip />
    <bluetooth-search />
  </view>
</template>

<script>
import FindPartnerNavbar from './components/find-partner-navbar.vue'
import PowerOnTip from './components/power-on-tip.vue'
import BluetoothSearch from './components/bluetooth-search.vue'

export default {
  name: 'FindPartner',
  components: {
    FindPartnerNavbar,
    PowerOnTip,
    BluetoothSearch
  }
}
</script>

<style scoped>
.find-partner-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
