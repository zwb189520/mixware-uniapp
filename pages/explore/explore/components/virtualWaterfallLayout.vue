<template>
  <view class="virtual-waterfall-container">
    <scroll-view 
      class="scroll-view"
      scroll-y 
      @scroll="handleScroll"
      :scroll-top="scrollTop"
      :scroll-with-animation="false"
    >
      <view class="waterfall-content" :style="{ height: totalHeight + 'px' }">
        <view 
          class="waterfall-box" 
          :class="slideDirection" 
          :key="currentTab + '-box'"
        >
          <view class="waterfall-col">
            <view 
              class="model-card" 
              v-for="item in visibleLeftList" 
              :key="item.id" 
              :style="{ transform: `translateY(${item.offsetTop}px)` }"
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
          </view>
          
          <view class="waterfall-col">
            <view 
              class="model-card" 
              v-for="item in visibleRightList" 
              :key="item.id" 
              :style="{ transform: `translateY(${item.offsetTop}px)` }"
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
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'VirtualWaterfallLayout',
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
  data() {
    return {
      scrollTop: 0,
      viewportHeight: 0,
      itemHeights: {},
      bufferSize: 3,
      defaultItemHeight: 300,
      leftPositions: [],
      rightPositions: [],
      leftTotalHeight: 0,
      rightTotalHeight: 0
    }
  },
  computed: {
    totalHeight() {
      return Math.max(this.leftTotalHeight, this.rightTotalHeight)
    },
    visibleLeftList() {
      return this.getVisibleItems(this.leftList, this.leftPositions)
    },
    visibleRightList() {
      return this.getVisibleItems(this.rightList, this.rightPositions)
    }
  },
  watch: {
    leftList: {
      handler() {
        this.calculatePositions('left')
      },
      deep: true,
      immediate: true
    },
    rightList: {
      handler() {
        this.calculatePositions('right')
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.getViewportHeight()
  },
  methods: {
    getViewportHeight() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.virtual-waterfall-container').boundingClientRect(rect => {
        if (rect) {
          this.viewportHeight = rect.height
        }
      }).exec()
    },
    calculatePositions(side) {
      const list = side === 'left' ? this.leftList : this.rightList
      const positions = []
      let currentTop = 0
      
      list.forEach(item => {
        const height = this.itemHeights[item.id] || this.defaultItemHeight
        positions.push({
          ...item,
          offsetTop: currentTop,
          height: height
        })
        currentTop += height + 20
      })
      
      if (side === 'left') {
        this.leftPositions = positions
        this.leftTotalHeight = currentTop
      } else {
        this.rightPositions = positions
        this.rightTotalHeight = currentTop
      }
    },
    getVisibleItems(list, positions) {
      const scrollTop = this.scrollTop
      const viewportHeight = this.viewportHeight
      const startIndex = Math.max(0, Math.floor(scrollTop / this.defaultItemHeight) - this.bufferSize)
      const endIndex = Math.min(
        positions.length - 1,
        Math.ceil((scrollTop + viewportHeight) / this.defaultItemHeight) + this.bufferSize
      )
      
      return positions.slice(startIndex, endIndex + 1)
    },
    handleScroll(e) {
      this.scrollTop = e.detail.scrollTop
    },
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
    },
    updateItemHeight(itemId, height) {
      this.itemHeights[itemId] = height
      this.calculatePositions('left')
      this.calculatePositions('right')
    }
  }
}
</script>

<style scoped>
.virtual-waterfall-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.scroll-view {
  width: 100%;
  height: 100%;
}

.waterfall-content {
  width: 100%;
  position: relative;
}

.waterfall-box {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  position: relative;
}

.waterfall-col {
  flex: 1;
  position: relative;
}

.model-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  position: absolute;
  left: 0;
  right: 0;
  transition: all 0.3s ease;
}

.model-card:active {
  transform: scale(0.98) !important;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.card-img {
  width: 100%;
  height: auto;
  border-radius: 16rpx 16rpx 0 0;
  display: block;
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
