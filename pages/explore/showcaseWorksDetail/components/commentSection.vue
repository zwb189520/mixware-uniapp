<template>
  <view class="comment-section-container">
    <view class="comment-section">
      <text class="section-title">{{ texts.comments }} ({{ totalCount }})</text>

      <view class="comment-list">
        <view v-for="comment in displayComments" :key="comment.id" class="comment-item">
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
                <text
                  class="action-text-only"
                  @click="handleReplyClick(comment.id, comment.userName)"
                >
                  {{ texts.reply }}
                </text>
                <text v-if="comment.replyCount > 0" class="reply-count-text">
                  {{ comment.replyCount }}{{ texts.repliesCountSuffix || '条回复' }}
                </text>
                <view
                  class="action-item"
                  :class="{ liked: comment.isLiked }"
                  @click="handleLikeClick(comment.id)"
                >
                  <image
                    class="action-icon-img"
                    :src="
                      comment.isLiked
                        ? '/static/images/icon/like_active.png'
                        : '/static/images/icon/like.png'
                    "
                    mode="aspectFit"
                  />
                  <text class="action-text">{{ comment.likes }}</text>
                </view>
                <view
                  v-if="currentUserId === comment.userId || currentUserId === postAuthorId"
                  class="action-item delete-btn"
                  @click="handleDeleteClick(comment.id)"
                >
                  <uni-icons type="trash" size="20" color="#ff3b30"></uni-icons>
                  <text class="action-text delete-text">{{ texts.delete }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
            <view v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <image
                class="reply-avatar"
                :src="reply.userAvatar"
                mode="aspectFill"
                @error="handleImageError"
              />
              <view class="reply-content">
                <view class="reply-header">
                  <text class="reply-username">{{ reply.userName }}</text>
                  <text class="reply-time">{{ reply.time }}</text>
                </view>
                <text class="reply-text">{{ reply.content }}</text>
                <view class="reply-actions">
                  <text
                    class="action-text-only"
                    @click="handleReplyClick(reply.id, reply.userName)"
                  >
                    {{ texts.reply }}
                  </text>
                  <view
                    class="action-item"
                    :class="{ liked: reply.isLiked }"
                    @click="handleLikeClick(reply.id)"
                  >
                    <image
                      class="action-icon-img"
                      :src="
                        reply.isLiked
                          ? '/static/images/icon/like_active.png'
                          : '/static/images/icon/like.png'
                      "
                      mode="aspectFit"
                    />
                    <text class="action-text">{{ reply.likes }}</text>
                  </view>
                  <view
                    v-if="currentUserId === reply.userId || currentUserId === postAuthorId"
                    class="action-item delete-btn"
                    @click="handleDeleteClick(reply.id)"
                  >
                    <uni-icons type="trash" size="20" color="#ff3b30"></uni-icons>
                    <text class="action-text delete-text">{{ texts.delete }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="comments.length > 2" class="view-more-btn" @click="handleViewMore">
        <text class="view-more-text">{{ texts.viewMoreComments }}</text>
        <uni-icons type="right" size="16" color="#666"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'

interface Comment {
  id: number | string
  userId: string
  userName: string
  userAvatar: string
  content: string
  time: string
  likes: number
  isLiked: boolean
  replyCount: number
  replies?: Comment[]
}

export default {
  name: 'CommentSection',
  props: {
    comments: {
      type: Array as () => Comment[],
      default: () => []
    },
    totalCount: {
      type: Number,
      default: 0
    },
    currentUserId: {
      type: String,
      default: ''
    },
    postAuthorId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.explore
    },
    displayComments(): Comment[] {
      return this.comments.slice(0, 2)
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleLikeClick(commentId: number | string): void {
      this.$emit('like-click', commentId)
    },

    handleReplyClick(commentId: number | string, userName: string): void {
      this.$emit('reply-click', { commentId, userName })
    },

    handleDeleteClick(commentId: number | string): void {
      this.$emit('delete-click', commentId)
    },

    handleViewMore(): void {
      this.$emit('view-more')
    },

    handleImageError(e: Event): void {
      console.log('图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.comment-section-container {
  background: #fff;
  margin: 0;
  border-radius: 0;
  padding: 0;
}

.comment-section {
  width: 100%;
}

.section-title {
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: 700;
  margin-bottom: 32rpx;
  display: block;
  letter-spacing: 0.5rpx;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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
  min-width: 0;
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
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
  flex-wrap: wrap;
}

.reply-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
  flex-wrap: wrap;
}

.action-text-only {
  font-size: 24rpx;
  color: #666;
  padding: 8rpx 12rpx;
  border-radius: 20rpx;
  transition: background-color 0.2s;
}

.action-text-only:active {
  background: rgba(0, 0, 0, 0.05);
}

.reply-count-text {
  font-size: 24rpx;
  color: #ff5a00;
  padding: 8rpx 12rpx;
  font-weight: 500;
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

.action-icon-img {
  width: 32rpx;
  height: 32rpx;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #666;
}

.action-item.liked .action-text {
  color: #ff69b4;
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
  min-width: 0;
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
  word-break: break-word;
}

.delete-btn {
  flex-shrink: 0;
}

.delete-text {
  color: #ff3b30;
}

.view-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx 0;
  margin-top: 32rpx;
  border-top: 2rpx solid #f5f5f5;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.view-more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #ff5a00, transparent);
  transition: width 0.3s;
}

.view-more-btn:active::before {
  width: 100%;
}

.view-more-btn:active {
  background: rgba(255, 90, 0, 0.03);
}

.view-more-text {
  font-size: 28rpx;
  color: #ff5a00;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}
</style>
