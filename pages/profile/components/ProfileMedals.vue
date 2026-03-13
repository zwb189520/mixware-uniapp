<template>
  <view class="profile-medals" @click="handleMedalClick">
    <view class="medals-title">
      <image src="/static/images/icon/medal.png" mode="aspectFit" class="title-icon"></image>
      <text>{{ texts.medalsWall }}</text>
    </view>
    <view class="medals-grid">
      <view 
        v-for="medal in medals" 
        :key="medal.id" 
        class="medal-item"
      >
        <view class="medal-icon-wrapper" :class="{ 'unachieved': !medal.achieved }">
          <image :src="medal.image || '/static/images/icon/medal.png'" mode="aspectFit" class="medal-image"></image>
        </view>
        <text class="medal-name">{{ medal.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguage } from '@/composables'

export default {
  name: 'ProfileMedals',
  data() {
    return {
      medals: []
    }
  },
  setup() {
    const { texts } = useLanguage()
    return { texts }
  },
  mounted() {
    this.updateMedals()
  },
  watch: {
    'texts'() {
      this.updateMedals()
    }
  },
  methods: {
    updateMedals() {
      this.medals = [
        { id: 1, name: this.texts.newbieMedal, image: '/static/images/medal/newbie-medal.png', achieved: true },
        { id: 2, name: this.texts.creatorMedal, image: '/static/images/medal/creator-medal.png', achieved: true },
        { id: 3, name: this.texts.activeUserMedal, image: '/static/images/medal/active-user-medal.png', achieved: false },
        { id: 4, name: this.texts.popularMedal, image: '/static/images/medal/popular-medal.png', achieved: false },
        { id: 5, name: this.texts.modelMasterMedal, image: '/static/images/medal/model-master-medal.png', achieved: false },
        { id: 6, name: this.texts.printExpertMedal, image: '/static/images/medal/print-expert-medal.png', achieved: false },
        { id: 7, name: this.texts.contributorMedal, image: '/static/images/medal/contributor-medal.png', achieved: false },
        { id: 8, name: this.texts.pioneerMedal, image: '/static/images/medal/pioneer-medal.png', achieved: false }
      ]
    },
    handleMedalClick() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: '/pagesMember/medalDetail/medalDetail'
      })
    }
  }
}
</script>

<style scoped>
.profile-medals {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  transition: all 0.3s ease;
}

.profile-medals:active {
  transform: scale(0.98);
}

.medals-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.title-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 10rpx;
  filter: drop-shadow(0 2rpx 8rpx rgba(255, 107, 53, 0.2));
}

.medals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.medal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.medal-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.medal-icon-wrapper:not(.unachieved) {
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% { filter: drop-shadow(0 0 8rpx rgba(255, 215, 0, 0.3)); }
  50% { filter: drop-shadow(0 0 16rpx rgba(255, 215, 0, 0.6)); }
}

.medal-icon-wrapper.unachieved {
  opacity: 0.3;
  filter: grayscale(100%);
}

.medal-image {
  width: 100%;
  height: 100%;
}

.medal-name {
  font-size: 22rpx;
  color: #666;
}
</style>
