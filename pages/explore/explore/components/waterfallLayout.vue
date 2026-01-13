<template>
  <view class="waterfall-container">
    <view class="waterfall-box" :class="slideDirection" :key="currentTab + '-box'">
      <!-- 左列 -->
        <view class="waterfall-col">
            <view 
              class="model-card" 
              v-for="item in leftList" 
              :key="item.id" 
              @click="handleCardClick(item)"
            >
              <image 
                class="card-img" 
                :src="item.image" 
                mode="widthFix" 
                lazy-load
                @error="handleImageError"
              />
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
        </view>
        
        <!-- 右列 -->
        <view class="waterfall-col">
            <view 
              class="model-card" 
              v-for="item in rightList" 
              :key="item.id" 
              @click="handleCardClick(item)"
            >
              <image 
                class="card-img" 
                :src="item.image" 
                mode="widthFix" 
                lazy-load
                @error="handleImageError"
              />
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
        </view>
      </view>
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
      default: 'daily'
    },
    slideDirection: {
      type: String,
      default: 'right'
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  padding: 12rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.3;
  margin-bottom: 12rpx;
  display: block;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
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

.card-like.liked .uni-icons {
  color: #ff2d55 !important;
}



.like-count {
  font-size: 24rpx;
  color: #999999;
}
</style>