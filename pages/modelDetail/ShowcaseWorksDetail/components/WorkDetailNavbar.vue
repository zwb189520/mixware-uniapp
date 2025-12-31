<template>
  <view class="navbar-container">
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">{{ title || '作品详情' }}</text>
      </view>
      <view class="navbar-right">
        <text class="navbar-more">...</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WorkDetailNavbar',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleBack() {
      this.$emit('back-click')
    },
    handleMoreClick() {
      this.$emit('more-click')
    }
  }
}
</script>

<style scoped>
.navbar-container {
  background: #fff;
  border-bottom: 1rpx solid #e0e0e0;
  padding-top: env(safe-area-inset-top);
  z-index: 100;
}

.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  position: relative;
}

.navbar-left,
.navbar-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-left:active {
  opacity: 0.6;
}
</style>