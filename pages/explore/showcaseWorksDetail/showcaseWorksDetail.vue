<template>
  <view class="page-container" :class="{ 'lock-scroll': isPopupOpen }">
    <safe-area />
    <custom-navbar :title="workTitle" @back="handleBack">
      <template #right>
        <view class="more-btn" @click="handleMore">
          <uni-icons type="more-filled" size="24" color="#333"></uni-icons>
        </view>
      </template>
    </custom-navbar>
    <scroll-view :scroll-y="!isPopupOpen" class="content-scroll" :fixed="isPopupOpen">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-header">
          <image class="user-avatar" :src="userAvatar" mode="aspectFill" />
          <view class="user-info">
            <text class="user-name">{{ userName }}</text>
            <view class="user-stats">
              <text class="stat-item">{{ postDetail.viewCount || 0 }} {{ texts.views }}</text>
              <text class="stat-divider">·</text>
              <text class="stat-item">{{ formatTime(postDetail.createdAt) }}</text>
            </view>
          </view>
          <view class="follow-btn" :class="{ 'followed': postDetail.isFollowing }" @click="handleFollow">
            <text class="follow-text">{{ postDetail.isFollowing ? texts.followed : texts.follow }}</text>
          </view>
        </view>
      </view>

      <!-- 作品内容 -->
      <view class="work-content">
        <!-- 标题 -->
        <view class="work-title-section">
          <text class="work-title">{{ postDetail.title || workTitle }}</text>
        </view>

        <!-- 图片轮播 -->
        <view class="image-gallery">
          <swiper class="swiper" :indicator-dots="imageUrls.length > 1" :autoplay="false" :circular="true">
            <swiper-item v-for="(img, index) in imageUrls" :key="index">
              <image class="gallery-image" :src="img" mode="aspectFill" @click="previewImages(index)" />
            </swiper-item>
          </swiper>
          <view class="image-count" v-if="imageUrls.length > 1">
            <text>{{ currentImageIndex + 1 }}/{{ imageUrls.length }}</text>
          </view>
        </view>

        <!-- 描述 -->
        <view class="description-section">
          <text class="description-text">{{ description }}</text>
        </view>

        <!-- 话题标签 -->
        <view class="topics-section" v-if="postDetail.topics && postDetail.topics.length > 0">
          <view class="topic-item" v-for="(topic, index) in postDetail.topics" :key="index">
            <text class="topic-hash">#</text>
            <text class="topic-text">{{ topic }}</text>
          </view>
        </view>

        <!-- 关联模型 -->
        <view class="model-link-section" v-if="postDetail.modelId && postDetail.modelName" @click="goToModel(postDetail.modelId)">
          <view class="model-link-card">
            <image class="model-preview" :src="modelImage || '/static/images/icon/3d_model.png'" mode="aspectFill" />
            <view class="model-info">
              <text class="model-name-text">{{ postDetail.modelName }}</text>
            </view>
            <text class="model-link-arrow">></text>
          </view>
        </view>

      </view>

      <!-- 评论区 -->
      <view class="comments-wrapper">
        <CommentSection
          :comments="comments"
          :totalCount="postDetail.commentCount"
          :currentUserId="currentUserId"
          :postAuthorId="postDetail.userId"
          @like-click="handleCommentLike"
          @reply-click="handleCommentReply"
          @delete-click="handleCommentDelete"
          @view-more="handleViewMoreComments"
        />
      </view>
    </scroll-view>

    <view v-if="isPopupOpen" class="popup-mask" @tap="closeCommentPopup" @touchmove.stop.prevent="moveHandle">
      <view class="comment-popup" :style="{ bottom: keyboardHeight + 'px' }" @tap.stop @touchmove.stop.prevent="moveHandle">
        <view class="popup-body">
          <textarea 
            class="popup-textarea"
            v-model="commentText"
            :placeholder="replyTargetName ? (texts.replyTo || '回复') + ' ' + replyTargetName + '...' : (texts.inputPlaceholder || '写点什么吧...')"
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
            <image class="footer-icon" src="/static/images/icon/image.png" mode="aspectFit" @click="handleUploadImage" />
          </view>
          <view class="publish-btn" :class="{ 'active': commentText.trim() }" @click="handlePublish">
            <text class="publish-text">{{ texts.publish || '发布' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部输入栏 -->
    <view class="bottom-input-bar">
      <view class="comment-input-trigger" @click="handleInputTrigger">
        <text class="placeholder-text">{{ texts.sayPlaceholder }}</text>
      </view>
      <view class="input-actions">
        <view class="action-btn" @click="handlePostLike">
          <image class="action-btn-icon" :src="postDetail.isLiked ? '/static/images/icon/like_active.png' : '/static/images/icon/like.png'" mode="aspectFit" />
          <text class="action-btn-text" :class="{ 'active-like': postDetail.isLiked }">{{ postDetail.likeCount || 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import CommentSection from './components/CommentSection.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { 
  getPostDetail, 
  getPostComments, 
  toggleLike, 
  toggleFollow, 
  createComment,
  deleteComment,
  deletePost,
  checkLikeStatus,
  checkFollowStatus
} from '@/api/community'
import { getModelDetail } from '@/api/models'

export default {
  components: {
    CustomNavbar,
    CommentSection
  },
  data() {
    return {
      postId: '',
      workTitle: '作品详情',
      userName: '',
      userAvatar: '',
      modelImage: '',
      description: '',
      comments: [],
      currentImageIndex: 0,
      loading: false,
      postDetail: {
        postId: 0,
        userId: '',
        username: '',
        avatarUrl: '',
        title: '',
        content: '',
        modelId: '',
        modelName: '',
        imageUrls: [],
        topics: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        viewCount: 0,
        isLiked: false,
        isFollowing: false,
        createdAt: '',
        updatedAt: ''
      },
      commentText: '',
      replyTargetId: null,
      replyTargetName: '',
      isPopupOpen: false,
      keyboardHeight: 0,
      currentUserId: ''
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    },
    imageUrls() {
      if (!this.postDetail.imageUrls || this.postDetail.imageUrls.length === 0) {
        return []
      }
      // 修复图片URL，将localhost替换为实际域名
      return this.postDetail.imageUrls.map(url => {
        if (!url) return '/static/images/logo.png'
        if (url.includes('localhost:9000')) {
          return url.replace('localhost:9000', '47.102.212.37:9000')
        }
        return url
      })
    }
  },
  onLoad(options) {
    this.postId = options.postId || options.workId || options.id || ''
    this.workTitle = options.title ? decodeURIComponent(options.title) : '作品详情'
    this.modelImage = options.image ? decodeURIComponent(options.image) : ''
    
    this.languageStore.loadLanguage()
    this.getCurrentUserId()
    
    if (this.postId) {
      this.loadPostDetail()
      this.loadComments()
    } else {
      uni.showToast({
        title: this.texts.operationFailed || '参数错误',
        icon: 'none'
      })
      setTimeout(() => uni.navigateBack(), 1500)
    }
    
    if (uni.onKeyboardHeightChange) {
      uni.onKeyboardHeightChange(res => {
        this.keyboardHeight = res.height
      })
    }
  },
  onShow() {
    // 页面显示时重新加载帖子详情，确保点赞状态最新
    if (this.postId) {
      this.loadPostDetail()
    }
  },
  methods: {
    async loadModelPreview(modelId) {
      try {
        const res = await getModelDetail(modelId)
        if (res.code === 1 && res.data && res.data.previewUrl) {
          let previewUrl = res.data.previewUrl
          if (previewUrl.includes('localhost:9000')) {
            previewUrl = previewUrl.replace('localhost:9000', '47.102.212.37:9000')
          }
          this.modelImage = previewUrl
        }
      } catch (e) {
        console.error('加载模型预览图失败:', e)
      }
    },
    goToModel(modelId) {
      if (!modelId) return
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${modelId}`
      })
    },

    getCurrentUserId() {
      const userInfo = uni.getStorageSync('userInfo')
      this.currentUserId = userInfo?.userId || ''
    },

    async loadPostDetail() {
      this.loading = true
      
      try {
        const res = await getPostDetail(String(this.postId))

        if (res.code === 0 || res.code === 1) {
          const postData = res.data
          // 统一点赞字段
          postData.isLiked = postData.isLiked || postData.liked || false
          postData.likeCount = postData.likeCount || postData.likes || 0
          // 过滤imageUrls中的无效路径（blob和file://）
          if (postData.imageUrls && Array.isArray(postData.imageUrls)) {
            const validImageUrls = postData.imageUrls.filter(imgUrl => 
              imgUrl && !(imgUrl.startsWith('blob:') || imgUrl.startsWith('file://'))
            );
            postData.imageUrls = validImageUrls.length > 0 ? validImageUrls : postData.imageUrls;
          } else {
            postData.imageUrls = [];
          }
          // 过滤用户头像中的无效路径
          if (postData.avatarUrl && (postData.avatarUrl.startsWith('blob:') || postData.avatarUrl.startsWith('file://'))) {
            postData.avatarUrl = '/static/images/Default avatar.png';
          }
          
          // 处理话题数据，确保是数组格式
          let topicsData = postData.topics || postData.tags || []

          // 如果后端返回 null 或空，尝试从正文中解析 #话题#
          if ((!topicsData || (Array.isArray(topicsData) && topicsData.length === 0)) && postData.content) {
            const contentTopics = postData.content.match(/#([^#\s]+)#/g)
            if (contentTopics) {
              topicsData = contentTopics.map(t => t.replace(/#/g, ''))
            }
          }

          if (topicsData) {
            if (typeof topicsData === 'string') {
              try {
                // 尝试解析 JSON 数组
                const parsed = JSON.parse(topicsData)
                topicsData = Array.isArray(parsed) ? parsed : [topicsData]
              } catch (e) {
                // 如果不是 JSON，尝试按逗号或空格分割
                topicsData = topicsData.split(/[,\\s，\n]+/).filter(t => t.trim())
              }
            } else if (!Array.isArray(topicsData)) {
              topicsData = [String(topicsData)]
            }
          } else {
            topicsData = []
          }
          // 移除重复并清理
          postData.topics = [...new Set(topicsData.map(t => String(t).trim()))].filter(t => t)
          
          this.postDetail = postData
          this.userName = this.postDetail.username
          this.userAvatar = this.postDetail.avatarUrl
          // 过滤掉正文中的 #话题# 文本，避免重复显示
          this.description = (this.postDetail.content || '').replace(/#[^#\s]+#/g, '').trim()
          this.workTitle = this.postDetail.title || '作品详情'
          
          // 获取模型预览图
          if (this.postDetail.modelId) {
            this.loadModelPreview(this.postDetail.modelId)
          } else if (this.postDetail.imageUrls && this.postDetail.imageUrls.length > 0) {
            this.modelImage = this.postDetail.imageUrls[0]
          } else {
            this.modelImage = '/static/images/3Dprinter.png'
          }
          
          this.checkUserInteractions()
        } else {
          uni.showToast({
            title: this.texts.postNotFound || '帖子不存在',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('加载帖子详情失败:', e)
        uni.showToast({
          title: this.texts.loadFailed || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async checkUserInteractions() {
      if (!this.postId || String(this.postId) === 'NaN' || String(this.postId) === 'undefined') return

      try {
        // 后端 getPostDetail 返回的 isLiked 不正确，需要调用 checkLikeStatus 获取真实状态
        try {
          const likeRes = await checkLikeStatus('POST', this.postId)
          if (likeRes.code === 0 || likeRes.code === 1) {
            this.postDetail.isLiked = likeRes.data
          }
        } catch (e) {
          console.error('检查点赞状态失败:', e)
        }

        // 只在需要时才调用关注状态检查（如果后端没有返回）
        if (this.postDetail.isFollowing === undefined && this.postDetail.userId && this.postDetail.userId !== 'local_user') {
          try {
            const followRes = await checkFollowStatus(this.postDetail.userId)
            if (followRes.code === 0 || followRes.code === 1) {
              this.postDetail.isFollowing = followRes.data
            }
          } catch (e) {
            console.error('检查关注状态失败:', e)
          }
        }
      } catch (e) {
        console.error('检查用户交互状态失败:', e)
      }
    },

    async loadComments() {
      try {
        const res = await getPostComments(this.postId)
        
        if ((res.code === 0 || res.code === 1) && res.data && res.data.length > 0) {
          this.comments = this.transformComments(res.data)
        } else {
          // 尝试加载本地存储的评论
          this.loadLocalComments()
        }
      } catch (e) {
        console.error('加载评论失败:', e)
        // 尝试加载本地存储的评论
        this.loadLocalComments()
      }
    },

    saveLocalComments() {
      if (this.postId) {
        const key = `comments_${this.postId}`
        uni.setStorageSync(key, this.comments)
        // 同时更新详情中的评论数
        this.updateLocalPostCommentCount()
      }
    },

    loadLocalComments() {
      if (this.postId) {
        const key = `comments_${this.postId}`
        const localComments = uni.getStorageSync(key)
        if (localComments && localComments.length > 0) {
          this.comments = localComments
          this.postDetail.commentCount = this.calculateCommentCount(localComments)
          return true
        }
      }
      return false
    },

    calculateCommentCount(comments) {
      let count = comments.length
      comments.forEach(c => {
        if (c.replies) count += c.replies.length
      })
      return count
    },

    updateLocalPostCommentCount() {
      if (String(this.postId).startsWith('mock_')) {
        let allLocalPosts = uni.getStorageSync('local_all_posts') || []
        let postIndex = allLocalPosts.findIndex(p => String(p.id) === String(this.postId))
        if (postIndex !== -1) {
          allLocalPosts[postIndex].commentCount = this.postDetail.commentCount
          uni.setStorageSync('local_all_posts', allLocalPosts)
        }
      }
    },

    updateLocalPostLike() {
      if (String(this.postId).startsWith('mock_')) {
        let allLocalPosts = uni.getStorageSync('local_all_posts') || []
        let postIndex = allLocalPosts.findIndex(p => String(p.id) === String(this.postId))
        if (postIndex !== -1) {
          allLocalPosts[postIndex].isLiked = this.postDetail.isLiked
          allLocalPosts[postIndex].likes = this.postDetail.likeCount
          uni.setStorageSync('local_all_posts', allLocalPosts)
        }
      }
    },

    transformComments(apiComments) {
      return apiComments.map(comment => ({
        id: comment.commentId,
        postId: comment.postId,
        userId: comment.userId,
        userName: comment.username,
        userAvatar: comment.avatarUrl,
        content: comment.content,
        time: this.formatTime(comment.createdAt),
        likes: comment.likeCount,
        isLiked: comment.isLiked,
        replyCount: comment.replyCount,
        parentCommentId: comment.parentCommentId,
        replies: comment.replies ? this.transformComments(comment.replies) : []
      }))
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const now = new Date().getTime()
      const time = new Date(timestamp).getTime()
      const diff = now - time
      
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour
      
      if (diff < minute) {
        return this.texts.justNow
      } else if (diff < hour) {
        return Math.floor(diff / minute) + this.texts.minutesAgo
      } else if (diff < day) {
        return Math.floor(diff / hour) + this.texts.hoursAgo
      } else if (diff < 7 * day) {
        return Math.floor(diff / day) + this.texts.daysAgo
      } else {
        const date = new Date(timestamp)
        return `${date.getMonth() + 1}-${date.getDate()}`
      }
    },

    async handlePostLike() {
      this.postDetail.isLiked = !this.postDetail.isLiked
      this.postDetail.likeCount += this.postDetail.isLiked ? 1 : -1

      const isMock = !this.postId || String(this.postId).includes('mock') || String(this.postId) === '1' || String(this.postId) === 'NaN' || String(this.postId) === 'undefined'

      if (!isMock) {
        try {
          const res = await toggleLike('POST', this.postId)
          if (res.code === 0 || res.code === 1) {
            // toggleLike 接口返回的 data 有问题，调用 checkLikeStatus 获取真实状态
            const checkRes = await checkLikeStatus('POST', this.postId)
            if (checkRes.code === 0 || checkRes.code === 1) {
              this.postDetail.isLiked = checkRes.data
            }
          }
        } catch (e) {
          console.error('点赞失败:', e)
        }
      } else {
        // 如果是本地 mock ID，更新本地存储
        if (this.postId && (String(this.postId).startsWith('mock_') || String(this.postId) === '1')) {
          this.updateLocalPostLike()
        }
      }
    },

    async handleFollow() {
      // 防止关注自己
      if (this.postDetail.userId && this.currentUserId && String(this.postDetail.userId) === String(this.currentUserId)) {
        uni.showToast({
          title: this.texts.cannotFollowSelf || '不能关注自己',
          icon: 'none'
        })
        return
      }
      
      // 本地立即更新UI
      const isFollowingBefore = this.postDetail.isFollowing
      this.postDetail.isFollowing = !this.postDetail.isFollowing
      
      // 发送事件通知，让其他页面更新关注统计
      uni.$emit('followStatusChanged', {
        userId: this.postDetail.userId,
        isFollowing: this.postDetail.isFollowing
      })
      
      uni.showToast({
        title: this.postDetail.isFollowing ? (this.texts.followSuccess || '关注成功') : (this.texts.unfollowSuccess || '取消关注'),
        icon: 'success'
      })
      
      // 如果不是 mock 用户，调用接口
      if (this.postDetail.userId && 
          !String(this.postDetail.userId).includes('user') && 
          this.postDetail.userId !== 'local_user' && 
          String(this.postDetail.userId) !== '1') {
        try {
          const res = await toggleFollow(this.postDetail.userId)
          
          if (res.code === 0) {
            const isFollowing = res.data
            this.postDetail.isFollowing = isFollowing
            // 发送事件通知，让其他页面更新关注统计
            uni.$emit('followStatusChanged', {
              userId: this.postDetail.userId,
              isFollowing: isFollowing
            })
          } else {
            // 接口返回失败，回滚UI
            this.postDetail.isFollowing = isFollowingBefore
          }
        } catch (e) {
          console.error('关注失败:', e)
          // 接口调用失败，回滚UI
          this.postDetail.isFollowing = isFollowingBefore
        }
      }
    },

    async handleCommentLike(commentId) {
      // 本地更新
      this.updateCommentLikeLocal(commentId)
      
      // 如果不是 mock ID，调用接口
      const isMock = !this.postId || String(this.postId).includes('mock') || String(this.postId) === '1' || String(this.postId) === 'NaN' || String(this.postId) === 'undefined'
      if (!isMock) {
        try {
          const res = await toggleLike('COMMENT', commentId)
          
          if (res.code === 0) {
            this.loadComments()
          }
        } catch (e) {
          console.error('评论点赞失败:', e)
        }
      }
    },

    updateCommentLikeLocal(commentId) {
      for (const comment of this.comments) {
        if (comment.id === commentId) {
          comment.isLiked = !comment.isLiked
          comment.likes += comment.isLiked ? 1 : -1
          if (String(this.postId).includes('mock') || String(this.postId) === '1') {
            this.saveLocalComments()
          }
          break
        }
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            if (reply.id === commentId) {
              reply.isLiked = !reply.isLiked
              reply.likes += reply.isLiked ? 1 : -1
              if (String(this.postId).includes('mock') || String(this.postId) === '1') {
                this.saveLocalComments()
              }
              return
            }
          }
        }
      }
    },

    handleCommentReply(data) {
      const { commentId, userName } = data
      this.replyTargetId = commentId
      this.replyTargetName = userName
      this.commentText = ''
      this.isPopupOpen = true
    },

    handleKeyboardShow(e) {
      this.keyboardHeight = e.detail?.height || 0
    },

    handleKeyboardHide() {
      this.keyboardHeight = 0
    },

    closeCommentPopup() {
      this.isPopupOpen = false
      this.replyTargetId = null
      this.replyTargetName = ''
      this.commentText = ''
      this.keyboardHeight = 0
    },

    moveHandle() {
      // 禁止穿透
      return
    },

    handleUploadImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showToast({ title: this.texts.imageUploadInDev || '图片上传功能开发中', icon: 'none' })
        }
      })
    },

    async handlePublish() {
      if (!this.commentText.trim()) return

      const content = this.commentText.trim()
      const parentId = this.replyTargetId

      // 本地立即添加评论/回复 (乐观更新)
      if (parentId) {
        this.handleReplySubmit({ commentId: parentId, content })
      } else {
        // 添加主评论
        const newComment = {
          id: Date.now(),
          userId: this.currentUserId,
          userName: this.texts.me || '我',
          userAvatar: '/static/images/Default avatar.png',
          content: content,
          time: this.texts.justNow || '刚刚',
          likes: 0,
          isLiked: false,
          replies: []
        }
        this.comments.unshift(newComment)
        this.postDetail.commentCount++
        
        // 如果是 mock post，保存到本地存储
        if (!this.postId || String(this.postId).includes('mock') || String(this.postId) === '1') {
          this.saveLocalComments()
        }
      }

      this.closeCommentPopup()

      // 如果有真实的postId，调用接口
      if (this.postId && !String(this.postId).includes('mock') && String(this.postId) !== '1') {
        try {
          const res = await createComment({
            postId: this.postId,
            content: content,
            parentCommentId: parentId
          })
          
          if (res.code === 0) {
            this.loadComments()
          }
        } catch (e) {
          console.error('发布评论失败:', e)
          uni.showToast({ title: this.texts.publishFailed || '发布失败', icon: 'none' })
        }
      } else {
        uni.showToast({ title: this.texts.publishSuccess || '发布成功', icon: 'success' })
      }
    },

    async handleReplySubmit(data) {
      // 本地添加回复 (递归查找父评论)
      let parentComment = null
      for (const c of this.comments) {
        if (c.id === data.commentId) {
          parentComment = c
          break
        }
        if (c.replies && c.replies.length > 0) {
          const found = c.replies.find(r => r.id === data.commentId)
          if (found) {
            parentComment = c // 统一添加到主评论的回复列表中
            break
          }
        }
      }

      if (parentComment) {
        const newReply = {
          id: Date.now(),
          userId: this.currentUserId,
          userName: this.texts.me || '我',
          userAvatar: this.userAvatar || '/static/images/Default avatar.png',
          content: data.content,
          time: this.texts.justNow || '刚刚',
          likes: 0,
          isLiked: false
        }
        if (!parentComment.replies) {
          parentComment.replies = []
        }
        parentComment.replies.push(newReply)
        this.postDetail.commentCount++
        
        // 如果是 mock post，保存到本地存储
        if (!this.postId || String(this.postId).includes('mock') || String(this.postId) === '1') {
          this.saveLocalComments()
        }
        
        uni.showToast({ title: this.texts.replySuccess || '回复成功', icon: 'success' })
      }

      // 如果有真实的postId，调用接口
      if (this.postId && !String(this.postId).includes('mock') && String(this.postId) !== '1') {
        try {
          const res = await createComment({
            postId: this.postId,
            content: data.content,
            parentCommentId: data.commentId
          })
          
          if (res.code === 0) {
            this.loadComments()
          }
        } catch (e) {
          console.error('回复失败:', e)
        }
      }
    },

    async handleCommentDelete(commentId) {
      uni.showModal({
        title: this.texts.confirmDelete || '确认删除',
        content: this.texts.confirmDeleteComment || '确定要删除这条评论吗？',
        success: async (res) => {
          if (res.confirm) {
            const isMock = !this.postId || String(this.postId).includes('mock') || String(this.postId) === '1' || String(this.postId) === 'NaN' || String(this.postId) === 'undefined'
            if (!isMock) {
              try {
                const result = await deleteComment(commentId)
                if (result.code === 0) {
                  uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
                  this.loadComments()
                  this.postDetail.commentCount--
                }
              } catch (e) {
                console.error('删除评论失败:', e)
                uni.showToast({ title: this.texts.deleteFailed || '删除失败', icon: 'none' })
              }
            } else {
              this.deleteCommentLocal(commentId)
              uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
            }
          }
        }
      })
    },

    deleteCommentLocal(commentId) {
      for (let i = 0; i < this.comments.length; i++) {
        if (this.comments[i].id === commentId) {
          this.comments.splice(i, 1)
          this.postDetail.commentCount--
          if (String(this.postId).includes('mock') || String(this.postId) === '1') {
            this.saveLocalComments()
          }
          return
        }
        if (this.comments[i].replies && this.comments[i].replies.length > 0) {
          for (let j = 0; j < this.comments[i].replies.length; j++) {
            if (this.comments[i].replies[j].id === commentId) {
              this.comments[i].replies.splice(j, 1)
              this.postDetail.commentCount--
              if (String(this.postId).includes('mock') || String(this.postId) === '1') {
                this.saveLocalComments()
              }
              return
            }
          }
        }
      }
    },

    previewImages(index) {
      this.currentImageIndex = index
      uni.previewImage({
        urls: this.imageUrls,
        current: index
      })
    },

    handleInputTrigger() {
      this.replyTargetId = null
      this.replyTargetName = ''
      this.commentText = ''
      this.isPopupOpen = true
    },

    handleBack() {
      uni.navigateBack()
    },

    handleMore() {
      const isAuthor = String(this.postDetail.userId) === String(this.currentUserId) ||
                       String(this.postDetail.userId) === 'local_user'

      if (!isAuthor) {
        uni.showToast({ title: this.texts.noPermission || '无操作权限', icon: 'none' })
        return
      }

      uni.showActionSheet({
        itemList: [this.texts.delete || '删除'],
        success: (res) => {
          this.handleDeletePost()
        }
      })
    },

    async handleDeletePost() {
      uni.showModal({
        title: this.texts.tip || '提示',
        content: this.texts.confirmDeletePost || '确定要删除这篇作品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const isMock = !this.postId || String(this.postId).includes('mock') || String(this.postId) === '1' || String(this.postId) === 'NaN' || String(this.postId) === 'undefined'
              if (!isMock) {
                const result = await deletePost(this.postId)
                if (result.code === 0 || result.code === 1) {
                  uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
                  // 发送事件通知列表页刷新
                  uni.$emit('postDeleted', this.postId)
                  setTimeout(() => {
                    uni.navigateBack()
                  }, 1500)
                } else {
                  uni.showToast({ title: result.msg || this.texts.deleteFailed || '删除失败', icon: 'none' })
                }
              } else {
                // 处理本地 mock 数据的删除
                this.deleteLocalPost()
                uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              }
            } catch (e) {
              console.error('删除帖子失败:', e)
              uni.showToast({ title: this.texts.deleteFailed || '删除失败', icon: 'none' })
            }
          }
        }
      })
    },

    deleteLocalPost() {
      if (!this.postId) return
      
      // 1. 从详情页本地缓存中删除 (如果存了的话)
      uni.removeStorageSync(`post_detail_${this.postId}`)
      
      // 2. 从作品列表中删除 (针对特定的 modelId)
      const modelId = this.postDetail && this.postDetail.modelId
      if (modelId) {
        let localPosts = uni.getStorageSync(`local_posts_${modelId}`) || []
        localPosts = localPosts.filter(p => String(p.id) !== String(this.postId))
        uni.setStorageSync(`local_posts_${modelId}`, localPosts)
      }
      
      // 3. 从总列表中删除
      let allLocalPosts = uni.getStorageSync('local_all_posts') || []
      allLocalPosts = allLocalPosts.filter(p => String(p.id) !== String(this.postId))
      uni.setStorageSync('local_all_posts', allLocalPosts)

      // 4. 如果是 newlyCreatedPost，也移除
      const newlyCreated = uni.getStorageSync('newlyCreatedPost')
      if (newlyCreated && String(newlyCreated.id) === String(this.postId)) {
        uni.removeStorageSync('newlyCreatedPost')
      }
      
      // 5. 清除对应的评论
      uni.removeStorageSync(`comments_${this.postId}`)
      
      // 6. 发送删除事件
      uni.$emit('postDeleted', this.postId)
    },

    handleViewMoreComments() {
      uni.navigateTo({
        url: `/pages/explore/commentList/commentList?postId=${this.postId}&postAuthorId=${this.postDetail.userId}`
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FFF9F5;
  overflow: hidden;
  position: relative;
}

.page-container.lock-scroll {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}

.content-scroll {
  flex: 1;
  height: 0;
  padding-bottom: 120rpx;
}

/* 用户卡片 */
.user-card {
  background: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: 600;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  font-size: 24rpx;
  color: #ddd;
}

.follow-btn {
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
  box-shadow: 0 4rpx 12rpx rgba(255, 90, 0, 0.3);
  transition: all 0.3s;
}

.follow-btn.followed {
  background: #f0f0f0;
  box-shadow: none;
}

.follow-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.follow-btn.followed .follow-text {
  color: #666;
}

/* 作品内容 */
.work-content {
  background: #fff;
  margin-bottom: 16rpx;
}

.work-title-section {
  padding: 24rpx 32rpx 16rpx;
}

.work-title {
  font-size: 36rpx;
  color: #1a1a1a;
  font-weight: 700;
  line-height: 1.4;
  display: block;
}

/* 图片轮播 */
.image-gallery {
  position: relative;
  width: 100%;
  height: 750rpx;
  background: #000;
  margin-top: 8rpx;
}

.swiper {
  width: 100%;
  height: 100%;
}

.gallery-image {
  width: 100%;
  height: 100%;
}

.image-count {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  padding: 8rpx 20rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30rpx;
  backdrop-filter: blur(10rpx);
}

.image-count text {
  font-size: 24rpx;
  color: #fff;
}

/* 描述 */
.description-section {
  padding: 24rpx 32rpx;
}

.description-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 话题标签 */
.topics-section {
  padding: 16rpx 32rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: #f0f7ff;
  border-radius: 30rpx;
}

.topic-hash {
  font-size: 24rpx;
  color: #007aff;
  margin-right: 4rpx;
  font-weight: bold;
}

.topic-text {
  font-size: 24rpx;
  color: #007aff;
}

/* 关联模型 */
.model-link-section {
  padding: 24rpx 32rpx;
}

.model-link-card {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  gap: 16rpx;
}

.model-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f0f0f0;
}

.model-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.model-name-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-link-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 评论区 */
.comments-wrapper {
  background: #fff;
  padding: 24rpx 32rpx 32rpx;
  margin-bottom: 2rpx;
}

.comments-header {
  margin-bottom: 24rpx;
}

.comments-title {
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: 700;
}

/* 弹窗遮罩 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 评论弹出框样式 */
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

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
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
  background: #00C853;
}

.publish-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 600;
}

.publish-btn.active .publish-text {
  color: #fff;
}

/* 底部输入栏 */
.bottom-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
}

.comment-input-trigger {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: #FFF9F5;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid rgba(255, 90, 0, 0.1);
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  transition: all 0.3s;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn-icon {
  width: 44rpx;
  height: 44rpx;
}

.action-btn-text {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

.action-btn-text.active-like {
  color: #FF69B4;
  font-weight: 600;
}

.action-btn-text.active-collect {
  color: #FFD700;
  font-weight: 600;
}
</style>

