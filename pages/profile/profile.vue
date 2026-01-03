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
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileUserInfo from './components/ProfileUserInfo.vue'
import ProfileMedals from './components/ProfileMedals.vue'
import ShowcaseButton from './components/ShowcaseButton.vue'
import PrinterPartner from './components/PrinterPartner.vue'

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
