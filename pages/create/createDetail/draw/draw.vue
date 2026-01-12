<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar title="画一画" @back="handleBackClick" />
    <view class="empty-page">
      <text>功能开发中</text>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {}
  },
  methods: {
    handleBackClick() {
      uni.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.empty-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-page text {
  font-size: 32rpx;
  color: #999;
}
</style>
