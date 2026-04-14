<template>
  <view class="page-container">
    <!-- 顶部背景 -->
    <view class="header" :class="{ 'header-hidden': isSticky }">
      <image class="bg-img" src="/static/images/explore-bg.png" mode="aspectFill" />
      <view class="banner">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
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

        <!-- 操作按钮 -->
        <!-- <view class="action-btns">
          <view class="action-btn upload-btn" @tap="uploadModel">
            <text>↑上传模型</text>
          </view>
        </view> -->

        <!-- 滑动标签 -->
        <view class="tabs-wrapper">
          <!-- 未展开状态：横向滚动Tab -->
          <view
            class="tabs-container"
            :style="{ visibility: showTabsModal ? 'hidden' : 'visible' }"
          >
            <scroll-view
              scroll-x
              class="tabs-scroll"
              :show-scrollbar="false"
              :scroll-into-view="'tab-' + activeIndex"
            >
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
            <!-- 步骤1: 下拉中 -->
            <view
              v-if="refreshStep === 1"
              class="refresh-arrow"
              :class="{ rotate: pullDistance > 40 }"
            ></view>
            <!-- 步骤2: 松开刷新 -->
            <view v-else-if="refreshStep === 2" class="refresh-arrow rotate"></view>
            <!-- 步骤3: 刷新中 -->
            <view v-else-if="refreshStep === 3" class="refresh-spinner rotating"></view>
            <!-- 步骤4: 刷新成功 -->
            <view v-else-if="refreshStep === 4" class="refresh-success">✓</view>
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
            <view
              v-if="!loading && !dailyLeftList.length && !dailyRightList.length"
              class="empty-tip"
            >
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
            <view
              v-if="!loading && !categoryLeftList.length && !categoryRightList.length"
              class="empty-tip"
            >
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

<script lang="ts">
import SearchBar from './components/searchBar.vue'
import CategoryTabs from './components/categoryTabs.vue'
import WaterfallLayout from '@/components/waterfall-layout/waterfall-layout.vue'
import {
  getModelPage,
  addModel,
  deleteModel,
  likeModel,
  unlikeModel,
  checkModelLike
} from '@/api/models.ts'
import { uploadImages } from '@/api/upload.ts'
import { uploadModelFile } from '@/api/upload.ts'
import { getHotExamples } from '@/api/session.ts'
import type { HotExample, ApiResponse, Model, PaginatedData, ExploreModel } from '@/types/api'
import { parseSnCode } from '@/api/devices.ts'
import { useExploreStore, useUserStore } from '@/stores/index.ts'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/index.ts'
import { API } from '@/constants/index.ts'

type ExploreStore = ReturnType<typeof useExploreStore>
type LanguageStore = ReturnType<typeof useLanguageStore>
type UserStore = ReturnType<typeof useUserStore>

interface TabItem {
  label: string
  value: string
}

interface TouchEvent {
  touches: Array<{ clientX: number; clientY: number }>
}

interface ScrollEvent {
  detail: { scrollTop: number }
}

interface ModelLikeChangedData {
  modelId: string
  isLiked: boolean
  likes: number
}

interface LoadModelsParams {
  refresh?: boolean
  page?: number
  size?: number
  current?: number
}

interface UploadResponse {
  code: number
  data?: {
    fileUrl?: string
    url?: string
    files?: Array<{ fileUrl: string }>
  }
}

interface ModelRecord {
  id: string | number
  modelId?: string | number
  name?: string
  description?: string
  previewUrl?: string
  userId?: string
  collectCount?: number
  viewCount?: number
  category?: string
}

