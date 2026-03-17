<template>
  <view class="my-print-configs-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <scroll-view scroll-y class="content-scroll">
      <view class="empty-state" v-if="!configsList.length">
        <uni-icons type="gear" size="80" color="#ddd"></uni-icons>
        <text class="empty-text">{{ texts.noConfigs }}</text>
      </view>
      <view class="configs-list" v-else>
        <view 
          v-for="item in configsList" 
          :key="item.id" 
          class="config-item"
          @click="handleItemClick(item)"
        >
          <view class="config-info">
            <text class="config-title">{{ item.name }}</text>
            <text class="config-detail">{{ item.detail }}</text>
            <text class="config-time">{{ item.time }}</text>
          </view>
          <uni-icons type="right" size="20" color="#999"></uni-icons>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'

interface Config {
  id: string | number
  name: string
  detail: string
  time: string
}

const languageStore = useLanguageStore()
const configsList = ref<Config[]>([])

const texts = computed(() => languageStore?.texts?.myPrintConfigs || {})

onMounted(() => {
  languageStore.loadLanguage()
  loadConfigs()
})

const handleBack = () => {
  uni.navigateBack()
}

const loadConfigs = () => {
  const configs = uni.getStorageSync('configsList') || []
  configsList.value = configs
}

const handleItemClick = (item: Config) => {
  uni.showToast({
    title: texts.value.viewDetail,
    icon: 'none'
  })
}
</script>

<style scoped>
.my-print-configs-page {
  min-height: 100vh;
  background: #FFF9F5;
}

.content-scroll {
  height: calc(100vh - 88rpx);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.configs-list {
  padding: 20rpx;
}

.config-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.config-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.config-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
}

.config-detail {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.config-time {
  font-size: 22rpx;
  color: #999;
}
</style>
