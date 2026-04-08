<template>
  <view class="my-likes-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <scroll-view scroll-y class="content-scroll">
      <view class="empty-state" v-if="!likesList.length">
        <uni-icons type="hand-up" size="80" color="#ddd"></uni-icons>
        <text class="empty-text">{{ texts.noLikedContent }}</text>
      </view>
      <view class="likes-list" v-else>
        <view 
          v-for="item in likesList" 
          :key="item.id" 
          class="like-item"
          @click="handleItemClick(item)"
        >
          <image :src="item.image" mode="aspectFill" class="item-image"></image>
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-time">{{ item.time }}</text>
          </view>
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

interface LikeItem {
  id: string
  title: string
  image: string
  time: string
  timestamp?: string
}

const languageStore = useLanguageStore()
const likesList = ref<LikeItem[]>([])
const loading = ref(false)

const texts = computed(() => languageStore?.texts?.myLikes || {})

const handleBack = () => {
  uni.navigateBack()
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const textsValue = texts.value
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}${textsValue.daysAgo || '天前'}`
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours}${textsValue.hoursAgo || '小时前'}`
  
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes > 0) return `${minutes}${textsValue.minutesAgo || '分钟前'}`
  
  return textsValue.justNow || '刚刚'
}

const loadLikes = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const localLikes = uni.getStorageSync('likesList') || []
    likesList.value = localLikes.map((item: any) => ({
      ...item,
      time: formatTime(item.time || item.timestamp || new Date().toISOString())
    }))
  } catch (error) {
    console.error('加载点赞列表失败:', error)
    likesList.value = []
  } finally {
    loading.value = false
  }
}

const handleItemClick = (item: LikeItem) => {
  uni.navigateTo({
    url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
  })
}

onMounted(() => {
  languageStore.loadLanguage()
  loadLikes()
})
</script>

<style scoped>
.my-likes-page {
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

.likes-list {
  padding: 20rpx;
}

.like-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}
</style>
