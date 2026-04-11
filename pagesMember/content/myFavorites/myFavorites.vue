
<template>
  <view class="my-favorites-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <scroll-view scroll-y class="content-scroll">
      <view class="empty-state" v-if="!favoritesList.length">
        <uni-icons type="star" size="80" color="#ddd"></uni-icons>
        <text class="empty-text">{{ texts.noFavorites }}</text>
      </view>
      <view class="favorites-list" v-else>
        <view
          v-for="item in favoritesList"
          :key="item.id"
          class="favorite-item"
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

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { getFavoriteModels } from '@/api/userFavorite'

interface FavoriteItem {
  id: number | string
  favoriteId: number | string
  title: string
  image: string
  time: string
  collectCount: number
  groupId: number | string
}

export default {
  name: 'MyFavorites',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      favoritesList: [] as FavoriteItem[],
      loading: false as boolean
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    texts(): any {
      return this.languageStore?.texts?.myFavorites || {}
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
    this.loadFavorites()
  },
  onShow(): void {
    this.loadFavorites()
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },
    async loadFavorites(): Promise<void> {
      if (this.loading) return
      this.loading = true

      try {
        const res: any = await getFavoriteModels()
        console.log('收藏列表响应:', res)
        if (res.code === 1 && res.data) {
          this.favoritesList = res.data.map((item: any) => ({
            id: item.modelId,
            favoriteId: item.favoriteId,
            title: item.name,
            image: this.fixImageUrl(item.previewUrl),
            time: this.formatTime(item.favoriteTime),
            collectCount: item.collectCount,
            groupId: item.groupId
          }))
          console.log('收藏列表数据:', this.favoritesList)
        } else {
          this.favoritesList = []
        }
      } catch (error) {
        console.error('加载收藏失败:', error)
        this.favoritesList = []
      } finally {
        this.loading = false
      }
    },
    fixImageUrl(url: string): string {
      if (!url) return ''
      return url
        .replace('localhost:9000', '47.102.212.37:9000')
        .replace('api/uploads/image', '9000/image')
    },
    formatTime(timeStr: string): string {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days > 0) return `${days}${this.texts.daysAgo || '天前'}`

      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours > 0) return `${hours}${this.texts.hoursAgo || '小时前'}`

      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes > 0) return `${minutes}${this.texts.minutesAgo || '分钟前'}`

      return this.texts.justNow || '刚刚'
    },
    handleItemClick(item: FavoriteItem): void {
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
      })
    }
  }
}
</script>

<style scoped>
.my-favorites-page {
  min-height: 100vh;
  background: #fff9f5;
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

.favorites-list {
  padding: 20rpx;
}

.favorite-item {
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
