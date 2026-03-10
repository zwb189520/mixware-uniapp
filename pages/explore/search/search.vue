<template>
  <view class="search-page">
    <safe-area />
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="search-container">
        <uni-icons type="left" size="24" @click="handleCancel" class="back-icon" />
        <view class="search-input-wrapper">
          <uni-icons type="search" size="18" color="#999" class="search-icon" />
          <input
            class="search-input"
            :placeholder="placeholder || '搜索模型'"
            v-model="localKeyword"
            @confirm="handleSearch"
            @input="handleInput"
          />
          <view v-if="localKeyword" class="clear-btn" @click="clearKeyword">
            <uni-icons type="clear" size="16" color="#ccc" />
          </view>
        </view>
        <text class="search-btn" @click="handleSearch">{{ texts.search || '搜索' }}</text>
      </view>
    </view>

    <!-- 搜索历史和热门推荐 -->
    <scroll-view v-show="!showResults" class="search-content" scroll-y>
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length" class="history-section">
        <view class="section-header">
          <text class="section-title">{{ texts.searchHistory || '搜索历史' }}</text>
          <uni-icons 
            type="trash" 
            size="20" 
            color="#999" 
            @click="clearHistory"
            class="clear-history"
          />
        </view>
        <view class="history-tags">
          <text
            class="history-tag"
            v-for="(item, index) in searchHistory"
            :key="index"
            @click="useHistory(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <!-- <view v-if="hotTags.length" class="hot-search-section">
        <view class="section-header">
          <text class="section-title">{{ texts.hotSearch || '热门搜索' }}</text>
        </view>
        <view class="hot-tags">
          <text
            class="hot-tag"
            v-for="(tag, index) in hotTags"
            :key="index"
            @click="handleTagClick(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view> -->
    </scroll-view>

    <!-- 搜索结果 -->
    <scroll-view v-show="showResults" class="search-results" scroll-y>
      <WaterfallLayout
        :left-list="searchResults.leftList"
        :right-list="searchResults.rightList"
        @card-click="handleModelClick"
        @like-click="toggleLike"
        @author-click="handleAuthorClick"
      />
    </scroll-view>
  </view>
</template>

<script>
import WaterfallLayout from '@/components/waterfall-layout/waterfall-layout.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { getModelPage } from '@/api/models.js'
import { getHotExamples } from '@/api/session.js'
import { useExploreStore } from '@/stores/index.js'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores'

