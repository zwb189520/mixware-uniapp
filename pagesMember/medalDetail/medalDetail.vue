<template>
  <view class="medal-detail-page">
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    <view class="header">
      <uni-icons type="left" size="24" @click="goBack"></uni-icons>
      <text class="header-title">{{ texts.medalsWall }}</text>
      <view class="header-placeholder"></view>
    </view>
    
    <view class="medals-container">
      <view 
        v-for="medal in medals" 
        :key="medal.id" 
        class="medal-card"
      >
        <view class="medal-header">
          <view class="medal-icon-wrapper" :class="{ 'unachieved': !medal.achieved }">
            <image :src="medal.image" mode="aspectFit" class="medal-image"></image>
          </view>
          <view class="medal-info">
            <text class="medal-name">{{ medal.name }}</text>
            <view class="medal-status" :class="{ 'achieved': medal.achieved }">
              {{ medal.achieved ? texts.achieved : texts.notAchieved }}
            </view>
          </view>
        </view>
        <view class="medal-description">
          <text class="description-label">{{ texts.achievementStandard }}</text>
          <text class="description-text">{{ medal.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  name: 'MedalDetail',
  data() {
    return {
      statusBarHeight: 0,
      medals: []
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.medalDetail
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
    this.updateMedals()
  },
  watch: {
    'languageStore.language'() {
      this.updateMedals()
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    updateMedals() {
      this.medals = [
        { 
          id: 1, 
          name: this.texts.newbieMedal, 
          image: '/static/images/medal/newbie-medal.png',
          description: this.texts.newbieMedalDesc,
          achieved: true
        },
        { 
          id: 2, 
          name: this.texts.creatorMedal, 
          image: '/static/images/medal/creator-medal.png',
          description: this.texts.creatorMedalDesc,
          achieved: true
        },
        { 
          id: 3, 
          name: this.texts.activeUserMedal, 
          image: '/static/images/medal/active-user-medal.png',
          description: this.texts.activeUserMedalDesc,
          achieved: false
        },
        { 
          id: 4, 
          name: this.texts.popularMedal, 
          image: '/static/images/medal/popular-medal.png',
          description: this.texts.popularMedalDesc,
          achieved: false
        },
        { 
          id: 5, 
          name: this.texts.modelMasterMedal, 
          image: '/static/images/medal/model-master-medal.png',
          description: this.texts.modelMasterMedalDesc,
          achieved: false
        },
        { 
          id: 6, 
          name: this.texts.printExpertMedal, 
          image: '/static/images/medal/print-expert-medal.png',
          description: this.texts.printExpertMedalDesc,
          achieved: false
        },
        { 
          id: 7, 
          name: this.texts.contributorMedal, 
          image: '/static/images/medal/contributor-medal.png',
          description: this.texts.contributorMedalDesc,
          achieved: false
        },
        { 
          id: 8, 
          name: this.texts.pioneerMedal, 
          image: '/static/images/medal/pioneer-medal.png',
          description: this.texts.pioneerMedalDesc,
          achieved: false
        }
      ]
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.medal-detail-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.safe-area-top {
  width: 100%;
  background-color: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-placeholder {
  width: 48rpx;
}

.medals-container {
  padding: 20rpx;
}

.medal-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.medal-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.medal-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal-icon-wrapper.unachieved {
  opacity: 0.3;
  filter: grayscale(100%);
}

.medal-image {
  width: 100%;
  height: 100%;
}

.medal-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.medal-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.medal-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #999;
}

.medal-status.achieved {
  background-color: #e8f5e8;
  color: #52c41a;
}

.medal-description {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 12rpx;
}

.description-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.description-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
