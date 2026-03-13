<template>
  <view class="waterfall-container">
    <view class="waterfall-box" :class="slideDirection" :key="currentTab + '-box'">
      <!-- 左列 -->
      <view class="waterfall-col">
        <view 
          class="model-card" 
          v-for="item in leftList" 
          :key="item.id || item.image" 
          @click="handleCardClick(item)"
        >
          <image 
            class="card-img" 
            :src="fixBlobUrl(item.image)" 
            mode="widthFix" 
            lazy-load
            @error="handleImageError(item)"
          />
          <view class="card-info">
            <text class="card-desc">{{ item.desc || item.info || item.title }}</text>
            <view class="card-footer">
              <view class="card-author" @click.stop="handleAuthorClick(item)">
                <image class="author-avatar" :src="fixBlobUrl(item.authorAvatar || item.userAvatar) || '/static/images/Default avatar.png'" @error="handleAvatarError(item)"/>
                <text class="author-name">{{ item.author || item.userName || '' }}</text>
              </view>
              <view class="card-like" :class="{ 'liked': item.isLiked }" @click.stop="handleLikeClick(item)">
                <image class="like-icon" :src="item.isLiked ? '/static/images/icon/like_active.png' : '/static/images/icon/like.png'" mode="aspectFit"/>
                <text class="like-count">{{ item.likes || 0 }}</text>
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
          :key="item.id || item.image" 
          @click="handleCardClick(item)"
        >
          <image 
            class="card-img" 
            :src="fixBlobUrl(item.image)" 
            mode="widthFix" 
            lazy-load
            @error="handleImageError(item)"
          />
          <view class="card-info">
            <text class="card-desc">{{ item.desc || item.info || item.title }}</text>
            <view class="card-footer">
              <view class="card-author" @click.stop="handleAuthorClick(item)">
                <image class="author-avatar" :src="fixBlobUrl(item.authorAvatar || item.userAvatar) || '/static/images/Default avatar.png'" @error="handleAvatarError(item)"/>
                <text class="author-name">{{ item.author || item.userName || '' }}</text>
              </view>
              <view class="card-like" :class="{ 'liked': item.isLiked }" @click.stop="handleLikeClick(item)">
                <image class="like-icon" :src="item.isLiked ? '/static/images/icon/like_active.png' : '/static/images/icon/like.png'" mode="aspectFit"/>
                <text class="like-count">{{ item.likes || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

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
  setup() {
    const languageStore = useLanguageStore()
    return {
      languageStore
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
    fixBlobUrl(url) {
      if (!url) return ''
      if (typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('file://'))) {
        return '/static/images/3Dprinter.png'
      }
      return url
    },
    handleImageError(item) {
      item.image = '/static/images/3Dprinter.png'
    },
    handleAvatarError(item) {
      item.authorAvatar = '/static/images/Default avatar.png'
      item.userAvatar = '/static/images/Default avatar.png'
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
}

.card-img {
  width: 100%;
  height: auto;
  border-radius: 16rpx 16rpx 0 0;
  display: block;
}

.card-info {
  padding: 12rpx;
}

.card-desc {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12rpx;
  display: block;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
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
  min-width: 0;
}

.author-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.author-name {
  font-size: 20rpx;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-like {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding-left: 10rpx;
}

.like-icon {
  width: 32rpx;
  height: 32rpx;
}

.like-count {
  font-size: 20rpx;
  color: #999999;
}

.card-like.liked .like-count {
  color: #ff6b9d;
}
</style>