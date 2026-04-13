<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="modelInfo.name || texts.modelDetail" @back="handleBack" />
    <!-- 加载动画 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner">
        <view class="spinner"></view>
        <text class="loading-text">{{ texts.loading || '加载中...' }}</text>
      </view>
    </view>
    <scroll-view v-show="!loading" scroll-y class="content-scroll">
      <view class="model-info-container">
        <view class="carousel-section">
          <swiper
            class="carousel"
            :indicator-dots="true"
            :autoplay="false"
            :circular="true"
            indicator-color="rgba(255,255,255,0.5)"
            indicator-active-color="#1296db"
            @change="handleCarouselChange"
          >
            <swiper-item v-for="(image, index) in modelInfo.images" :key="index">
              <image
                class="carousel-image"
                :src="fixBlobUrl(image)"
                mode="aspectFit"
                lazy-load
                @click="handleImageClick(index)"
                @error="handleImageError"
              />
            </swiper-item>
          </swiper>
        </view>

        <view class="basic-info-section">
          <view class="model-header">
            <text class="model-name">{{ modelInfo.name }}</text>

            <view class="author-info" @click="handleAuthorClick">
              <image
                class="author-avatar"
                :src="fixBlobUrl(modelInfo.authorAvatar)"
                mode="aspectFill"
                lazy-load
                @error="handleImageError"
              />
              <text class="author-name">{{ modelInfo.author }}</text>
            </view>
          </view>

          <view v-if="modelInfo.description" class="model-description">
            <text class="description-text" :class="{ expanded: isDescriptionExpanded }">{{
              modelInfo.description
            }}</text>
            <text class="expand-btn" v-if="showExpandBtn" @click="toggleDescription">
              {{ isDescriptionExpanded ? texts.collapse : texts.expand }}
            </text>
          </view>

          <view class="model-details">
            <view class="detail-item">
              <text class="detail-label">{{ texts.category }}：</text>
              <text class="detail-value">{{ getCategoryDisplayName(modelInfo.category) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">{{ texts.copyright }}：</text>
              <text class="detail-value">{{ modelInfo.copyright }}</text>
            </view>
          </view>

          <view class="print-section">
            <text class="section-title">{{ texts.printInfo }}</text>
            <view class="print-list">
              <view
                v-for="(model, index) in printModels"
                :key="index"
                class="print-item"
                @click="handlePrintModelClick(model)"
              >
                <image
                  class="print-image"
                  :src="model.image"
                  mode="aspectFit"
                  lazy-load
                  @error="handleImageError"
                />
                <view class="print-details">
                  <text class="print-name">{{ model.name }}</text>
                  <text class="print-size">{{ texts.size }}：{{ model.size }}</text>
                  <text class="print-time"
                    >{{ texts.printTime }}：{{ model.printTime }}{{ texts.minutes || '分钟' }}</text
                  >
                  <text class="print-filament" v-if="model.filamentLength"
                    >{{ texts.filament || '耗材' }}：{{ model.filamentLength }}</text
                  >
                </view>
              </view>
            </view>
          </view>

          <view class="showcase-section">
            <view class="section-header">
              <text class="section-title">{{ texts.showcase }}</text>
              <!-- <view class="create-post-btn" @click="handleCreatePost">
                <uni-icons type="plus" size="14" color="#fff"></uni-icons>
                <text class="btn-text">发布</text>
              </view> -->
            </view>
            <view class="showcase-waterfall">
              <WaterfallLayout
                :left-list="showcaseLeftList"
                :right-list="showcaseRightList"
                @card-click="handleWorkClick"
                @like-click="handleWorkLike"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="toolbar-container">
      <view class="toolbar">
        <view class="toolbar-left">
          <view class="toolbar-item" :class="{ liked: modelInfo.isLiked }" @click="handleLike">
            <image
              class="toolbar-icon"
              :src="
                modelInfo.isLiked
                  ? '/static/images/icon/like_active.png'
                  : '/static/images/icon/like.png'
              "
              mode="aspectFit"
            />
            <text class="toolbar-text">{{ modelInfo.likes }}</text>
          </view>
          <view
            class="toolbar-item collected"
            :class="{ active: modelInfo.isCollected }"
            @click="handleCollect"
          >
            <image
              class="toolbar-icon"
              :src="
                modelInfo.isCollected
                  ? '/static/images/icon/star_active.png'
                  : '/static/images/icon/star.png'
              "
              mode="aspectFit"
            />
            <text class="toolbar-text">{{ modelInfo.collections }}</text>
          </view>
          <!-- <view class="toolbar-item delete-item" @click="handleDelete">
            <uni-icons class="delete-icon" type="trash" size="24" color="#666"></uni-icons>
            <text class="toolbar-text">删除</text>
          </view> -->
        </view>
        <view class="toolbar-right">
          <view class="toolbar-item primary" @click="handlePrint">
            <text class="toolbar-text">{{ texts.print }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import WaterfallLayout from '@/components/waterfall-layout/waterfall-layout.vue'
import { addFavorite, cancelFavorite, getFavoriteModels } from '@/api/userFavorite.ts'
import {
  getModelDetail,
  getModelList,
  deleteModel,
  likeModel,
  unlikeModel,
  checkModelLike,
  getModelPage
} from '@/api/models.ts'
import { getPostList, toggleLike, checkLikeStatus } from '@/api/community.ts'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface ModelInfo {
  id: string
  name: string
  description: string
  category: string
  copyright: string
  images: string[]
  likes: number
  collections: number
  isLiked: boolean
  isCollected: boolean
  author: string
  authorAvatar: string
  modelFile?: string
}

interface PrintModel {
  id: string | number
  name: string
  image: string
  modelFile?: string
  size: string
  printTime: string
  filamentLength?: string
}

interface ShowcaseWork {
  id: string | number
  image: string
  likes: number
  isLiked: boolean
  likeCount: number
  userName?: string
  userAvatar?: string
  info?: string
  desc?: string
  title?: string
}

export default {
  components: {
    CustomNavbar,
    SafeArea,
    WaterfallLayout
  },
  data() {
    return {
      modelId: null as string | number | null,
      currentCarouselIndex: 0 as number,
      loading: true as boolean,
      modelInfo: {
        id: '',
        name: '',
        description: '',
        category: '',
        copyright: '',
        images: [] as string[],
        likes: 0,
        collections: 0,
        isLiked: false,
        isCollected: false,
        author: '',
        authorAvatar: ''
      } as ModelInfo,
      printModels: [] as PrintModel[],
      showcaseWorks: [] as ShowcaseWork[],
      isDescriptionExpanded: false as boolean,
      showExpandBtn: false as boolean
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    userStore(): any {
      return useUserStore()
    },
    texts(): any {
      return this.languageStore.texts.explore
    },
    showcaseLeftList(): ShowcaseWork[] {
      return this.showcaseWorks.filter((_, i) => i % 2 === 0)
    },
    showcaseRightList(): ShowcaseWork[] {
      return this.showcaseWorks.filter((_, i) => i % 2 === 1)
    }
  },
  onLoad(options: any): void {
    this.languageStore.loadLanguage()
    if (options.id) {
      this.modelId = options.id
      this.loadModelDetail(options.id)
    } else {
      uni.showToast({
        title: this.texts.modelIdNotExist,
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }

    uni.$on('postDeleted', (deletedPostId: string | number) => {
      if (this.modelId) {
        this.refreshShowcaseWorks()
      }
    })

    uni.$on('postCreated', (modelId: string | number) => {
      if (modelId && String(modelId) === String(this.modelId)) {
        this.refreshShowcaseWorks()
      }
    })
  },
  onUnload(): void {
    uni.$off('postDeleted')
    uni.$off('postCreated')
  },
  onShow(): void {
    if (this.modelId) {
      const needRefreshModelId = uni.getStorageSync('needRefreshShowcase')
      if (needRefreshModelId && String(needRefreshModelId) === String(this.modelId)) {
        console.log('检测到需要刷新作品展示，modelId:', this.modelId)
        uni.removeStorageSync('needRefreshShowcase')
        this.refreshShowcaseWorks()
      } else {
        this.refreshShowcaseWorks()
      }
    }
  },
  methods: {
    async refreshShowcaseWorks(): Promise<void> {
      if (!this.modelId) return
      await this.checkFavoriteStatus()
      await this.loadShowcaseWorks()
    },
    async loadShowcaseWorks(): Promise<void> {
      if (!this.modelId) return
      if (!this.userStore.isLoggedIn) {
        this.showcaseWorks = []
        return
      }
      try {
        const res: any = await getPostList({
          current: 1,
          size: 100
        })

        if (res.code === 0 || res.code === 1) {
          const records = res.data?.records || res.data || []
          this.showcaseWorks = records
            .filter((post: any) => String(post.modelId) === String(this.modelId))
            .map((post: any) => ({
              ...post,
              id: post.postId,
              image: post.imageUrls?.[0] || '/static/images/3Dprinter.png',
              likes: post.likeCount || 0,
              isLiked: post.isLiked || false,
              userName: post.username,
              userAvatar: post.avatarUrl
            }))
          this.checkWorksLikeStatus()
        }
      } catch (error: any) {
        console.error('加载晒物作品失败:', error)
      }
    },

    async checkWorksLikeStatus(): Promise<void> {
      for (const work of this.showcaseWorks) {
        if (!work.id || String(work.id).includes('mock')) continue
        try {
          const res: any = await checkLikeStatus('POST', String(work.id))
          if (res.code === 0 || res.code === 1) {
            work.isLiked = res.data
          }
        } catch (e: any) {
        }
      }
    },
    checkDescriptionLength(): void {
      const text = this.modelInfo.description || ''
      const avgCharsPerLine = 20
      const estimatedLines = Math.ceil(text.length / avgCharsPerLine)
      this.showExpandBtn = estimatedLines > 5
    },
    async checkFavoriteStatus(): Promise<void> {
      if (!this.userStore.isLoggedIn) return
      try {
        const res: any = await getFavoriteModels()
        if (res.code === 1 && res.data) {
          const isCollected = res.data.some((item: any) => String(item.modelId) === String(this.modelId))
          this.modelInfo.isCollected = isCollected
          console.log('检查收藏状态:', isCollected)
        }
      } catch (error: any) {
        console.error('检查收藏状态失败:', error)
      }
    },
    toggleDescription(): void {
      this.isDescriptionExpanded = !this.isDescriptionExpanded
    },
    async loadModelDetail(id: string | number): Promise<void> {
      if (!id || String(id) === 'NaN' || String(id) === 'undefined') {
        this.loading = false
        uni.showToast({
          title: this.texts.modelIdNotExist || '模型不存在',
          icon: 'none'
        })
        return
      }

      this.loading = true
      try {
        const isLoggedIn = this.userStore.isLoggedIn

        const detailRes: any = await getModelDetail(id)
        if (!detailRes || (detailRes.code !== 0 && detailRes.code !== 1)) {
          throw new Error(detailRes?.msg || '获取详情失败')
        }

        const data = detailRes.data || {}
        const fixImageUrl = (url: string): string => {
          if (!url) return ''
          return url
            .replace('localhost:9000', '47.102.212.37:9000')
            .replace('api/uploads/image', '9000/image')
        }

        this.modelInfo = {
          id: String(id),
          name: data.name || '',
          description: data.description || '',
          category: data.category,
          copyright: data.copyright || data.Copyright,
          images: data.previewUrl
            ? [fixImageUrl(data.previewUrl)]
            : ['/static/images/3Dprinter.png'],
          likes: data.likeCount || data.likeNum || this.modelInfo.likes || 0,
          collections: data.collectCount || data.collectNum || this.modelInfo.collections || 0,
          isLiked: data.isLiked || false,
          isCollected: this.modelInfo.isCollected || false,
          author: data.username || data.nickname || data.userName || '',
          authorAvatar:
            data.authorAvatar || data.avatarUrl || data.avatar || data.userAvatar
              ? fixImageUrl(data.authorAvatar || data.avatarUrl || data.avatar || data.userAvatar)
              : '/static/images/Default avatar.png',
          modelFile: fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || '')
        }

        try {
          const [pageRes, likeRes] = await Promise.all([
            getModelPage({ current: 1, size: 1, name: data.name }).catch(() => null),
            checkModelLike(id).catch(() => null)
          ])

          if (pageRes && (pageRes as any).code === 1 && (pageRes as any).data && (pageRes as any).data.records) {
            const modelFromPage = (pageRes as any).data.records.find((m: any) => String(m.modelId) === String(id))
            if (modelFromPage) {
              this.modelInfo.likes = modelFromPage.likeCount || 0
              this.modelInfo.isLiked = modelFromPage.isLiked || false
            }
          }
          if (likeRes && (likeRes as any).code === 1) {
            this.modelInfo.isLiked = (likeRes as any).data === true
          }
        } catch (e: any) {
          console.warn('获取点赞信息失败:', e)
        }

        if (isLoggedIn) {
          try {
            const favoriteRes = await getFavoriteModels().catch(() => null)
            if (favoriteRes && (favoriteRes as any).code === 1 && (favoriteRes as any).data) {
              this.modelInfo.isCollected = (favoriteRes as any).data.some(
                (item: any) => String(item.modelId) === String(id)
              )
            }
          } catch (e: any) {
            console.warn('获取收藏状态失败:', e)
          }
        }

        let modelParam: any = {}
        try {
          if (data.modelParam) {
            modelParam =
              typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
          }
        } catch (e: any) {}

        let dimensions = modelParam.dimensions || modelParam.size || modelParam.modelSize || ''
        let printTimeMinutes =
          modelParam.print_time_minutes ||
          modelParam.printTime ||
          modelParam.printDuration ||
          modelParam.estimatedTime ||
          ''
        let filamentLength = modelParam.filament_length_m || modelParam.filamentLength || ''

        this.printModels = [
          {
            id: id,
            name: data.name || '',
            image: fixImageUrl(data.previewUrl) || '/static/images/3Dprinter.png',
            modelFile: fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || ''),
            size: dimensions,
            printTime: this.formatPrintTime(printTimeMinutes),
            filamentLength: filamentLength ? `${filamentLength}m` : ''
          }
        ]
        this.checkDescriptionLength()
        this.loading = false
        this.loadShowcaseWorks()
      } catch (error: any) {
        this.loading = false
        uni.showToast({
          title: error.message || this.texts.loadFailed,
          icon: 'none'
        })
      }
    },

    handleBack(): void {
      uni.navigateBack()
    },

    fixBlobUrl(url: string): string {
      if (!url) return ''
      if (typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('file://'))) {
        return '/static/images/3Dprinter.png'
      }
      return url
    },

    handleMore(): void {
      uni.showActionSheet({
        itemList: [
          this.texts.share || '分享',
          this.texts.report || '举报',
          this.texts.collect || '收藏'
        ],
        success: (res: any) => {
          switch (res.tapIndex) {
            case 0:
              this.handleShare()
              break
            case 1:
              uni.showToast({ title: this.texts.reportSuccess || '举报成功', icon: 'success' })
              break
            case 2:
              this.handleCollect()
              break
          }
        }
      })
    },

    async handleLike(): Promise<void> {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
        return
      }

      this.modelInfo.isLiked = !this.modelInfo.isLiked
      this.modelInfo.likes += this.modelInfo.isLiked ? 1 : -1

      try {
        const res: any = this.modelInfo.isLiked
          ? await likeModel(this.modelId)
          : await unlikeModel(this.modelId)
        if (res.code !== 1) {
          this.modelInfo.isLiked = !this.modelInfo.isLiked
          this.modelInfo.likes += this.modelInfo.isLiked ? 1 : -1
          uni.showToast({
            title: res.msg || this.texts.operationFailed,
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: this.modelInfo.isLiked ? this.texts.likeSuccess : this.texts.cancelLike,
            icon: 'success'
          })
          uni.$emit('modelLikeChanged', {
            modelId: this.modelId,
            isLiked: this.modelInfo.isLiked,
            likes: this.modelInfo.likes
          })
        }
      } catch (error: any) {
        this.modelInfo.isLiked = !this.modelInfo.isLiked
        this.modelInfo.likes += this.modelInfo.isLiked ? 1 : -1
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: error.message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },

    async handleCollect(): Promise<void> {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
        return
      }

      this.modelInfo.isCollected = !this.modelInfo.isCollected
      this.modelInfo.collections += this.modelInfo.isCollected ? 1 : -1

      try {
        if (this.modelInfo.isCollected) {
          await addFavorite(this.modelId)
        } else {
          await cancelFavorite(this.modelId)
        }

        uni.showToast({
          title: this.modelInfo.isCollected ? this.texts.collectSuccess : this.texts.cancelCollect,
          icon: 'success'
        })
      } catch (error: any) {
        this.modelInfo.isCollected = !this.modelInfo.isCollected
        this.modelInfo.collections += this.modelInfo.isCollected ? 1 : -1

        uni.showToast({
          title: error.message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },
    async updateModelCount(): Promise<void> {
      try {
        const res: any = await getModelPage({ current: 1, size: 100 })
        if (res.code === 1 && res.data && res.data.records) {
          const model = res.data.records.find((m: any) => String(m.modelId) === String(this.modelId))
          if (model) {
            this.modelInfo.collections = model.collectCount || 0
            this.modelInfo.likes = model.likeCount || 0
          }
        }
      } catch (error: any) {
        console.error('更新模型数量失败:', error)
      }
    },

    handleShare(): void {
      uni.showShareMenu({
        withShareTicket: true
      })
    },

    handleCreatePost(): void {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: `/pages/explore/createPost/createPost?modelId=${this.modelId}&modelName=${encodeURIComponent(this.modelInfo.name)}&modelImage=${encodeURIComponent(this.modelInfo.images[0] || '')}`
      })
    },

    handlePrint(): void {
      const modelId = this.modelInfo.id || this.modelId || ''
      const modelName = this.modelInfo.name || '3D模型'
      const modelUrl = this.modelInfo.modelFile || (this.modelInfo.images && this.modelInfo.images[0]) || ''

      const ext = modelUrl.split('.').pop()?.toLowerCase() || ''
      if (ext === 'gcode') {
        uni.showModal({
          title: this.texts.formatNotSupported,
          content: this.texts.formatNotSupportedMsg,
          showCancel: false
        })
        return
      }

      const printModel = this.printModels[0] || {}
      const dimensions = {
        x: 0,
        y: 0,
        z: 0
      }

      if (printModel.size) {
        const sizeMatch = printModel.size.match(/([\d.]+)mm[^\d]+([\d.]+)mm[^\d]+([\d.]+)mm/)
        if (sizeMatch) {
          dimensions.x = parseFloat(sizeMatch[1])
          dimensions.y = parseFloat(sizeMatch[2])
          dimensions.z = parseFloat(sizeMatch[3])
        }
      }

      const modelImage = this.modelInfo.images[0] || ''
      uni.navigateTo({
        url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelName)}&url=${encodeURIComponent(modelUrl)}&dimensions=${encodeURIComponent(JSON.stringify(dimensions))}&modelImage=${encodeURIComponent(modelImage)}`
      })
    },

    handleCarouselChange(e: any): void {
      this.currentCarouselIndex = e.detail.current
    },

    handleImageClick(index: number): void {
      uni.previewImage({
        urls: this.modelInfo.images,
        current: index
      })
    },

    handleImageError(e: any): void {
      e.target.src = '/static/images/3Dprinter.png'
    },

    handleAuthorClick(): void {
      uni.showToast({
        title: this.texts.viewAuthorProfile || '查看作者主页',
        icon: 'none'
      })
    },

    async handleDelete(): Promise<void> {
      if (!this.modelId) {
        uni.showToast({ title: this.texts.modelIdNotFound || '模型ID不存在', icon: 'none' })
        return
      }

      uni.showModal({
        title: this.texts.confirmDelete || '确认删除',
        content: this.texts.confirmDeleteModel || '确定要删除这个模型吗？删除后无法恢复。',
        confirmColor: '#FF0000',
        success: async (res: any) => {
          if (res.confirm) {
            uni.showLoading({ title: this.texts.deleting || '删除中...' })
            try {
              const deleteRes: any = await deleteModel(this.modelId || '')
              if (deleteRes.code === 1 || deleteRes.code === 200) {
                uni.hideLoading()
                uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              } else {
                throw new Error(deleteRes.msg || this.texts.deleteFailed || '删除失败')
              }
            } catch (error: any) {
              uni.hideLoading()
              uni.showToast({
                title: error.message || this.texts.deleteFailed || '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    handlePrintModelClick(model: PrintModel): void {
      const dimensions = {
        x: 0,
        y: 0,
        z: 0
      }

      if (model.size) {
        const sizeMatch = model.size.match(/([\d.]+)mm[^\d]+([\d.]+)mm[^\d]+([\d.]+)mm/)
        if (sizeMatch) {
          dimensions.x = parseFloat(sizeMatch[1])
          dimensions.y = parseFloat(sizeMatch[2])
          dimensions.z = parseFloat(sizeMatch[3])
        }
      }

      uni.navigateTo({
        url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${model.id}&name=${encodeURIComponent(model.name)}&url=${encodeURIComponent(model.modelFile || model.image)}&dimensions=${encodeURIComponent(JSON.stringify(dimensions))}`
      })
    },

    handleWorkClick(work: ShowcaseWork): void {
      const workId = work.id || `mock_${Date.now()}`
      const title = work.info || work.desc || work.title || this.modelInfo.name || ''
      const image = work.image || ''

      uni.navigateTo({
        url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?workId=${workId}&image=${encodeURIComponent(image)}&title=${encodeURIComponent(title)}`
      })
    },

    async handleWorkLike(work: ShowcaseWork): Promise<void> {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      work.isLiked = !work.isLiked
      work.likeCount += work.isLiked ? 1 : -1
      work.likes = work.likeCount

      const isMock =
        !work.id ||
        String(work.id).includes('mock') ||
        String(work.id) === '1' ||
        String(work.id) === 'NaN' ||
        String(work.id) === 'undefined'

      if (!isMock) {
        try {
          const res: any = await toggleLike('POST', String(work.id))
          if (res.code === 0 || res.code === 1) {
            const checkRes: any = await checkLikeStatus('POST', String(work.id))
            if (checkRes.code === 0 || checkRes.code === 1) {
              work.isLiked = checkRes.data
            }
          }
        } catch (e: any) {
          console.error('点赞失败:', e)
        }
      } else {
        if (work.id && (String(work.id).startsWith('mock_') || String(work.id) === '1')) {
          const index = this.showcaseWorks.findIndex(w => w.id === work.id)
          if (index !== -1) {
            this.showcaseWorks[index] = { ...work }
          }
        }
      }
    },

    getCategoryDisplayName(category: string): string {
      const categoryMap: Record<string, string> = {
        日用居家: this.texts.dailyUse,
        玩具手办: this.texts.toyFigure,
        时尚穿戴: this.texts.fashionWear,
        数码电器: this.texts.digitalDevice,
        建筑模型: this.texts.architecturalModel,
        艺术创意: this.texts.artCreative
      }

      return categoryMap[category] || category || ''
    },

    formatPrintTime(timeStr: string): string {
      if (!timeStr) return ''

      if (this.languageStore.language === 'en') {
        const match = timeStr.match(/(\d+)小时(\d+)分钟/)
        if (match) {
          const hours = match[1]
          const minutes = match[2]
          return `${hours}h ${minutes}m`
        }

        const hourMatch = timeStr.match(/(\d+)小时/)
        if (hourMatch) {
          return `${hourMatch[1]}h`
        }

        const minuteMatch = timeStr.match(/(\d+)分钟/)
        if (minuteMatch) {
          return `${minuteMatch[1]}m`
        }
      }

      return timeStr
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff9f5;
}

.content-scroll {
  flex: 1;
  height: 0;
  padding-bottom: 140rpx;
}

.content-scroll::-webkit-scrollbar {
  display: none;
}

.model-info-container {
  background: transparent;
}

.carousel-section {
  width: 100%;
  height: 500rpx;
  position: relative;
  margin-bottom: 24rpx;
}

.carousel {
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.basic-info-section {
  padding: 0 24rpx 32rpx;
}

.model-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.model-name {
  font-size: 40rpx;
  color: #1a1a2e;
  font-weight: 700;
  line-height: 1.3;
  display: block;
  margin-bottom: 20rpx;
  letter-spacing: -0.5rpx;
}

.model-stats {
  display: none;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 10rpx;
  transition: all 0.3s;
}

.author-info:active {
  transform: scale(0.98);
}

.author-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5a00 0%, #ff8c00 100%);
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(255, 90, 0, 0.3);
}

.author-name {
  font-size: 24rpx;
  color: #1a1a2e;
  font-weight: 600;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.stat-item:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
}

.stat-item.liked .stat-text {
  color: #ff6b9d;
}

.stat-item.collected.active .stat-text {
  color: #ffd700;
}

.stat-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}

.model-description {
  margin-bottom: 24rpx;
  padding: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.description-text {
  font-size: 28rpx;
  color: #4a4a4a;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-text.expanded {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.expand-btn {
  display: inline-block;
  font-size: 26rpx;
  color: #667eea;
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
  font-weight: 600;
}

.model-details {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #888;
  min-width: 140rpx;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #1a1a2e;
  font-weight: 600;
  flex: 1;
}

.section-title {
  font-size: 36rpx;
  color: #1a1a1a;
  font-weight: 700;
  margin-bottom: 24rpx;
  display: block;
  letter-spacing: 0.5rpx;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8rpx;
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #ff5a00 0%, #ff8c00 100%);
  border-radius: 2rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 4rpx;
}

.create-post-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  background: linear-gradient(135deg, #ff9500, #ff5a00);
  border-radius: 30rpx;
  position: relative;
  overflow: hidden;
}

.create-post-btn .btn-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.create-post-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
}

.create-post-btn:active {
  transform: scale(0.95);
}

.create-post-btn:hover::before {
  left: 100%;
}

.create-post-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.print-section {
  margin-bottom: 32rpx;
}

.print-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.print-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.print-item:active {
  transform: translateY(-4rpx);
}

.print-item:hover {
  transform: translateY(-2rpx);
}

.print-image {
  width: 150rpx;
  height: 150rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 20rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.print-item:hover .print-image {
  transform: scale(1.02);
}

.print-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.print-name {
  font-size: 32rpx;
  color: #1a1a2e;
  font-weight: 700;
  margin-bottom: 4rpx;
  line-height: 44rpx;
}

.print-size,
.print-time,
.print-filament {
  font-size: 28rpx;
  color: #888;
  font-weight: 500;
  line-height: 40rpx;
}

.showcase-section {
  margin-bottom: 40rpx;
  padding: 8rpx;
}

.showcase-waterfall {
  margin-top: 20rpx;
  padding: 0;
}

.toolbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-top: none;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.toolbar {
  display: flex;
  align-items: center;
  height: 96rpx;
  gap: 20rpx;
}

.toolbar-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 32rpx;
}

.toolbar-right {
  flex: 2;
  display: flex;
  justify-content: flex-end;
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.toolbar-item:active {
  transform: scale(0.92);
}

.toolbar-icon {
  width: 40rpx;
  height: 40rpx;
}

.toolbar-item.primary {
  background: #ff5a00;
  color: #fff;
  width: 100%;
  padding: 28rpx 48rpx;
  border-radius: 60rpx;
}

.toolbar-item.primary:active {
  background: #cc4800;
}

.toolbar-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
}

.toolbar-item.primary .toolbar-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.toolbar-item.liked .toolbar-text {
  color: #ff6b9d;
}

.toolbar-item.collected.active .toolbar-text {
  color: #ff5a00;
}

.delete-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff9f5;
  z-index: 1000;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 90, 0, 0.2);
  border-top: 6rpx solid #ff5a00;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}
</style>
