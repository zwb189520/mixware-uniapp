<template>
  <view class="model-card" @click="handleCardClick">
    <image class="card-img" :src="model.image" mode="widthFix" @error="handleImageError"/>
    <view class="card-info">
      <text class="card-title">{{ model.name }}</text>
      <text class="card-desc">{{ model.desc }}</text>
      <view class="card-footer">
        <view class="card-author" @click.stop="handleAuthorClick">
          <image class="author-avatar" :src="model.authorAvatar" @error="handleAvatarError"/>
          <text class="author-name">{{ model.author }}</text>
        </view>
        <view class="card-like" :class="{ 'liked': model.isLiked }" @click.stop="handleLikeClick">
          <uni-icons :type="model.isLiked ? 'heart-filled' : 'heart'" size="20"></uni-icons>
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
      this.$emit('image-error', e)
    },
    handleAvatarError(e) {
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
}
.card-img {
  width: 100%;
  display: block;
}
.card-info {
  padding: 24rpx;
}
.card-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}
.card-desc {
  font-size: 26rpx;
  color: #666;
  margin: 8rpx 0 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-author {
  display: flex;
  align-items: center;
}
.author-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
.author-name {
  font-size: 24rpx;
  color: #666;
}
.card-like {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}

/* 已点赞状态 */
.card-like.liked {
  color: #ff2d55;
}

.card-like.liked .uni-icons,
.card-like.liked .uni-icons .uni-icons {
  color: #ff2d55 !important;
}

</style>