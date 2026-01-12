<template>
  <view class="settings-page">
    <safe-area />
    <custom-navbar title="设置" />
    <settings-menu />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SettingsMenu from '../components/settingsMenu.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'Settings',
  components: {
    CustomNavbar,
    SettingsMenu,
    SafeArea
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}
</style>
