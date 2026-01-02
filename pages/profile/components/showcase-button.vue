<template>
  <view class="showcase-button" @click="handleShowcaseClick">
    <view class="button-content">
      <uni-icons type="color" size="24" color="#007aff"></uni-icons>
      <text class="button-text">作品博物馆</text>
      <uni-icons type="right" size="16" color="#999"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShowcaseButton',
  methods: {
    handleShowcaseClick() {
      uni.navigateTo({
        url: '/pages/ShowcaseWorksDetail/ShowcaseWorksDetail'
      })
    }
  }
}
</script>

<style scoped>
.showcase-button {
  background-color: #fff;
  padding: 0 30rpx;
  margin: 20rpx 0;
}

.button-content {
  display: flex;
  align-items: center;
  height: 88rpx;
}

.button-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  margin-left: 20rpx;
}
</style>
