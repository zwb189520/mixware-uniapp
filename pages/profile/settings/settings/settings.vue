<template>
  <view class="settings-page">
    <safe-area />
    <settings-navbar />
    <settings-menu />
  </view>
</template>

<script>
import SettingsNavbar from '../components/settingsNavbar.vue'
import SettingsMenu from '../components/settingsMenu.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'Settings',
  components: {
    SettingsNavbar,
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
