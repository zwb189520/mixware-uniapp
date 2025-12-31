<template>
  <view class="message-item" :class="message.type">
    <view class="message-bubble">
      <text class="message-text">{{ message.content }}</text>
      <view v-if="message.imageUrl" class="image-container">
        <image 
          :src="message.imageUrl" 
          class="message-image"
          mode="aspectFill"
          @click="selectImage"
        />
        <view v-if="message.selected" class="selected-overlay">
          <text class="selected-icon">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ImageMessage',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  methods: {
    selectImage() {
      this.$emit('image-select', this.message)
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

.image-container {
  margin-top: 16rpx;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
}

.message-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 16rpx;
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.selected-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
}
</style>