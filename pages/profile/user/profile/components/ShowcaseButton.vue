<template>
  <view class="showcase-button" @click="handleShowcaseClick">
    <view class="button-content">
      <uni-icons type="color" size="30" color="#333"></uni-icons>
      <text class="button-text">作品博物馆</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShowcaseButton',
  methods: {
    handleShowcaseClick() {
        uni.navigateTo({
          url: '/pages/profile/myWorks/myWorks'
        })
      }
  }
}
</script>

<style scoped>
.showcase-button {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}

.button-content {
  display: flex;
  align-items: center;
}

.button-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-left: 10rpx;
}
</style>
