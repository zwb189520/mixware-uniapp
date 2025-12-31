<template>
  <view class="message-item" :class="message.type">
    <view class="message-bubble">
      <text class="message-text">{{ message.content }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.message-item {
  margin-bottom: 32rpx;
  display: flex;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 480rpx;
  padding: 24rpx 32rpx;
  border-radius: 32rpx;
  position: relative;
}

.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai .message-bubble {
  background: #fff;
  border: 1rpx solid #e0e0e0;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
}

.user .message-text {
  color: #fff;
}
</style>