interface ChooseFileResult {
  tempFiles: Array<{ path: string | File; name: string }>
}

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
    const userStore = useUserStore()
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
      userStore,
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
    texts(): Record<string, string> {
      return this.languageStore.texts.explore
    },
    tabs(): TabItem[] {
      return [
        { label: this.texts.dailyRecommend, value: 'daily' },
        { label: this.texts.hotCreate, value: 'hot' },
        { label: this.texts.otherCategory, value: 'category' }
      ]
    }
  },
  data() {
    return {
      activeIndex: 0 as number,
      slideDirection: 'right' as string,
      refreshing: false as boolean,
      refreshingText: '下拉刷新' as string,
      refreshHeight: 0 as number,
      refreshOpacity: 0 as number,
      refreshStep: 1 as number,
      pullDistance: 0 as number,
      startY: 0 as number,
      isPulling: false as boolean,
      startX: 0 as number,
      isHorizontalSwipe: false as boolean,
      showTabsModal: false as boolean,
      isSticky: false as boolean
    }
  },
  onLoad(): void {
    this.exploreStore.initFromStorage()
    this.languageStore.loadLanguage()
    this.loadModels()
    this.loadHotTags()

    uni.$on('postDeleted', () => {
      this.loadModels()
    })
    uni.$on('modelLikeChanged', (data: unknown) => {
      const likeData = data as ModelLikeChangedData
      if (likeData && likeData.modelId) {
        this.exploreStore.updateModelLike(likeData.modelId, likeData.isLiked, likeData.likes)
      }
    })
  },
  onShow(): void {
    this.languageStore.updateTabBar()
  },
  onUnload(): void {
    uni.$off('postDeleted')
    uni.$off('modelLikeChanged')
  },
  methods: {
    onTouchStart(e: TouchEvent): void {
      if (this.refreshing) return
      this.startY = e.touches[0].clientY
      this.startX = e.touches[0].clientX
      this.isPulling = false
      this.isHorizontalSwipe = false
    },
    onTouchMove(e: TouchEvent): void {
      if (this.refreshing) return
      const currentY = e.touches[0].clientY
      const currentX = e.touches[0].clientX
      const diffY = currentY - this.startY
      const diffX = currentX - this.startX
      const absDiffX = Math.abs(diffX)
      const absDiffY = Math.abs(diffY)
      this.pullDistance = diffY

      if (!this.isHorizontalSwipe && !this.isPulling) {
        if (absDiffX > absDiffY && absDiffX > 10) {
          this.isHorizontalSwipe = true
          return
        } else if (absDiffY > absDiffX && absDiffY > 10) {
          this.isPulling = true
        }
      }

      if (this.isHorizontalSwipe) {
        return
      }

      if (diffY > 0 && this.isPulling) {
        this.isSticky = false
        this.refreshHeight = Math.min(diffY, 100)
        this.refreshOpacity = Math.min(diffY / 80, 1)

        if (diffY > 40) {
          this.refreshStep = 2
          this.refreshingText = this.texts.releaseToRefresh
        } else {
          this.refreshStep = 1
          this.refreshingText = this.texts.pullToRefresh
        }
      }

      if (diffY < 0 && this.isPulling) {
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshStep = 1
        this.refreshingText = ''
        this.isPulling = false
      } else if (diffY < -5 && !this.isPulling) {
        this.isSticky = true
      }
    },
    handleScroll(e: ScrollEvent): void {
      if (!this.refreshing) {
        if (e.detail.scrollTop > 0) {
          this.isSticky = true
        } else if (e.detail.scrollTop <= 0) {
          this.isSticky = false
        }
      }
    },
    onTouchEnd(): void {
      if (this.isHorizontalSwipe) {
        this.isHorizontalSwipe = false
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshingText = ''
        this.isPulling = false
        return
      }

      if (this.refreshHeight > 40) {
        this.refreshing = true
        this.refreshStep = 3
        this.isSticky = false
        this.refreshingText = this.texts.refreshing
        this.refreshHeight = 80
        this.onRefresh()
      } else {
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshingText = ''
        this.refreshStep = 1
      }
      this.isPulling = false
    },
    async onRefresh(): Promise<void> {
      this.refreshStep = 3
      await this.loadModels({ current: 1, size: 100 })
      this.refreshStep = 4
      this.refreshingText = this.texts.refreshComplete
      setTimeout(() => {
        this.refreshHeight = 0
        this.refreshOpacity = 0
        this.refreshing = false
        this.refreshStep = 1
        this.refreshingText = ''
      }, 800)
    },
    loadMore(): void {},
    async loadHotTags(): Promise<void> {
      if (!this.userStore.isLoggedIn) return
      try {
        const res = await getHotExamples(20)
        if (res.code === 0 || res.code === 1) {
          if (res.data && res.data.length > 0) {
            this.exploreStore.setHotTags(
              res.data.map((item) => item.content || '').filter((tag: string) => tag.trim())
            )
          }
        }
      } catch (error) {
        console.error('加载热门标签失败:', error)
      }
    },
    async loadModels(params: LoadModelsParams = {}): Promise<void> {
      this.exploreStore.setLoading(true)
      try {
        const res = await getModelPage({
          current: params.page || 1,
          size: params.size || 100
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

    mapCategoryToTab(apiCategory: string): string {
      if (!apiCategory) return 'daily'

      const categoryMap: Record<string, string> = {
        日用居家: 'daily',
        玩具手办: 'hot',
        亲子互动: 'category',
        学习探索: 'category',
        其他: 'category',
        高速打印: 'category'
      }

      return categoryMap[apiCategory] || 'daily'
    },

    assignModelsToTabs(models: Model[]): void {
      if (!models.length) {
        return
      }

      const fixImageUrl = (url: string): string => {
        if (!url) return '/static/images/logo.png'
        if (url.includes('localhost:9000')) {
          return url.replace('localhost:9000', '47.102.212.37:9000')
        }
        if (url.includes('/api/uploads/image/')) {
          return '/static/images/logo.png'
        }
        return url
      }

      const formattedModels: ExploreModel[] = models
        .filter((model) => model.modelId || model.id)
        .map((model) => ({
          id: (model.modelId || model.id) as string | number,
          name: model.name || '未命名模型',
          desc: model.name || model.describe || '暂无描述',
          image: fixImageUrl(model.previewUrl || ''),
          author: model.userName || model.username || model.author || '',
          authorAvatar: (model.userAvatar || model.avatarUrl || model.authorAvatar)
            ? fixImageUrl(model.userAvatar || model.avatarUrl || model.authorAvatar || '')
            : '/static/images/Default avatar.png',
          likes: model.likes || model.likeCount || 0,
          isLiked: model.isLiked || false,
          viewCount: model.views || model.viewCount || 0,
          category: this.mapCategoryToTab(model.category || '')
        }))

      const tabData = {
        daily: formattedModels.filter((m: ExploreModel) => m.category === 'daily'),
        hot: formattedModels.filter((m: ExploreModel) => m.category === 'hot' || m.viewCount > 1000),
        category: formattedModels.filter((m: ExploreModel) => m.category !== 'daily' && m.category !== 'hot')
      }

      this.dailyModels = tabData.daily
      this.hotModels = tabData.hot
      this.categoryModels = tabData.category

      this.exploreStore.setDailyModels(this.dailyModels)
      this.exploreStore.setHotModels(this.hotModels)
      this.exploreStore.setCategoryModels(this.categoryModels)

      if (this.userStore.isLoggedIn) {
        this.loadLikeStatus(formattedModels)
      }
    },

    async loadLikeStatus(models: ExploreModel[]): Promise<void> {
      try {
        const checkPromises = models.map((model) =>
          checkModelLike(model.id).catch(() => ({ code: 0, data: { liked: false } }))
        )
        const results = await Promise.all(checkPromises)
        results.forEach((res, index: number) => {
          if (res.code === 1) {
            const model = models[index]
            const newIsLiked = res.data?.liked === true
            if (model.isLiked !== newIsLiked) {
              this.exploreStore.updateModelLike(model.id, newIsLiked, model.likes)
            }
          }
        })
      } catch (e) {
        console.warn('获取点赞状态失败:', e)
      }
    },

    switchTab(tab: string): void {
      const tabs = ['daily', 'hot', 'category']
      const tabIndex = tabs.indexOf(tab)
      if (tabIndex !== -1) {
        this.activeIndex = tabIndex
      }
      this.exploreStore.setCurrentTab(tab)
      this.$nextTick(() => {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 })
      })
    },
    handleSearch(): void {
      this.searchModels(this.keyword)
      this.exploreStore.setShowSearch(false)
    },
    async searchModels(keyword: string): Promise<void> {
      if (!keyword.trim()) {
        uni.showToast({
          title: this.texts.pleaseEnterKeyword || '请输入搜索关键词',
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
          const fixImageUrl = (url: string): string => {
            if (!url) return '/static/images/logo.png'
            return url
              .replace('localhost:9000', '47.102.212.37:9000')
              .replace('api/uploads/image', '9000/image')
          }

          console.log('API返回的模型数据:', res.data.records)
          const records = res.data.records as unknown as ModelRecord[]
          const formattedModels: ExploreModel[] = records.map((model: ModelRecord) => ({
            id: model.modelId || model.id,
            name: model.name || '未命名模型',
            desc: model.description || model.name || '暂无描述',
            image: fixImageUrl(model.previewUrl || ''),
            author: model.userId ? model.userId.substring(0, 8) : '匿名用户',
            authorAvatar: fixImageUrl(model.previewUrl || ''),
            likes: model.collectCount || 0,
            isLiked: false,
            viewCount: model.viewCount || 0,
            category: this.mapCategoryToTab(model.category || '')
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
            title: this.texts.noResultsFound || '未找到相关结果',
            icon: 'none'
          })
        }
      } catch (error: unknown) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: this.texts.searchFailed || '搜索失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.exploreStore.setLoading(false)
      }
    },
    handleScan(): void {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          console.log('扫码成功:', res)
          if (res.result) {
            this.handleScanResult(res.result)
          }
        },
        fail: (err: UniApp.GeneralCallbackResult) => {
          console.error('扫码失败:', err)
          uni.showToast({
            title: this.texts.scanFailed || '扫码失败',
            icon: 'none'
          })
        }
      })
    },
    async handleScanResult(result: string): Promise<void> {
      if (result) {
        uni.showLoading({ title: this.texts.parsing || '解析中...' })
        try {
          const res = await parseSnCode(result)
          uni.hideLoading()

          if (res.data) {
            uni.showToast({
              title: this.texts.parseSuccess || '解析成功',
              icon: 'success',
              duration: 2000
            })
            console.log('SN码解析结果:', res.data)
          } else {
            uni.showToast({
              title: this.texts.invalidSnCode || '无效的SN码',
              icon: 'none'
            })
          }
        } catch (error: unknown) {
          uni.hideLoading()
          console.error('解析SN码失败:', error)
          uni.showToast({
            title: this.texts.parseFailed || '解析失败',
            icon: 'none'
          })
        }
      }
    },
    handleCamera(): void {},
    handleTagClick(tag: string): void {
      this.exploreStore.setKeyword(tag)
      this.searchModels(tag)
    },
    handleModelClick(item: ExploreModel): void {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({
          url: '/pagesMember/auth/login/login'
        })
        return
      }
      if (!item.id) {
        uni.showToast({ title: '模型ID无效', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
      })
    },
    handleAuthorClick(item: ExploreModel): void {},
    async toggleLike(item: ExploreModel): Promise<void> {
      if (!this.userStore.isLoggedIn) {
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
        const res = await (item.isLiked ? unlikeModel(item.id) : likeModel(item.id))
        if (res.code === 1) {
          const newIsLiked = !item.isLiked
          const newLikes = item.likes + (newIsLiked ? 1 : -1)
          this.exploreStore.updateModelLike(item.id, newIsLiked, newLikes)

          uni.showToast({
            title: item.isLiked ? this.texts.likeSuccess : this.texts.cancelLike,
            icon: 'success'
          })
        } else {
          const msg = (res as unknown as Record<string, unknown>).msg as string | undefined
          const realIsLiked = msg?.includes('已点赞') ?? false
          this.exploreStore.updateModelLike(item.id, realIsLiked, item.likes)
          uni.showToast({ title: msg || '操作失败', icon: 'none' })
        }
      } catch (error: unknown) {
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: (error as Error).message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },

    goToSearchPage(): void {
      const pages = getCurrentPages()
      const currentPageRoute = (pages[pages.length - 1] as any).route
      if (currentPageRoute === 'pages/explore/search/search') {
        return
      }

      uni.navigateTo({
        url: `/pages/explore/search/search?keyword=${encodeURIComponent(this.keyword || '')}`
      })
    },

    handleSearchClick(): void {
      this.goToSearchPage()
    },

    selectTab(index: number): void {
      this.activeIndex = index
      this.showTabsModal = false
    },

    toggleTabsModal(): void {
      this.showTabsModal = !this.showTabsModal
    },

    async uploadModel(): Promise<void> {
      const modalRes = await this.showModalPromise({
        title: this.texts.uploadSteps || '上传步骤',
        content:
          this.texts.uploadStepsContent ||
          '1. 选择预览图片\n2. 选择STL模型文件\n3. 选择分类\n4. 输入模型名称\n\n点击确定开始上传'
      })
      if (!modalRes.confirm) return

      try {
        const imgRes = await this.chooseImagePromise({ count: 1 })
        const imgPath = imgRes.tempFilePaths[0]
        uni.showToast({
          title: this.texts.imageSelected || '已选择图片',
          icon: 'none',
          duration: 1000
        })

        const stlRes = await this.chooseFilePromise({ count: 1, type: 'all' })
        const stlFile = stlRes.tempFiles[0]
        const stlPath = typeof stlFile.path === 'string' ? stlFile.path : stlFile.path.name
        const stlName = stlFile.name || 'model.stl'
        uni.showToast({
          title: this.texts.stlFileSelected || '已选择STL文件',
          icon: 'none',
          duration: 1000
        })

        const categories = ['日用居家', '玩具手办', '亲子互动', '学习探索', '其他', '高速打印']
        const sheetRes = await this.showActionSheetPromise({ itemList: categories })
        const selectedCategory = categories[sheetRes.tapIndex]
        uni.showToast({
          title: this.texts.categorySelected || '已选择分类',
          icon: 'none',
          duration: 1000
        })

        const inputRes = await this.showModalPromise({
          title: this.texts.modelName || '模型名称',
          content: '',
          placeholderText: stlName.replace('.stl', '').replace('.STL', ''),
          editable: true
        })
        if (!inputRes.confirm) return
        const finalName = inputRes.content || stlName.replace('.stl', '').replace('.STL', '')

        uni.showLoading({ title: this.texts.uploading || '上传中...' })

        const imgUploadRes = await uploadImages([imgPath])
        if (!imgUploadRes || imgUploadRes.length === 0) {
          throw new Error('图片上传失败: 没有返回数据')
        }
        const imgResult = imgUploadRes[0]
        if (!imgResult || (imgResult.code !== 1 && imgResult.code !== 200)) {
          throw new Error(`图片上传失败: ${imgResult?.msg || imgResult?.message || '未知错误'}`)
        }

        const stlUploadRes = await uploadModelFile(stlPath)
        if (stlUploadRes.code !== 1 && stlUploadRes.code !== 200) {
          throw new Error(
            `STL文件上传失败: ${stlUploadRes.msg || stlUploadRes.message || '未知错误'}`
          )
        }

        const userInfo = this.userStore.userInfo
        const userId = userInfo?.userId || userInfo?.id || ''

        const imgData = imgUploadRes[0].data as Record<string, unknown> | undefined
        const files = imgData?.files as Array<{ fileUrl: string }> | undefined
        const previewUrl = files?.[0]?.fileUrl || String(imgData?.fileUrl || imgData?.url || '')
        const stlData = stlUploadRes.data as Record<string, unknown> | undefined
        const downloadUrl = String(stlData?.fileUrl || stlData?.url || stlUploadRes.data || '')

        await addModel({
          name: finalName,
          category: selectedCategory,
          previewUrl: previewUrl,
          downloadUrl: downloadUrl,
          description: finalName,
          userId: userId,
          editableStatus: 'editable'
        })

        uni.hideLoading()
        uni.showToast({ title: this.texts.uploadSuccess || '上传成功', icon: 'success' })
        this.loadModels()
      } catch (error: unknown) {
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.uploadFailed || '上传失败',
          icon: 'none'
        })
      }
    },

    showModalPromise(options: UniApp.ShowModalOptions): Promise<UniApp.ShowModalRes> {
      return new Promise(resolve => {
        uni.showModal({ 
          ...options, 
          success: resolve, 
          fail: () => resolve({ cancel: true, confirm: false } as UniApp.ShowModalRes) 
        })
      })
    },
    showActionSheetPromise(options: UniApp.ShowActionSheetOptions): Promise<UniApp.ShowActionSheetRes> {
      return new Promise((resolve, reject) => {
        uni.showActionSheet({ ...options, success: resolve, fail: reject })
      })
    },
    chooseImagePromise(options: UniApp.ChooseImageOptions): Promise<UniApp.ChooseImageSuccessCallbackResult> {
      return new Promise((resolve, reject) => {
        uni.chooseImage({ ...options, success: resolve, fail: reject })
      })
    },
    chooseFilePromise(options: UniApp.ChooseFileOptions): Promise<ChooseFileResult> {
      return new Promise((resolve, reject) => {
        // #ifdef H5
        if (typeof uni.chooseFile === 'function') {
          uni.chooseFile({ ...options, success: resolve as (res: unknown) => void, fail: reject })
        } else {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.stl,.STL'
          input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement | null
            const file = target?.files?.[0]
            if (file) {
              resolve({ tempFiles: [{ path: file, name: file.name }] })
            } else {
              reject(new Error('未选择文件'))
            }
          }
          input.click()
        }
        // #endif
        // #ifndef H5
        if (typeof uni.chooseFile === 'function') {
          uni.chooseFile({ ...options, success: resolve as (res: unknown) => void, fail: reject })
        } else {
          uni.showToast({ title: 'APP端请使用文件管理器选择STL文件', icon: 'none' })
          reject(new Error('APP端不支持文件选择'))
        }
        // #endif
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  background: #fff9f5;
}

.content-scroll {
  height: 100%;
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
  filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.15));
  /* animation: float 3s ease-in-out infinite; */
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

