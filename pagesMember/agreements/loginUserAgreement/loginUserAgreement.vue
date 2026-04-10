<template>
  <view class="agreement-page">
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="content">
      <view class="agreement-section">
        <text class="section-title">{{ texts.section1Title }}</text>
        <text class="section-content">{{ texts.section1Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section2Title }}</text>
        <text class="section-content">{{ texts.section2Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section3Title }}</text>
        <text class="section-content">{{ texts.section3Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section4Title }}</text>
        <text class="section-content">{{ texts.section4Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section5Title }}</text>
        <text class="section-content">{{ texts.section5Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section6Title }}</text>
        <text class="section-content">{{ texts.section6Content }}</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">{{ texts.section7Title }}</text>
        <text class="section-content">{{ texts.section7Content }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'LoginUserAgreement',
  components: {
    CustomNavbar
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.loginUserAgreement
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background: #fff9f5;
}

.content {
  padding: 30rpx;
}

.agreement-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.section-content {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}
</style>
