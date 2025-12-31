<template>
  <view class="navbar">
    <view class="navbar-left" @click="handleBackClick">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>
    
    <view class="navbar-center">
      <text class="navbar-title">变一变 - {{ modelName }}</text>
    </view>
    
    <view class="navbar-right">
    </view>
  </view>
</template>

<script>
export default {
  name: 'TransformNavbar',
  props: {
    modelName: {
      type: String,
      default: '基础模型'
    }
  },
  methods: {
    handleBackClick() {
      this.$emit('back-click')
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background: #fff;
  border-bottom: 1rpx solid #e0e0e0;
  padding: 0 32rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 32rpx;
  color: #333;
  margin-right: 16rpx;
}

.back-text {
  font-size: 28rpx;
  color: #333;
}

.navbar-center {
  flex: 1;
  text-align: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.navbar-right {
  width: 100rpx;
  display: flex;
  justify-content: flex-end;
}
</style>