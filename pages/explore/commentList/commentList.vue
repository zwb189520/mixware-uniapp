<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />

    <!-- 评论统计和排序 -->
    <view class="comment-header">
      <text class="comment-count">{{ comments.length }} {{ texts.comments }}</text>
      <view class="sort-btn" @click="toggleSortMenu">
        <text class="sort-text">{{ sortText }}</text>
        <uni-icons type="down" size="14" color="#666"></uni-icons>
      </view>

      <!-- 排序下拉菜单 -->
      <view v-if="showSortMenu" class="sort-menu">
        <view
          v-for="(item, index) in sortOptions"
          :key="index"
          class="sort-menu-item"
          :class="{ active: sortType === item.value }"
          @click="selectSort(item)"
        >
          <text class="sort-menu-text">{{ item.label }}</text>
          <uni-icons
            v-if="sortType === item.value"
            type="checkmarkempty"
            size="16"
            color="#FF5A00"
          ></uni-icons>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="comment-list">
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <view class="comment-main">
            <image class="comment-avatar" :src="comment.userAvatar" mode="aspectFill" />
            <view class="comment-content">
              <view class="comment-header-info">
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
              <image class="reply-avatar" :src="reply.userAvatar" mode="aspectFill" />
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
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="bottom-input-bar">
      <view class="comment-input-trigger" @click="handleInputTrigger">
        <text class="placeholder-text">{{ texts.placeholder }}</text>
      </view>
    </view>

    <view
      v-if="isPopupOpen"
      class="popup-mask"
      @tap="closeCommentPopup"
      @touchmove.stop.prevent="moveHandle"
    >
      <view
        class="comment-popup"
        :style="{ bottom: keyboardHeight + 'px' }"
        @tap.stop
        @touchmove.stop.prevent="moveHandle"
      >
        <view class="popup-body">
          <textarea
            class="popup-textarea"
            v-model="commentText"
            :placeholder="
              replyTargetName
                ? texts.replyTo + ' ' + replyTargetName + '...'
                : texts.inputPlaceholder
            "
            :maxlength="1000"
            :focus="true"
            :show-confirm-bar="false"
            :adjust-position="false"
            @focus="handleKeyboardShow"
            @blur="handleKeyboardHide"
          />
          <text class="char-count">{{ commentText.length }}/1000</text>
        </view>
        <view class="popup-footer">
          <view class="footer-left">
            <image
              class="footer-icon"
              src="/static/images/icon/image.png"
              mode="aspectFit"
              @click="handleUploadImage"
            />
          </view>
          <view class="publish-btn" :class="{ active: commentText.trim() }" @click="handlePublish">
            <text class="publish-text">{{ texts.publish }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { getPostComments, toggleLike, createComment, deleteComment } from '@/api/community'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface Comment {
  id: number | string
  userId: string
  userName: string
  userAvatar: string
  content: string
  time: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface SortOption {
  label: string
  value: string
}

export default {
  components: {
    CustomNavbar
  },
  data() {
    return {
      postId: '' as string,
      postAuthorId: '' as string,
      currentUserId: '' as string,
      comments: [] as Comment[],
      isPopupOpen: false as boolean,
      commentText: '' as string,
      replyTargetId: null as number | string | null,
      replyTargetName: '' as string,
      keyboardHeight: 0 as number,
      sortType: 'time' as string,
      showSortMenu: false as boolean,
      totalComments: 0 as number
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    userStore(): ReturnType<typeof useUserStore> {
      return useUserStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.commentList
    },
    sortText(): string {
      const map: Record<string, string> = {
        time: this.texts.sortByTime,
        likes: this.texts.sortByLikes,
        replies: this.texts.sortByReplies
      }
      return map[this.sortType]
    },
    sortOptions(): SortOption[] {
      return [
        { label: this.texts.sortByTime, value: 'time' },
        { label: this.texts.sortByLikes, value: 'likes' },
        { label: this.texts.sortByReplies, value: 'replies' }
      ]
    }
  },
  onLoad(options: Record<string, string>): void {
    this.postId = options.postId || ''
    this.postAuthorId = options.postAuthorId || ''
    this.languageStore.loadLanguage()
    this.getCurrentUserId()

    if (this.postId) {
      this.loadComments()
    } else {
      uni.showToast({
        title: this.texts.operationFailed || '参数错误',
        icon: 'none'
      })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  },
  methods: {
    getCurrentUserId(): void {
      this.currentUserId = String(this.userStore.userId || '')
    },

    async loadComments(): Promise<void> {
      if (!this.postId || String(this.postId) === 'NaN' || String(this.postId) === 'undefined')
        return

      try {
        const res = await getPostComments(this.postId)
        if ((res.code === 0 || res.code === 1) && res.data && res.data.length > 0) {
          this.comments = this.transformComments(res.data as unknown as Record<string, unknown>[])
        } else {
          this.loadLocalComments()
        }
      } catch (e: unknown) {
        console.error('加载评论失败:', e)
        this.loadLocalComments()
      }
    },

    saveLocalComments(): void {
      if (this.postId) {
        const key = `comments_${this.postId}`
        uni.setStorageSync(key, this.comments)
        this.updateLocalPostCommentCount()
      }
    },

    loadLocalComments(): boolean {
      if (this.postId) {
        const key = `comments_${this.postId}`
        const localComments = uni.getStorageSync(key) as Comment[] | undefined
        if (localComments && localComments.length > 0) {
          this.comments = localComments
          this.totalComments = this.calculateCommentCount(localComments)
          return true
        }
      }
      return false
    },

    calculateCommentCount(comments: Comment[]): number {
      let count = comments.length
      comments.forEach(c => {
        if (c.replies) count += c.replies.length
      })
      return count
    },

    updateLocalPostCommentCount(): void {
      let allLocalPosts: Record<string, unknown>[] = uni.getStorageSync('local_all_posts') || []
      let postIndex = allLocalPosts.findIndex(p => String(p.id) === String(this.postId))
      if (postIndex !== -1) {
        allLocalPosts[postIndex].commentCount = this.calculateCommentCount(this.comments)
        uni.setStorageSync('local_all_posts', allLocalPosts)
      }
    },

    transformComments(apiComments: Record<string, unknown>[]): Comment[] {
      return apiComments.map(comment => ({
        id: comment.commentId as number | string,
        userId: String(comment.userId),
        userName: String(comment.username),
        userAvatar: String(comment.avatarUrl),
        content: String(comment.content),
        time: this.formatTime(String(comment.createdAt)),
        likes: comment.likeCount as number,
        isLiked: comment.isLiked as boolean,
        replies: comment.replies ? this.transformComments(comment.replies as Record<string, unknown>[]) : []
      }))
    },

    formatTime(timestamp: string): string {
      if (!timestamp) return ''
      const now = new Date().getTime()
      const time = new Date(timestamp).getTime()
      const diff = now - time
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      if (diff < minute) return this.texts.justNow
      if (diff < hour) return Math.floor(diff / minute) + this.texts.minutesAgo
      if (diff < day) return Math.floor(diff / hour) + this.texts.hoursAgo
      if (diff < 7 * day) return Math.floor(diff / day) + this.texts.daysAgo

      const date = new Date(timestamp)
      return `${date.getMonth() + 1}-${date.getDate()}`
    },

    async handleLikeClick(commentId: number | string): Promise<void> {
      this.updateCommentLikeLocal(commentId)
      try {
        const res = await toggleLike('COMMENT', String(commentId))
        if (res.code !== 0 && res.code !== 1) {
          this.updateCommentLikeLocal(commentId)
        }
      } catch (e: unknown) {
        console.error('点赞失败:', e)
        this.updateCommentLikeLocal(commentId)
      }
    },

    updateCommentLikeLocal(commentId: number | string): void {
      for (const comment of this.comments) {
        if (comment.id === commentId) {
          comment.isLiked = !comment.isLiked
          comment.likes += comment.isLiked ? 1 : -1
          this.saveLocalComments()
          return
        }
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.id === commentId) {
              reply.isLiked = !reply.isLiked
              reply.likes += reply.isLiked ? 1 : -1
              this.saveLocalComments()
              return
            }
          }
        }
      }
    },

    handleReplyClick(commentId: number | string, userName: string): void {
      this.replyTargetId = commentId
      this.replyTargetName = userName
      this.commentText = ''
      this.isPopupOpen = true
    },

    async handleDeleteClick(commentId: number | string): Promise<void> {
      uni.showModal({
        title: this.texts.deleteConfirm,
        content: this.texts.deleteContent,
        success: async (res: UniApp.ShowModalRes) => {
          if (res.confirm) {
            try {
              const result = await deleteComment(String(commentId))
              if (result.code === 0 || result.code === 1) {
                uni.showToast({ title: this.texts.deleteSuccess, icon: 'success' })
                this.loadComments()
              }
            } catch (e: unknown) {
              console.error('删除失败:', e)
              this.deleteCommentLocal(commentId)
              uni.showToast({ title: this.texts.deleteSuccess, icon: 'success' })
            }
          }
        }
      })
    },

    deleteCommentLocal(commentId: number | string): void {
      for (let i = 0; i < this.comments.length; i++) {
        if (this.comments[i].id === commentId) {
          this.comments.splice(i, 1)
          this.saveLocalComments()
          return
        }
        if (this.comments[i].replies && this.comments[i].replies!.length > 0) {
          for (let j = 0; j < this.comments[i].replies!.length; j++) {
            if (this.comments[i].replies![j].id === commentId) {
              this.comments[i].replies!.splice(j, 1)
              this.saveLocalComments()
              return
            }
          }
        }
      }
    },

    async handlePublish(): Promise<void> {
      if (!this.commentText.trim()) return

      const content = this.commentText.trim()
      const parentId = this.replyTargetId

      const newComment: Comment = {
        id: Date.now(),
        userId: this.currentUserId,
        userName: '我',
        userAvatar: '/static/images/Default avatar.png',
        content: content,
        time: this.texts.justNow || '刚刚',
        likes: 0,
        isLiked: false,
        replies: []
      }

      if (parentId) {
        for (const comment of this.comments) {
          if (comment.id === parentId) {
            if (!comment.replies) comment.replies = []
            comment.replies.push(newComment)
            break
          }
        }
      } else {
        this.comments.unshift(newComment)
      }

      this.totalComments++
      this.saveLocalComments()

      uni.showToast({ title: this.texts.publishSuccess, icon: 'success' })
      this.closeCommentPopup()

      try {
        const res = await createComment({
          postId: this.postId,
          content: content,
          parentCommentId: parentId
        })

        if (res.code === 0 || res.code === 1) {
          this.loadComments()
        }
      } catch (e: unknown) {
        console.error('发送评论失败:', e)
      }
    },

    handleKeyboardShow(e: unknown): void {
      this.keyboardHeight = (e as { detail: { height: number } }).detail?.height || 0
    },

    handleKeyboardHide(): void {
      this.keyboardHeight = 0
    },

    moveHandle(): void {
      return
    },

    handleUploadImage(): void {
      uni.chooseImage({
        count: 1,
        success: () => {
          uni.showToast({ title: this.texts.imageUploadInDev, icon: 'none' })
        }
      })
    },

    closeCommentPopup(): void {
      this.isPopupOpen = false
      this.replyTargetId = null
      this.replyTargetName = ''
      this.commentText = ''
      this.keyboardHeight = 0
    },

    handleBack(): void {
      uni.navigateBack()
    },

    handleInputTrigger(): void {
      this.replyTargetId = null
      this.replyTargetName = ''
      this.commentText = ''
      this.isPopupOpen = true
    },

    toggleSortMenu(): void {
      this.showSortMenu = !this.showSortMenu
    },

    selectSort(item: SortOption): void {
      this.sortType = item.value
      this.showSortMenu = false
      this.sortComments()
    },

    sortComments(): void {
      if (this.sortType === 'time') {
        this.comments.sort((a, b) => Number(b.id) - Number(a.id))
      } else if (this.sortType === 'likes') {
        this.comments.sort((a, b) => b.likes - a.likes)
      } else if (this.sortType === 'replies') {
        this.comments.sort((a, b) => {
          const aReplies = a.replies ? a.replies.length : 0
          const bReplies = b.replies ? b.replies.length : 0
          return bReplies - aReplies
        })
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff9f5;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
  background: #fff;
  position: relative;
}

.comment-count {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #f8f8f8;
  border-radius: 24rpx;
  position: relative;
}

.sort-text {
  font-size: 24rpx;
  color: #666;
}

.sort-menu {
  position: absolute;
  top: 100%;
  right: 32rpx;
  margin-top: 8rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.sort-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  min-width: 240rpx;
  transition: background-color 0.2s;
}

.sort-menu-item:active {
  background: #f8f8f8;
}

.sort-menu-item.active {
  background: rgba(255, 90, 0, 0.05);
}

.sort-menu-text {
  font-size: 26rpx;
  color: #333;
}

.sort-menu-item.active .sort-menu-text {
  color: #ff5a00;
  font-weight: 600;
}

.content-scroll {
  flex: 1;
  background: #fff;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 32rpx;
  padding-bottom: 120rpx;
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

.comment-header-info {
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

.bottom-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
}

.comment-input-trigger {
  height: 72rpx;
  padding: 0 24rpx;
  background: #fff9f5;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid rgba(255, 90, 0, 0.1);
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.comment-popup {
  background: #fff;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: bottom 0.3s;
}

.popup-body {
  position: relative;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
}

.popup-textarea {
  width: 100%;
  height: 240rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.char-count {
  position: absolute;
  bottom: 16rpx;
  right: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.popup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32rpx;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-icon {
  width: 48rpx;
  height: 48rpx;
}

.publish-btn {
  padding: 16rpx 48rpx;
  background: #f0f0f0;
  border-radius: 40rpx;
  transition: all 0.3s;
}

.publish-btn.active {
  background: #00c853;
}

.publish-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 600;
}

.publish-btn.active .publish-text {
  color: #fff;
}
</style>
