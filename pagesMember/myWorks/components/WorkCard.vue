<template>
  <view class="work-card">
    <image 
      class="work-image" 
      :src="work.image" 
      mode="aspectFill"
      lazy-load
    ></image>
    <view class="work-info">
      <text class="work-title">{{ work.title }}</text>
      <view class="work-meta">
        <text class="work-time">{{ work.printTime }}</text>
        <text class="work-date">{{ work.printDate }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WorkCard',
  props: {
    work: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.work-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.work-image {
  width: 100%;
  height: 300rpx;
  display: block;
}

.work-info {
  padding: 20rpx;
}

.work-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.work-meta {
  display: flex;
  flex-direction: column;
}

.work-time {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 6rpx;
}

.work-date {
  font-size: 24rpx;
  color: #999;
}
</style>
