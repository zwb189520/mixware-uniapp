<template>
  <transition name="search-fade">
    <view v-if="visible" class="search-modal">
      <view class="search-header">
        <uni-icons type="left" size="24" @click="handleBack"/>
        <view class="search-input-box">
          <uni-icons type="search" size="20" color="#999"/>
          <input 
            class="search-input-active" 
            :placeholder="placeholder" 
            v-model="keyword"
            @input="handleInput"
            @confirm="handleSearch"
          />
          <uni-icons type="camera" size="24" color="#999" @click="handleCamera"/>
        </view>
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
      <view class="hot-search">
        <text class="hot-title">热门搜索</text>
        <view class="hot-tags">
          <text 
            class="tag" 
            v-for="(tag, i) in hotTags" 
            :key="i" 
            @click="handleTagClick(tag)"
          >{{ tag }}</text>
        </view>
      </view>
    </view>
  </transition>
</template>

<script>
export default {
  name: 'SearchModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '搜索你感兴趣的内容'
    },
    hotTags: {
      type: Array,
      default: () => ['手办', '手机支架', '高达', '收纳', '解压']
    }
  },
  data() {
    return {
      keyword: ''
    }
  },
  watch: {
    visible(newVal) {
      if (!newVal) {
        this.keyword = ''
      }
    }
  },
  methods: {
    handleBack() {
      this.$emit('close')
    },
    handleInput(e) {
      this.$emit('input', e.detail.value)
    },
    handleSearch() {
      if (this.keyword.trim()) {
        this.$emit('search', this.keyword.trim())
      }
    },
    handleTagClick(tag) {
      this.keyword = tag
      this.$emit('tag-click', tag)
      this.$emit('search', tag)
    },
    handleCamera() {
      this.$emit('camera-click')
    }
  }
}
</script>

<style scoped>
.search-modal {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 999;
}
.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}
.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 15rpx 25rpx;
  margin: 0 20rpx;
}
.search-input-active {
  flex: 1;
  font-size: 28rpx;
  margin: 0 15rpx;
}
.search-btn {
  font-size: 28rpx;
  color: #07C160;
}
.hot-search {
  padding: 30rpx;
}
.hot-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.tag {
  background: #f5f5f5;
  padding: 15rpx 30rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: #666;
}
/* 搜索页面丝滑过渡 */
.search-fade-enter-active,.search-fade-leave-active {
  transition: all .35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.search-fade-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.search-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>