export default {
  components: {
    WaterfallLayout,
    SafeArea
  },
  data() {
    return {
      localKeyword: '',
      showResults: false,
      searchHistory: [],
      hotTags: [],
      searchResults: {
        leftList: [],
        rightList: []
      }
    }
  },
  computed: {
    placeholder() {
      return this.texts.searchPlaceholder || '搜索模型'
    },
    texts() {
      return this.languageStore.texts.explore
    }
  },
  onLoad(options) {
    this.languageStore.loadLanguage()
    this.loadSearchHistory()
    this.loadHotTags()
    
    // 如果从外部传递了关键词，则自动填充并执行搜索
    if (options.keyword) {
      const keyword = decodeURIComponent(options.keyword)
      // 只有在本地关键词为空时才设置，避免覆盖用户正在输入的内容
      if (!this.localKeyword) {
        this.localKeyword = keyword
        this.$nextTick(() => {
          if (this.localKeyword.trim()) {
            this.performSearch(this.localKeyword)
          }
        })
      }
    }
  },
  setup() {
    const exploreStore = useExploreStore()
    const languageStore = useLanguageStore()
    const { hotTags: storeHotTags } = storeToRefs(exploreStore)
    
    return {
      exploreStore,
      languageStore,
      storeHotTags
    }
  },
  methods: {
    loadSearchHistory() {
      try {
        const history = uni.getStorageSync('searchHistory') || []
        this.searchHistory = history.slice(0, 10) // 限制最多10条历史记录
      } catch (e) {
        this.searchHistory = []
      }
    },
    
    saveSearchHistory(keyword) {
      if (!keyword.trim()) return
      
      try {
        let history = uni.getStorageSync('searchHistory') || []
        // 移除重复项
        history = history.filter(item => item !== keyword)
        // 添加到开头
        history.unshift(keyword)
        // 限制最多10条
        history = history.slice(0, 10)
        uni.setStorageSync('searchHistory', history)
        this.searchHistory = history
      } catch (e) {
        console.error('保存搜索历史失败:', e)
      }
    },
    
    async loadHotTags() {
      try {
        // 优先使用store中的热门标签
        if (this.storeHotTags && this.storeHotTags.length > 0) {
          this.hotTags = this.storeHotTags
          return
        }
        
        const res = await getHotExamples(20)
        if (res.code === 0 || res.code === 1) {
          if (res.data && res.data.length > 0) {
            this.hotTags = res.data.map(item => item.title || item.describe || '').filter(tag => tag.trim())
          }
        }
      } catch (error) {
        console.error('加载热门标签失败:', error)
      }
    },
    
    handleInput(event) {
      // 实时更新本地关键字，但不触发搜索
      this.localKeyword = event.detail.value
      
      // 如果输入为空，显示搜索历史和热门搜索
      if (!this.localKeyword.trim()) {
        this.showResults = false
      }
    },
    
    async handleSearch() {
      if (!this.localKeyword.trim()) {
        uni.showToast({
          title: this.texts.inputKeyword || '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      this.saveSearchHistory(this.localKeyword)
      await this.performSearch(this.localKeyword)
    },
    
    async performSearch(keyword) {
      uni.showLoading({
        title: this.texts.searching || '搜索中...'
      })
      
      try {
        const res = await getModelPage({
          current: 1,
          size: 20,
          name: keyword
        })
        
        if (res.code === 1 && res.data && res.data.records) {
          const results = this.formatSearchResults(res.data.records)
          this.searchResults = results
          this.showResults = true
          
          const resultCount = results.leftList.length + results.rightList.length
          // 不显示找到多少个结果的提示
        } else {
          this.searchResults = { leftList: [], rightList: [] }
          this.showResults = true
          uni.showToast({
            title: this.texts.noResults || '未找到相关结果',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: this.texts.searchFailed || '搜索失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    formatSearchResults(models) {
      const fixImageUrl = (url) => {
        if (!url) return '/static/images/logo.png'
        if (url.includes('localhost:9000')) {
          return url.replace('localhost:9000', '47.102.212.37:9000')
        }
        if (url.includes('/api/uploads/image/')) {
          return '/static/images/logo.png'
        }
        return url
      }
      
      const formattedModels = models.map(model => ({
        id: model.modelId,
        name: model.name || '未命名模型',
        desc: model.description || model.name || '暂无描述',
        image: fixImageUrl(model.previewUrl),
        author: model.userId ? `用户_${model.userId.substring(model.userId.length - 6)}` : '匿名用户',
        authorAvatar: model.authorAvatar ? fixImageUrl(model.authorAvatar) : '/static/images/Default avatar.png',
        likes: model.collectCount || 0,
        isLiked: false,
        viewCount: model.viewCount || 0
      }))
      
      // 分成左右两列
      const leftList = []
      const rightList = []
      
      formattedModels.forEach((model, index) => {
        if (index % 2 === 0) {
          leftList.push(model)
        } else {
          rightList.push(model)
        }
      })
      
      return { leftList, rightList }
    },
    
    handleCancel() {
      uni.navigateBack()
    },
    
    clearKeyword() {
      this.localKeyword = ''
      this.showResults = false
    },
    
    useHistory(keyword) {
      this.localKeyword = keyword
      this.performSearch(keyword)
    },
    
    handleTagClick(tag) {
      this.localKeyword = tag
      this.performSearch(tag)
    },
    
    clearHistory() {
      uni.showModal({
        title: this.texts.clearHistoryTitle || '确认清除',
        content: this.texts.clearHistoryContent || '确定要清除搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('searchHistory')
            this.searchHistory = []
            uni.showToast({
              title: this.texts.clearSuccess || '已清除',
              icon: 'success'
            })
          }
        }
      })
    },
    
    handleModelClick(item) {
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
      })
    },
    
    handleAuthorClick(item) {
      // 处理作者点击事件
    },
    
    async toggleLike(item) {
      // 处理点赞事件
      uni.showToast({
        title: this.texts.likeFeatureUnavailable || '点赞功能暂时不可用',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.search-page {
  height: 100vh;
  background-color: #FFF9F5;
  display: flex;
  flex-direction: column;
}

.search-header {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-container {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.back-icon {
  margin-right: 20rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
}

.search-btn {
  font-size: 28rpx;
  color: #FF5A00;
  margin-left: 20rpx;
  padding: 10rpx 0;
}

.search-icon {
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  height: 40rpx;
  line-height: 40rpx;
}

.clear-btn {
  padding: 0 10rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #FF5A00;
}

.search-content {
  flex: 1;
  padding: 20rpx 30rpx 30rpx;
}

.history-section,
.hot-search-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-history {
  padding: 0 70rpx;
  margin-left: 10rpx;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  width: 100%;
}

.history-tag,
.hot-tag {
  padding: 12rpx 24rpx;
  background-color: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
  max-width: 100%;
  word-break: break-all;
  box-sizing: border-box;
}

.history-tag:active,
.hot-tag:active {
  background-color: #f0f0f0;
}

.search-results {
  flex: 1;
}
</style>