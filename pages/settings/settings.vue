<template>
  <view class="settings-page">
    <settings-navbar />
    <settings-menu />
  </view>
</template>

<script>
import SettingsNavbar from './components/settings-navbar.vue'
import SettingsMenu from './components/settings-menu.vue'

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
