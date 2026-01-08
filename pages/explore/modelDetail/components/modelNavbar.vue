<template>
  <view class="navbar-container">
    <view class="navbar">
      <view class="navbar-left" @click="handleBackClick">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">{{ modelName }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModelNavbar',
  props: {
    modelName: {
      type: String,
      default: '模型详情'
    }
  },
  methods: {
    handleBackClick() {
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
  width: 88rpx;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 88rpx;
  right: 88rpx;
  top: 0;
  bottom: 0;
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