.welcome {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 1rpx;
}

.main-card {
  background: #fff9f5;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  margin-top: -30rpx;
  padding-top: 24rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: calc(100vh - 290rpx);
  display: flex;
  flex-direction: column;
}

.main-card.is-sticky {
  height: calc(100vh - 30rpx);
}

.main-card.is-sticky {
  margin-top: 0;
  border-radius: 0;
}

.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff9f5;
  padding-bottom: 8rpx;
}

.fixed-spacer {
  height: 20rpx;
  background: #fff9f5;
}

.refresh-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  border: 5rpx solid rgba(255, 90, 0, 0.15);
  border-top: 5rpx solid #ff5a00;
  border-radius: 50%;
  margin-bottom: 12rpx;
}

.refresh-spinner.rotating {
  animation: spin 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.refresh-arrow {
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-bottom: 24rpx solid #ff5a00;
  margin-bottom: 12rpx;
  transition: transform 0.2s;
}

.refresh-arrow.rotate {
  transform: rotate(180deg);
}

.refresh-success {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #ff5a00;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-bottom: 12rpx;
}

.refresh-text {
  font-size: 24rpx;
  color: #ff5a00;
  font-weight: 600;
}

.tabs-wrapper {
  position: relative;
  background: #fff9f5;
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
  color: #ff5a00;
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
  background: linear-gradient(90deg, #ff5a00 0%, #ff8a00 100%);
  border-radius: 3rpx;
}

.tabs-more {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
}

.action-btns {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  background: #fff9f5;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.action-btn text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.upload-btn {
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
}

.tabs-expanded {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #fff9f5;
  z-index: 100;
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
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.modal-tab-item.active {
  background: rgba(255, 90, 0, 0.1);
  border: 2rpx solid #ff5a00;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.modal-tab-item.active .tab-text {
  color: #ff5a00;
  font-weight: 700;
}

.explore-more {
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.6);
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
  flex: 1;
  height: auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
