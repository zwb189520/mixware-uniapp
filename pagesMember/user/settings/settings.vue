<template>
  <view class="settings-page">
    <safe-area />
    <custom-navbar :title="languageStore.texts.settings.title" @back="handleBack" />
    <settings-menu @language-change="handleLanguageChange" />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SettingsMenu from './components/settingsMenu.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'

export default {
  name: 'Settings',
  components: {
    CustomNavbar,
    SettingsMenu,
    SafeArea
  },
  data() {
    return {}
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleLanguageChange(lang) {
      this.languageStore.setLanguage(lang)
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.safe-area-top {
  background: #fff;
}
</style>
