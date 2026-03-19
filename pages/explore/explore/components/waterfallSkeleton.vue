<template>
  <view class="skeleton-container">
    <view class="waterfall-box">
      <view class="waterfall-col">
        <view class="skeleton-card" v-for="i in 4" :key="'left-' + i">
          <view class="skeleton-img"></view>
          <view class="skeleton-info">
            <view class="skeleton-text skeleton-desc"></view>
            <view class="skeleton-footer">
              <view class="skeleton-author">
                <view class="skeleton-avatar"></view>
                <view class="skeleton-text skeleton-name"></view>
              </view>
              <view class="skeleton-text skeleton-like"></view>
            </view>
          </view>
        </view>
      </view>
      <view class="waterfall-col">
        <view class="skeleton-card" v-for="i in 4" :key="'right-' + i">
          <view class="skeleton-img"></view>
          <view class="skeleton-info">
            <view class="skeleton-text skeleton-desc"></view>
            <view class="skeleton-footer">
              <view class="skeleton-author">
                <view class="skeleton-avatar"></view>
                <view class="skeleton-text skeleton-name"></view>
              </view>
              <view class="skeleton-text skeleton-like"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: 'WaterfallSkeleton'
}
</script>

<style scoped>
.skeleton-container {
  padding: 20rpx;
}

.waterfall-box {
  display: flex;
  gap: 20rpx;
}

.waterfall-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.skeleton-img {
  width: 100%;
  height: 300rpx;
  background: #f0f0f0;
}

.skeleton-info {
  padding: 20rpx;
}

.skeleton-text {
  background: #f0f0f0;
  border-radius: 4rpx;
}

.skeleton-desc {
  height: 40rpx;
  margin-bottom: 20rpx;
  width: 90%;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-author {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.skeleton-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.skeleton-name {
  width: 80rpx;
  height: 24rpx;
}

</style>


