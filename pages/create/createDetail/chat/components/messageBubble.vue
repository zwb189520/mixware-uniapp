<template>
  <view class="message-item" :class="message.type">
    <view v-if="!message.isUser" class="avatar ai-avatar">
      <image src="/static/images/ai-avatar.png" class="avatar-img" />
    </view>
    
    <view class="message-wrapper">
      <text v-if="!message.isUser" class="author-name">{{ message.author || 'AI助手' }}</text>
      <view class="message-bubble">
        <view class="bubble-content">
          <text class="message-text">{{ message.content }}</text>
        </view>
        <view class="bubble-tail"></view>
      </view>
    </view>
    
    <view v-if="message.isUser" class="avatar user-avatar">
      <image src="/static/images/user-avatar.png" class="avatar-img" />
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
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-start;
  padding: 0 20rpx;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.ai {
  flex-direction: row;
}

.avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  margin: 0 10rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.message-wrapper {
  flex: 1;
  max-width: 520rpx;
}

.author-name {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  margin-left: 12rpx;
}

.user .author-name {
  text-align: right;
  margin-right: 12rpx;
  margin-left: 0;
}

.message-bubble {
  position: relative;
  word-wrap: break-word;
}

.bubble-content {
  padding: 20rpx 24rpx;
  border-radius: 18rpx;
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
}

.user .bubble-content {
  background: #07c160;
  margin-left: 80rpx;
}

.ai .bubble-content {
  background: #ffffff;
  margin-right: 80rpx;
  border: 1rpx solid #e6e6e6;
}

.user .bubble-content::after {
  content: '';
  position: absolute;
  top: 20rpx;
  right: -8rpx;
  width: 0;
  height: 0;
  border-left: 8rpx solid #07c160;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
}

.ai .bubble-content::after {
  content: '';
  position: absolute;
  top: 20rpx;
  left: -8rpx;
  width: 0;
  height: 0;
  border-right: 8rpx solid #ffffff;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
}

.ai .bubble-content::before {
  content: '';
  position: absolute;
  top: 20rpx;
  left: -9rpx;
  width: 0;
  height: 0;
  border-right: 8rpx solid #e6e6e6;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
}

.message-text {
  font-size: 32rpx;
  line-height: 1.4;
  color: #333;
}

.user .message-text {
  color: #ffffff;
}
</style>