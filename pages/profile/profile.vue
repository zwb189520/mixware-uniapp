<template>
  <view class="profile-page">
    <profile-header />
    <profile-user-info />
    <profile-medals />
    <showcase-button />
    <printer-partner />
  </view>
</template>

<script>
import ProfileHeader from './components/profile-header.vue'
import ProfileUserInfo from './components/profile-user-info.vue'
import ProfileMedals from './components/profile-medals.vue'
import ShowcaseButton from './components/showcase-button.vue'
import PrinterPartner from './components/printer-partner.vue'

export default {
  name: 'Profile',
  components: {
    ProfileHeader,
    ProfileUserInfo,
    ProfileMedals,
    ShowcaseButton,
    PrinterPartner
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
