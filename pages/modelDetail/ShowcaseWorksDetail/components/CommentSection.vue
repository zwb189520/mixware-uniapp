<template>
  <view class="comment-section-container">
    <view class="comment-section">
      <text class="section-title">评论 ({{ comments.length }})</text>
      
      <view class="comment-list">
        <view 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <!-- 主评论 -->
          <view class="comment-main">
            <image 
              class="comment-avatar" 
              :src="comment.userAvatar" 
              mode="aspectFill"
              @error="handleImageError"
            />
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-username">{{ comment.userName }}</text>
                <text class="comment-time">{{ comment.time }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view 
                  class="action-item"
                  @click="handleReplyClick(comment.id)"
                >
                  <text class="action-icon">💬</text>
                  <text class="action-text">回复</text>
                </view>
                <view 
                  class="action-item"
                  :class="{ 'liked': comment.isLiked }"
                  @click="handleLikeClick(comment.id)"
                >
                  <text class="action-icon">{{ comment.isLiked ? '❤️' : '🤍' }}</text>
                  <text class="action-text">{{ comment.likes }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 回复 -->
          <view v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
            <view 
              v-for="reply in comment.replies" 
              :key="reply.id" 
              class="reply-item"
            >
              <image 
                class="reply-avatar" 
                :src="comment.userAvatar" 
                mode="aspectFill"
                @error="handleImageError"
              />
              <view class="reply-content">
                <view class="reply-header">
                  <text class="reply-username">{{ reply.userName }}</text>
                  <text class="reply-time">{{ reply.time }}</text>
                </view>
                <text class="reply-text">{{ reply.content }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CommentSection',
  props: {
    comments: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleLikeClick(commentId) {
      this.$emit('like-click', commentId)
    },

    handleReplyClick(commentId) {
      this.$emit('reply-click', commentId)
    },

    handleImageError(e) {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.comment-section-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.comment-section {
  width: 100%;
}

.section-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.comment-item {
  width: 100%;
}

.comment-main {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.comment-username {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.comment-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 12rpx;
  border-radius: 20rpx;
  transition: background-color 0.2s;
}

.action-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.action-item.liked {
  color: #e53e3e;
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
}

.comment-replies {
  margin-left: 76rpx;
  margin-top: 16rpx;
  padding-left: 24rpx;
  border-left: 2rpx solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.reply-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.reply-username {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.reply-time {
  font-size: 20rpx;
  color: #999;
}

.reply-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;
}
</style>