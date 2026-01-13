<template>
  <view class="message-list">
    <view v-if="messages.length === 0" class="empty-state">
      <text class="empty-text">暂无消息</text>
    </view>
    <view v-else class="message-items">
      <view 
        v-for="message in messages" 
        :key="message.id" 
        class="message-item"
        @click="handleMessageClick(message)"
      >
        <view class="message-icon">
          <uni-icons :type="getMessageIcon(message.type)" size="24" :color="message.read ? '#999' : '#007aff'"></uni-icons>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-time">{{ message.time }}</text>
          </view>
          <text class="message-desc">{{ message.content }}</text>
        </view>
        <view v-if="!message.read" class="unread-badge"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageList',
  data() {
    return {
      messages: []
    }
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    loadMessages() {
      this.messages = uni.getStorageSync('messages') || []
    },
    getMessageIcon(type) {
      const iconMap = {
        'system': 'info',
        'notification': 'notification',
        'like': 'heart',
        'comment': 'chat'
      }
      return iconMap[type] || 'info'
    },
    handleMessageClick(message) {
      message.read = true
      this.saveMessages()
    },
    clearAllMessages() {
      this.messages = []
      this.saveMessages()
      uni.showToast({
        title: '已清除所有消息',
        icon: 'success'
      })
    },
    saveMessages() {
      uni.setStorageSync('messages', this.messages)
    }
  }
}
</script>

<style scoped>
.message-list {
  padding: 20rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.message-items {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
}

.message-item:last-child {
  border-bottom: none;
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.message-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}

.message-desc {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400rpx;
}

.unread-badge {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ff4757;
  position: absolute;
  top: 30rpx;
  right: 30rpx;
}
</style>
