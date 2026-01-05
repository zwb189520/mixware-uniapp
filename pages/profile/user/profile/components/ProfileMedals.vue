<template>
  <view class="profile-medals">
    <view class="medals-title">
      <text>勋章墙</text>
    </view>
    <view class="medals-grid">
      <view 
        v-for="medal in medals" 
        :key="medal.id" 
        class="medal-item"
      >
        <image :src="medal.icon" mode="aspectFit" />
        <text class="medal-name">{{ medal.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfileMedals',
  data() {
    return {
      medals: [
        { id: 1, name: '新手勋章', icon: '/static/medal-newbie.png' },
        { id: 2, name: '创作者', icon: '/static/medal-creator.png' },
        { id: 3, name: '活跃用户', icon: '/static/medal-active.png' },
        { id: 4, name: '人气王', icon: '/static/medal-popular.png' }
      ]
    }
  }
}
</script>

<style scoped>
.profile-medals {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}

.medals-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
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

.medal-item image {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.medal-name {
  font-size: 24rpx;
  color: #666;
}
</style>
