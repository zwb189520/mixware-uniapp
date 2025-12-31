<template>
  <view class="user-info-container">
    <view class="user-info">
      <image 
        class="user-avatar" 
        :src="userAvatar" 
        mode="aspectFill"
        @error="handleImageError"
      />
      <view class="user-details">
        <text class="user-name">{{ userName }}</text>
        <text class="user-level">高级创作者</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserInfo',
  props: {
    userName: {
      type: String,
      default: ''
    },
    userAvatar: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleImageError(e) {
      console.log('用户头像加载失败:', e)
    }
  }
}
</script>

<style scoped>
.user-info-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.user-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.user-level {
  font-size: 24rpx;
  color: #666;
}
</style>