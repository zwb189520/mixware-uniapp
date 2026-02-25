<template>
  <view class="showcase-button" @click="handleShowcaseClick">
    <view class="button-content">
      <image src="/static/images/icon/my-works.png" mode="aspectFit" class="button-icon"></image>
      <view class="text-wrapper">
        <text class="button-text">{{ myWorksText }}</text>
        <text v-if="worksCount === 0" class="hint-text">快去打印吧</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'
import { getPostList } from '@/api/community.js'

export default {
  name: 'ShowcaseButton',
  data() {
    return {
      worksCount: 0
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.profile
    },
    myWorksText() {
      return this.languageStore.texts.myWorks.title
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
    this.checkWorksCount()
  },
  methods: {
    async checkWorksCount() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.userId) {
          const res = await getPostList({
            userId: userInfo.userId,
            current: 1,
            size: 1
          })
          if (res.code === 0 && res.data) {
             this.worksCount = res.data.total || 0
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    handleShowcaseClick() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: '/pagesMember/content/myWorks/myWorks'
      })
    }
  }
}
</script>

<style scoped>
.showcase-button {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.08);
  transition: all 0.3s ease;
}

.showcase-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.12);
}

.button-content {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.button-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 10rpx;
  filter: drop-shadow(0 2rpx 8rpx rgba(255, 107, 53, 0.2));
}

.button-text {
  margin-left: 0;
}

.text-wrapper {
  display: flex;
  flex-direction: column;
}

.hint-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.text-wrapper {
  display: flex;
  flex-direction: column;
}

.hint-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}
</style>
