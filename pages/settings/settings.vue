<template>
  <view class="settings-page">
    <settings-navbar />
    <settings-menu />
  </view>
</template>

<script>
import SettingsNavbar from './components/settingsNavbar.vue'
import SettingsMenu from './components/settingsMenu.vue'

export default {
  name: 'Settings',
  components: {
    SettingsNavbar,
    SettingsMenu
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
