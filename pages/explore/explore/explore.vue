<template>
  <view class="page-container">
    <!-- 顶部背景 -->
    <view class="header" :class="{ 'header-hidden': isSticky }">
      <image class="bg-img" src="/static/images/explore-bg.png" mode="aspectFill"/>
      <view class="banner">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"/>
        <text class="welcome">{{ texts.welcome }}</text>
      </view>
    </view>

    <!-- 白色圆角盖：从搜索框开始向下 -->
    <view class="main-card" :class="{ 'is-sticky': isSticky }">
      <!-- 吸顶容器 -->
      <view class="sticky-bar">
        <!-- 固定空白区域 -->
        <view class="fixed-spacer"></view>
        
        <!-- 搜索栏组件 -->
        <SearchBar
          :placeholder="texts.searchModel"
          :keyword="keyword"
          @search-click="handleSearchClick"
        />

        <!-- 滑动标签 -->
        <view class="tabs-wrapper">
          <!-- 未展开状态：横向滚动Tab -->
          <view class="tabs-container" :style="{ visibility: showTabsModal ? 'hidden' : 'visible' }">
            <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false" :scroll-into-view="'tab-' + activeIndex">
              <view class="tabs">
                <text 
                  :id="'tab-' + index"
                  class="item"
                  v-for="(item, index) in tabs"
                  :key="item.value"
                  @tap.stop="activeIndex = index"
                  :class="{ active: activeIndex === index }"
                >
                  {{ item.label }}
                </text>
              </view>
            </scroll-view>
            <view class="tabs-more" @tap="toggleTabsModal">
              <uni-icons type="down" size="20" color="#333"></uni-icons>
            </view>
          </view>
          
          <!-- 展开状态：显示所有频道 -->
          <view v-if="showTabsModal" class="tabs-expanded">
            <view class="expanded-header" @tap="toggleTabsModal">
              <text class="channel-title">{{ texts.channelTitle }}</text>
              <text class="channel-hint">{{ texts.channelHint }}</text>
              <uni-icons type="up" size="20" color="#333"></uni-icons>
            </view>
            
            <view class="modal-tabs">
              <view 
                class="modal-tab-item"
                v-for="(item, index) in tabs"
                :key="item.value"
                @tap="selectTab(index)"
                :class="{ active: activeIndex === index }"
              >
                <text class="tab-text">{{ item.label }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 下拉刷新区域 -->
        <view 
          class="refresh-container" 
          :style="{ height: refreshHeight + 'px', opacity: refreshOpacity }"
        >
          <view class="refresh-content">
            <view class="refresh-spinner" :class="{ 'rotating': refreshing }"></view>
            <text class="refresh-text">{{ refreshingText }}</text>
          </view>
        </view>
      </view>
      
      <!-- 滑动容器 -->
      <swiper 
        class="swiper" 
        :current="activeIndex"
        @change="activeIndex = $event.detail.current"
        :class="{ 'is-sticky': isSticky }"
      >
        <swiper-item>
          <scroll-view 
            scroll-y 
            class="content-scroll" 
            :show-scrollbar="false"
            @scrolltolower="loadMore"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @scroll="handleScroll"
          >
            
            <!-- 瀑布流布局组件 -->
        <view v-if="!loading && !dailyLeftList.length && !dailyRightList.length" class="empty-tip">
          {{ texts.noContent }}
        </view>
        <WaterfallLayout
          v-else
          :left-list="dailyLeftList"
          :right-list="dailyRightList"
          :slide-direction="slideDirection"
          @card-click="handleModelClick"
          @like-click="toggleLike"
          @author-click="handleAuthorClick"
        />
          </scroll-view>
        </swiper-item>
        <swiper-item>
          <scroll-view 
            scroll-y 
            class="content-scroll" 
            :show-scrollbar="false"
            @scrolltolower="loadMore"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @scroll="handleScroll"
          >
            <!-- 骨架屏 -->
        
        <!-- 瀑布流布局组件 -->
        <view v-if="!loading && !hotLeftList.length && !hotRightList.length" class="empty-tip">
          {{ texts.noContent }}
        </view>
        <WaterfallLayout
          v-else
          :left-list="hotLeftList"
          :right-list="hotRightList"
          :slide-direction="slideDirection"
          @card-click="handleModelClick"
          @like-click="toggleLike"
          @author-click="handleAuthorClick"
        />
          </scroll-view>
        </swiper-item>
        <swiper-item>
          <scroll-view 
            scroll-y 
            class="content-scroll" 
            :show-scrollbar="false"
            @scrolltolower="loadMore"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @scroll="handleScroll"
          >
            <!-- 骨架屏 -->
        
        <!-- 瀑布流布局组件 -->
        <view v-if="!loading && !categoryLeftList.length && !categoryRightList.length" class="empty-tip">
          {{ texts.noContent }}
        </view>
        <WaterfallLayout
          v-else
          :left-list="categoryLeftList"
          :right-list="categoryRightList"
          :slide-direction="slideDirection"
          @card-click="handleModelClick"
          @like-click="toggleLike"
          @author-click="handleAuthorClick"
        />
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>


  </view>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import WaterfallLayout from '@/components/waterfall-layout/waterfall-layout.vue'
import { getModelPage } from '@/api/models.js'
import { addFavorite, cancelFavorite } from '@/api/userFavorite.js'
import { toggleLike, checkLikeStatus } from '@/api/community.js'
import { getHotExamples } from '@/api/session.js'
import { parseSnCode } from '@/api/deviceManager.js'
import { useExploreStore } from '@/stores/index.js'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores'

export default {
  components: {
    SearchBar,
    CategoryTabs,
    WaterfallLayout
  },
  easycom: {
    autoscan: true,
    custom: {
      '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue'
    }
  },
  setup() {
    const exploreStore = useExploreStore()
    const languageStore = useLanguageStore()
    const {
      currentTab,
      keyword,
      showSearch,
      hotTags,
      dailyModels,
      hotModels,
      categoryModels,
      loading,
      dailyLeftList,
      dailyRightList,
      hotLeftList,
      hotRightList,
      categoryLeftList,
      categoryRightList
    } = storeToRefs(exploreStore)
    
    return {
      exploreStore,
      languageStore,
      currentTab,
      keyword,
      showSearch,
      hotTags,
      dailyModels,
      hotModels,
      categoryModels,
      loading,
      dailyLeftList,
      dailyRightList,
      hotLeftList,
      hotRightList,
      categoryLeftList,
      categoryRightList
    }
  },
  computed: {
    texts() {
      return this.languageStore.texts.explore
    },
    tabs() {
      return [
        { label: this.texts.dailyRecommend, value: 'daily' },
        { label: this.texts.hotCreate, value: 'hot' },
        { label: this.texts.otherCategory, value: 'category' }
      ]
    }
  },
  data() {
    return {
      activeIndex: 0,
      slideDirection: 'right',
      refreshing: false,
      refreshingText: '',
      refreshHeight: 0,
      refreshOpacity: 0,
      startY: 0,
      isPulling: false,
      startX: 0,
      isHorizontalSwipe: false,
      showTabsModal: false,
      isSticky: false
    }
  },
  onLoad() {
    this.exploreStore.initFromStorage()
    this.languageStore.loadLanguage()
    this.loadModels()
    this.loadHotTags()
    
    // 监听帖子删除事件
    uni.$on('postDeleted', () => {
      this.loadModels()
    })
  },
  onShow() {
    // 页面显示时更新TabBar语言
    this.languageStore.updateTabBar()
  },
  onUnload() {
    uni.$off('postDeleted')
  },
  methods: {
    onTouchStart(e) {
      this.startY = e.touches[0].clientY
      this.startX = e.touches[0].clientX
      this.isPulling = false
      this.isHorizontalSwipe = false
    },
    onTouchMove(e) {
      const currentY = e.touches[0].clientY
      const currentX = e.touches[0].clientX
      const diffY = currentY - this.startY
      const diffX = Math.abs(currentX - this.startX)
      
      if (!this.isHorizontalSwipe && diffX > 10) {
        this.isHorizontalSwipe = true
      }
      
      if (this.isHorizontalSwipe) {
        return
      }
      
      if (diffY > 0 && diffY < 200) {
        this.isPulling = true
        this.isSticky = false
        this.refreshHeight = Math.min(diffY * 15.5, 100)
        this.refreshOpacity = Math.min(diffY / 1, 1)
        
        if (this.refreshHeight > 1) {
          this.refreshingText = this.texts.releaseToRefresh
        } else {
          this.refreshingText = this.texts.pullToRefresh
        }
      } else if (diffY < -5 && !this.isPulling) {
        this.isSticky = true
      }
    },
    handleScroll(e) {
      if (!this.refreshing) {
        if (e.detail.scrollTop > 0) {
          this.isSticky = true
        } else if (e.detail.scrollTop <= 0) {
          this.isSticky = false
        }
      }
    },
    onTouchEnd() {
      if (this.isHorizontalSwipe) {
        this.isHorizontalSwipe = false
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshingText = ''
        this.isPulling = false
        return
      }
      
      if (this.refreshHeight > 1) {
        this.refreshing = true
        this.isSticky = false
        this.refreshingText = this.texts.refreshing
        this.refreshHeight = 80
        this.onRefresh()
      } else {
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshingText = ''
      }
      this.isPulling = false
    },
    async onRefresh() {
      this.refreshing = true
      await this.loadModels()
      setTimeout(() => {
        this.refreshing = false
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshingText = this.texts.refreshComplete
        setTimeout(() => {
          this.refreshingText = ''
        }, 500)
      }, 300)
    },
    loadMore() {
    },
    async loadHotTags() {
      try {
        const res = await getHotExamples(20)
        if (res.code === 0 || res.code === 1) {
          if (res.data && res.data.length > 0) {
            this.exploreStore.setHotTags(res.data.map(item => item.title || item.describe || '').filter(tag => tag.trim()))
          }
        }
      } catch (error) {
        console.error('加载热门标签失败:', error)
      }
    },
    async loadModels(params = {}) {
      this.exploreStore.setLoading(true)
      try {
        const res = await getModelPage({
          current: params.current || 1,
          size: params.size || 30
        })
        
        if (res.code === 1 && res.data && res.data.records) {
          this.assignModelsToTabs(res.data.records)
        }
      } catch (error) {
        console.error('获取模型列表失败:', error)
      } finally {
        this.exploreStore.setLoading(false)
      }
    },
    
    // 映射API分类到tab分类 - 优化移动端显示
    mapCategoryToTab(apiCategory) {
      if (!apiCategory) return 'daily'
      
      const categoryMap = {
        '日用居家': 'daily',
        '玩具手办': 'hot', 
        '时尚穿戴': 'category',
        '数码电器': 'category',
        '建筑模型': 'category',
        '艺术创意': 'category'
      }
      
      return categoryMap[apiCategory] || 'daily'
    },
    
    assignModelsToTabs(models) {
      if (!models.length) {
        return
      }
      
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
        author: model.username || model.nickname || model.userName || '',
        authorAvatar: model.authorAvatar ? fixImageUrl(model.authorAvatar) : '/static/images/Default avatar.png',
        likes: model.likeCount || 0,
        isLiked: false,
        viewCount: model.viewCount || 0,
        category: this.mapCategoryToTab(model.category)
      }))
      
      const tabData = {
        daily: formattedModels.filter(m => m.category === 'daily').slice(0, 10),
        hot: formattedModels.filter(m => m.category === 'hot' || m.viewCount > 1000).slice(0, 10),
        category: formattedModels.filter(m => m.category !== 'daily' && m.category !== 'hot').slice(0, 10)
      }
      
      this.dailyModels = tabData.daily
      this.hotModels = tabData.hot
      this.categoryModels = tabData.category
      
      this.exploreStore.setDailyModels(this.dailyModels)
      this.exploreStore.setHotModels(this.hotModels)
      this.exploreStore.setCategoryModels(this.categoryModels)
    },
    
    switchTab(tab) {
      const tabs = ['daily', 'hot', 'category']
      const tabIndex = tabs.indexOf(tab)
      if(tabIndex !== -1) {
        this.activeIndex = tabIndex
      }
      this.exploreStore.setCurrentTab(tab)
      this.$nextTick(() => {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 })
      })
    },
    handleSearch() { 
      this.searchModels(this.keyword)
      this.exploreStore.setShowSearch(false)
    },
    async searchModels(keyword) {
      if (!keyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      this.exploreStore.setLoading(true)
      try {
        const res = await getModelPage({
          current: 1,
          size: 20,
          name: keyword
        })
        
        if (res.code === 1 && res.data && res.data.records) {
          const fixImageUrl = (url) => {
            if (!url) return '/static/images/logo.png'
            return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
          }
          
          const formattedModels = res.data.records.map(model => ({
            id: model.modelId,
            name: model.name || '未命名模型',
            desc: model.description || model.name || '暂无描述',
            image: fixImageUrl(model.previewUrl),
            author: model.userId ? model.userId.substring(0, 8) : '匿名用户',
            authorAvatar: fixImageUrl(model.previewUrl),
            likes: model.collectCount || 0,
            isLiked: false,
            viewCount: model.viewCount || 0,
            category: this.mapCategoryToTab(model.category)
          }))
          
          if (this.currentTab === 'daily') {
            this.dailyModels = formattedModels
            this.exploreStore.setDailyModels(formattedModels)
          } else if (this.currentTab === 'hot') {
            this.hotModels = formattedModels
            this.exploreStore.setHotModels(formattedModels)
          } else {
            this.categoryModels = formattedModels
            this.exploreStore.setCategoryModels(formattedModels)
          }
          
          uni.showToast({
            title: `找到 ${formattedModels.length} 个相关结果`,
            icon: 'success',
            duration: 2000
          })
        } else {
          uni.showToast({
            title: '未找到相关结果',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: '搜索失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.exploreStore.setLoading(false)
      }
    },
    handleScan() {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          console.log('扫码成功:', res)
          if (res.result) {
            this.handleScanResult(res.result)
          }
        },
        fail: (err) => {
          console.error('扫码失败:', err)
          uni.showToast({
            title: '扫码失败',
            icon: 'none'
          })
        }
      })
    },
    async handleScanResult(result) {
      console.log('扫码结果:', result)
      if (result) {
        uni.showLoading({ title: '解析中...' })
        try {
          const res = await parseSnCode(result)
          uni.hideLoading()
          
          if (res.data) {
            uni.showToast({
              title: '解析成功',
              icon: 'success',
              duration: 2000
            })
            console.log('SN码解析结果:', res.data)
          } else {
            uni.showToast({
              title: '无效的SN码',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.hideLoading()
          console.error('解析SN码失败:', error)
          uni.showToast({
            title: '解析失败',
            icon: 'none'
          })
        }
      }
    },
    handleCamera() {
    },
    handleTagClick(tag) {
      this.exploreStore.setKeyword(tag)
      this.searchModels(tag)
    },
    handleModelClick(item) { 
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({
          url: '/pagesMember/auth/login/login'
        })
        return
      }
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
      })
    },
    handleAuthorClick(item) {
    },
    async toggleLike(item) {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({
          url: '/pagesMember/auth/login/login'
        })
        return
      }
      if (!item.id || String(item.id) === 'NaN' || String(item.id) === 'undefined') {
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
        return
      }

      try {
        const res = await toggleLike('MODEL', item.id)
        if (res.code === 1) {
          item.isLiked = !item.isLiked
          item.likes += item.isLiked ? 1 : -1
          
          if (item.isLiked) {
            const likeData = {
              id: item.id,
              title: item.name,
              image: item.image,
              time: new Date().toISOString()
            }
            let likesList = uni.getStorageSync('likesList') || []
            const existIndex = likesList.findIndex(like => like.id === item.id)
            if (existIndex === -1) {
              likesList.unshift(likeData)
              uni.setStorageSync('likesList', likesList)
            }
          } else {
            let likesList = uni.getStorageSync('likesList') || []
            likesList = likesList.filter(like => like.id !== item.id)
            uni.setStorageSync('likesList', likesList)
          }
          
          uni.showToast({
            title: item.isLiked ? this.texts.likeSuccess : this.texts.cancelLike,
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: error.message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },
    
    goToSearchPage() {
      console.log('点击搜索框，准备跳转到搜索页面，关键词:', this.keyword)
      
      // 检查是否已经在搜索页面，避免重复跳转
      const pages = getCurrentPages()
      const currentPageRoute = pages[pages.length - 1].route
      if (currentPageRoute === 'pages/explore/search/search') {
        console.log('已在搜索页面，无需跳转')
        return
      }
      
      uni.navigateTo({
        url: `/pages/explore/search/search?keyword=${encodeURIComponent(this.keyword || '')}`,
        success: (res) => {
          console.log('页面跳转成功:', res)
        },
        fail: (err) => {
          console.error('页面跳转失败:', err)
          console.error('尝试跳转的URL:', `/pages/explore/search/search?keyword=${encodeURIComponent(this.keyword || '')}`)
        }
      })
    },
    
    handleSearchClick() {
      this.goToSearchPage()
    },
    
    selectTab(index) {
      this.activeIndex = index
      this.showTabsModal = false
    },
    
    toggleTabsModal() {
      this.showTabsModal = !this.showTabsModal
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  background: #FFF9F5;
}

.content-scroll {
  height: 100vh;
}

.header {
  position: relative;
  height: 320rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

.header.header-hidden {
  height: 0;
  opacity: 0;
}

.bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.banner {
  position: absolute;
  left: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.logo {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 24rpx;
  filter: drop-shadow(0 8rpx 16rpx rgba(0,0,0,0.15));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.welcome {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
  letter-spacing: 1rpx;
}

.main-card {
  background: #FFF9F5;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  margin-top: -30rpx;
  padding-top: 24rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.main-card.is-sticky {
  margin-top: 0;
  border-radius: 0;
}

.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFF9F5;
  padding-bottom: 8rpx;
}

.fixed-spacer {
  height: 20rpx;
  background: #FFF9F5;
}

.refresh-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.refresh-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
}

.refresh-spinner {
  width: 56rpx;
  height: 56rpx;
  border: 5rpx solid rgba(255,90,0,0.15);
  border-top: 5rpx solid #FF5A00;
  border-radius: 50%;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(255,90,0,0.2);
}

.refresh-spinner.rotating {
  animation: spin 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.refresh-text {
  font-size: 24rpx;
  color: #FF5A00;
  font-weight: 600;
}

.tabs-wrapper {
  position: relative;
  background: #FFF9F5;
  z-index: 10;
}

.tabs-container {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  gap: 16rpx;
}

.tabs-scroll {
  flex: 1;
  white-space: nowrap;
}

.tabs {
  display: inline-flex;
  gap: 40rpx;
  position: relative;
  padding-bottom: 8rpx;
}

.item {
  display: inline-block;
  text-align: center;
  font-size: 30rpx;
  color: #333;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
  padding: 8rpx 4rpx;
  position: relative;
}

.item.active {
  color: #FF5A00;
  font-weight: 700;
}

.item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #FF5A00 0%, #FF8A00 100%);
  border-radius: 3rpx;
  box-shadow: 0 4rpx 12rpx rgba(255,90,0,0.3);
}

.tabs-more {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
}

.tabs-expanded {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #FFF9F5;
  z-index: 100;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.expanded-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  gap: 12rpx;
}

.channel-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.channel-hint {
  font-size: 26rpx;
  color: #999;
  flex: 1;
}

.modal-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.modal-tab-item {
  padding: 12rpx 10rpx;
  background: rgba(255,255,255,0.8);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.modal-tab-item.active {
  background: rgba(255,90,0,0.1);
  border: 2rpx solid #FF5A00;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.modal-tab-item.active .tab-text {
  color: #FF5A00;
  font-weight: 700;
}

.explore-more {
  padding: 24rpx;
  background: rgba(255,255,255,0.6);
  border-radius: 16rpx;
  text-align: left;
}

.explore-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

  .empty-tip {
    text-align: center;
    padding: 60rpx 0;
    font-size: 28rpx;
    color: #999;
  }

  .swiper {
  height: calc(100vh - 320rpx);
  transition: all 0.3s ease;
}

.swiper.is-sticky {
  height: 100vh;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>