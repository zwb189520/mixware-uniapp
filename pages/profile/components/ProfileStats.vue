<template>
  <view class="profile-stats">
    <view class="stats-grid">
      <view 
        v-for="stat in stats" 
        :key="stat.id" 
        class="stat-item"
        @click="handleStatClick(stat)"
      >
        <view class="stat-icon-wrapper">
          <image :src="stat.icon" mode="aspectFit" class="stat-icon"></image>
        </view>
        <text class="stat-name">{{ stat.name }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguage } from '@/composables'

export default {
  name: 'ProfileStats',
  data() {
    return {
      stats: []
    }
  },
  setup() {
    const { texts } = useLanguage()
    return { texts }
  },
  mounted() {
    this.updateStats()
  },
  watch: {
    'texts'() {
      this.updateStats()
    }
  },
  methods: {
    updateStats() {
      this.stats = [
        { id: 1, name: this.texts.likes, icon: '/static/images/customIcon/like.png' },
        { id: 2, name: this.texts.collections, icon: '/static/images/customIcon/collect.png' },
        { id: 3, name: this.texts.printTasks || '打印任务', icon: '/static/images/customIcon/print.png' },
        { id: 4, name: this.texts.modelTasks || '模型任务', icon: '/static/images/customIcon/model.png' }
      ]
    },
    handleStatClick(stat) {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      if (stat.id === 1) {
        uni.navigateTo({
          url: '/pagesMember/content/myLikes/myLikes'
        })
      } else if (stat.id === 2) {
        uni.navigateTo({
          url: '/pagesMember/content/myFavorites/myFavorites'
        })
      } else if (stat.id === 3) {
        uni.navigateTo({
          url: '/pagesMember/content/printTasks/printTasks'
        })
      } else if (stat.id === 4) {
        uni.navigateTo({
          url: '/pagesMember/content/modelTasks/modelTasks'
        })
      }
    }
  }
}
</script>

<style scoped>
.profile-stats {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 40rpx 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:active {
  transform: translateY(-8rpx);
}

.stat-icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF9F5 0%, #FFE8DC 100%);
  border-radius: 24rpx;
  transition: all 0.3s ease;
}



.stat-icon {
  width: 56rpx;
  height: 56rpx;
}

.stat-count {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-name {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}
</style>


