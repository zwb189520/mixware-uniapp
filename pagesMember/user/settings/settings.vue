<template>
  <view class="settings-page">
    <safe-area />
    <custom-navbar :title="languageStore.texts.settings.title" @back="handleBack" />
    <settings-menu @language-change="handleLanguageChange" />
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SettingsMenu from './components/settingsMenu.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'

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
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },
    handleLanguageChange(lang: string): void {
      this.languageStore.setLanguage(lang)
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #fff9f5;
}

.safe-area-top {
  background: #fff;
}
</style>
