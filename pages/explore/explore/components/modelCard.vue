<template>
  <view class="model-card" @click="handleCardClick">
    <image 
      class="card-img" 
      :src="model.image" 
      mode="aspectFill" 
      lazy-load="true"
      @error="handleImageError"
      :style="{ height: Math.random() > 0.5 ? '200px' : '250px' }"
    />
    <view class="card-info">
      <text class="card-desc">{{ model.desc }}</text>
      <view class="card-footer">
        <view class="card-author" @click.stop="handleAuthorClick">
          <image 
            class="author-avatar" 
            :src="model.authorAvatar" 
            @error="handleAvatarError"
            mode="aspectFill"
          />
          <text class="author-name">{{ model.author }}</text>
        </view>
        <view class="card-like" :class="{ 'liked': model.isLiked }" @click.stop="handleLikeClick">
          <text class="like-icon">{{ model.isLiked ? '❤️' : '🤍' }}</text>
          <text class="like-count">{{ model.likes }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModelCard',
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleCardClick() {
      this.$emit('card-click', this.model)
    },
    handleLikeClick() {
      this.$emit('like-click', this.model)
    },
    handleAuthorClick() {
      this.$emit('author-click', this.model)
    },
    handleImageError(e) {
      // 移动端图片加载失败时显示默认图片
      this.model.image = '/static/images/logo.png'
      this.$emit('image-error', e)
    },
    handleAvatarError(e) {
      // 移动端头像加载失败时显示默认头像
      this.model.authorAvatar = '/static/images/user-avatar.png'
      this.$emit('avatar-error', e)
    }
  }
}
</script>

<style scoped>
.model-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.card-img {
  width: 100%;
  display: block;
  border-radius: 16rpx 16rpx 0 0;
}
.card-info {
  padding: 24rpx;
}
.card-desc {
  font-size: 26rpx;
  color: #666;
  margin: 0 0 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}
.card-author {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}
.author-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  flex-shrink: 0;
}
.author-name {
  font-size: 24rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-like {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
}

.like-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.like-count {
  font-size: 22rpx;
}

/* 已点赞状态 */
.card-like.liked {
  color: #ff2d55;
}

/* 移动端适配 */
@media (max-width: 750rpx) {
  .card-desc {
    font-size: 24rpx;
  }
  .author-name {
    font-size: 22rpx;
  }
  .like-count {
    font-size: 20rpx;
  }
}

</style>