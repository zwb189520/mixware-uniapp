<template>
  <view class="waterfall-container">
    <transition name="fade-slide" mode="out-in">
      <view class="waterfall-box" :key="currentTab + '-box'">
        <!-- 左列 -->
        <view class="waterfall-col">
          <transition-group name="card-fade">
            <view 
              class="model-card" 
              v-for="item in leftList" 
              :key="item.id" 
              @click="handleCardClick(item)"
            >
              <image class="card-img" :src="item.image" mode="widthFix" @error="handleImageError"/>
              <view class="card-info">
                <text class="card-desc">{{ item.desc }}</text>
                <view class="card-footer">
                  <view class="card-author" @click.stop="handleAuthorClick(item)">
                    <image class="author-avatar" :src="item.authorAvatar" @error="handleAvatarError"/>
                    <text class="author-name">{{ item.author }}</text>
                  </view>
                  <view class="card-like" :class="{ 'liked': item.isLiked }" @click.stop="handleLikeClick(item)">
                    <text class="like-icon">{{ item.isLiked ? '❤️' : '🤍' }}</text>
                    <text class="like-count">{{ item.likes }}</text>
                  </view>
                </view>
              </view>
            </view>
          </transition-group>
        </view>
        
        <!-- 右列 -->
        <view class="waterfall-col">
          <transition-group name="card-fade">
            <view 
              class="model-card" 
              v-for="item in rightList" 
              :key="item.id" 
              @click="handleCardClick(item)"
            >
              <image class="card-img" :src="item.image" mode="widthFix" @error="handleImageError"/>
              <view class="card-info">
                <text class="card-desc">{{ item.desc }}</text>
                <view class="card-footer">
                  <view class="card-author" @click.stop="handleAuthorClick(item)">
                    <image class="author-avatar" :src="item.authorAvatar" @error="handleAvatarError"/>
                    <text class="author-name">{{ item.author }}</text>
                  </view>
                  <view class="card-like" :class="{ 'liked': item.isLiked }" @click.stop="handleLikeClick(item)">
                    <uni-icons :type="item.isLiked ? 'heart-filled' : 'heart'" size="20"></uni-icons>
                    <text class="like-count">{{ item.likes }}</text>
                  </view>
                </view>
              </view>
            </view>
          </transition-group>
        </view>
      </view>
    </transition>
  </view>
</template>

<script>
export default {
  name: 'WaterfallLayout',
  props: {
    leftList: {
      type: Array,
      default: () => []
    },
    rightList: {
      type: Array,
      default: () => []
    },
    currentTab: {
      type: String,
      required: true
    }
  },
  methods: {
    handleCardClick(item) {
      this.$emit('card-click', item)
    },
    handleLikeClick(item) {
      this.$emit('like-click', item)
    },
    handleAuthorClick(item) {
      this.$emit('author-click', item)
    },
    handleImageError(e) {
      console.warn('模型图片加载失败:', e.detail.errMsg)
    },
    handleAvatarError(e) {
      e.target.src = '/static/images/logo.png'
    }
  }
}
</script>

<style scoped>
.waterfall-container {
  width: 100%;
}

.waterfall-box {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
}

.waterfall-col {
  flex: 1;
  min-height: 100rpx;
}

.model-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.model-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.card-img {
  width: 100%;
  height: auto;
  border-radius: 16rpx 16rpx 0 0;
}

.card-info {
  padding: 20rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-author {
  display: flex;
  align-items: center;
  flex: 1;
}

.author-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.author-name {
  font-size: 24rpx;
  color: #999999;
}

.card-like {
  display: flex;
  align-items: center;
}

/* 已点赞状态 */
.card-like.liked {
  color: #ff2d55;
}

.card-like.liked .uni-icons,
.card-like.liked .uni-icons .uni-icons {
  color: #ff2d55 !important;
}



.like-count {
  font-size: 24rpx;
  color: #999999;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20rpx);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20rpx);
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}

.card-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.card-fade-move {
  transition: transform 0.3s ease;
}
</style>