<template>
  <view class="custom-navbar">
    <view class="navbar-left" v-if="showBack" @click="handleBack">
      <uni-icons type="left" size="24"></uni-icons>
    </view>
    <view class="navbar-center">
      <text class="navbar-title">{{ title }}</text>
    </view>
    <view class="navbar-right" v-if="$slots.right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomNavbar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleBack() {
      this.$emit('back')
    }
  }
}
</script>

<style scoped>
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #e0e0e0;
  z-index: 100;
  position: relative;
}

.navbar-left {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 32rpx;
  top: 0;
  bottom: 0;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.navbar-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 30rpx;
  position: absolute;
  right: 32rpx;
  top: 0;
  bottom: 0;
}

.navbar-left:active {
  opacity: 0.6;
}
</style>
