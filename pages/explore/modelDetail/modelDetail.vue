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
              <image class="author-avatar" :src="fixBlobUrl(modelInfo.authorAvatar)" mode="aspectFill" lazy-load @error="handleImageError"/>
              <text class="author-name">{{ modelInfo.author }}</text>
            </view>
          </view>

          <view v-if="modelInfo.description" class="model-description">
            <text class="description-text" :class="{ 'expanded': isDescriptionExpanded }">{{ modelInfo.description }}</text>
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
                  <text class="print-time">{{ texts.printTime }}：{{ model.printTime }}{{ texts.minutes || '分钟' }}</text>
                  <text class="print-filament" v-if="model.filamentLength">{{ texts.filament || '耗材' }}：{{ model.filamentLength }}</text>
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
          <view class="toolbar-item" :class="{ 'liked': modelInfo.isLiked }" @click="handleLike">
            <image class="toolbar-icon" :src="modelInfo.isLiked ? '/static/images/icon/like_active.png' : '/static/images/icon/like.png'" mode="aspectFit"/>
            <text class="toolbar-text">{{ modelInfo.likes }}</text>
          </view>
          <view class="toolbar-item collected" :class="{ 'active': modelInfo.isCollected }" @click="handleCollect">
            <image class="toolbar-icon" :src="modelInfo.isCollected ? '/static/images/icon/star_active.png' : '/static/images/icon/star.png'" mode="aspectFit"/>
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
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import WaterfallLayout from '@/components/waterfall-layout/waterfall-layout.vue'
import { addFavorite, cancelFavorite, getFavoriteModels } from '@/api/userFavorite.ts'
import { getModelDetail, getModelList, deleteModel, likeModel, unlikeModel, checkModelLike, getModelPage } from '@/api/models.ts'
import { getPostList, toggleLike, checkLikeStatus } from '@/api/community.ts'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  components: {
    CustomNavbar,
    SafeArea,
    WaterfallLayout
  },
  data() {
    return {
      modelId: null,
      currentCarouselIndex: 0,
      loading: true, // 添加加载状态
      modelInfo: {
        id: '',
        name: '',
        description: '',
        category: '',
        copyright: '',
        images: [],
        likes: 0,
        collections: 0,
        isLiked: false,
        isCollected: false,
        author: '',
        authorAvatar: ''
      },
      printModels: [],
      showcaseWorks: [],
      isDescriptionExpanded: false,
      showExpandBtn: false
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    },
    showcaseLeftList() {
      return this.showcaseWorks.filter((_, i) => i % 2 === 0)
    },
    showcaseRightList() {
      return this.showcaseWorks.filter((_, i) => i % 2 === 1)
    }
  },
  onLoad(options) {
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
    
    uni.$on('postDeleted', (deletedPostId) => {
      if (this.modelId) {
        this.refreshShowcaseWorks()
      }
    })
    
    uni.$on('postCreated', (modelId) => {
      if (modelId && String(modelId) === String(this.modelId)) {
        this.refreshShowcaseWorks()
      }
    })
  },
  onUnload() {
    uni.$off('postDeleted')
    uni.$off('postCreated')
  },
  onShow() {
    if (this.modelId) {
      // 检查是否需要刷新作品展示
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
    // 刷新晒物作品列表
    async refreshShowcaseWorks() {
      if (!this.modelId) return
      await this.checkFavoriteStatus()
      await this.loadShowcaseWorks()
    },
    async loadShowcaseWorks() {
      if (!this.modelId) return
      if (!uni.getStorageSync('isLoggedIn')) {
        this.showcaseWorks = []
        return
      }
      try {
        // 后端按modelId查询有bug，先查询所有帖子再过滤
        const res = await getPostList({
          current: 1,
          size: 100
        })
        
        if (res.code === 0 || res.code === 1) {
          const records = res.data?.records || res.data || []
          this.showcaseWorks = records
            .filter(post => String(post.modelId) === String(this.modelId))
            .map(post => ({
              ...post,
              id: post.postId,
              image: post.imageUrls?.[0] || '/static/images/3Dprinter.png',
              likes: post.likeCount || 0,
              isLiked: post.isLiked || false,
              userName: post.username,
              userAvatar: post.avatarUrl
            }))
          // 后端返回的 isLiked 可能不正确，批量检查真实点赞状态
          this.checkWorksLikeStatus()
        }
      } catch (error) {
        console.error('加载晒物作品失败:', error)
      }
    },

    async checkWorksLikeStatus() {
      // 批量检查每个帖子的点赞状态
      for (const work of this.showcaseWorks) {
        if (!work.id || String(work.id).includes('mock')) continue
        try {
          const res = await checkLikeStatus('POST', work.id)
          if (res.code === 0 || res.code === 1) {
            work.isLiked = res.data
          }
        } catch (e) {
          // 忽略单个检查失败
        }
      }
    },
    checkDescriptionLength() {
      const text = this.modelInfo.description || ''
      const avgCharsPerLine = 20
      const estimatedLines = Math.ceil(text.length / avgCharsPerLine)
      this.showExpandBtn = estimatedLines > 5
    },
    async checkFavoriteStatus() {
      if (!uni.getStorageSync('isLoggedIn')) return
      try {
        const res = await getFavoriteModels()
        if (res.code === 1 && res.data) {
          const isCollected = res.data.some(item => String(item.modelId) === String(this.modelId))
          this.modelInfo.isCollected = isCollected
          console.log('检查收藏状态:', isCollected)
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error)
      }
    },
    toggleDescription() {
      this.isDescriptionExpanded = !this.isDescriptionExpanded
    },
    async loadModelDetail(id) {
      if (!id || String(id) === 'NaN' || String(id) === 'undefined') {
        this.loading = false
        uni.showToast({
          title: this.texts.modelIdNotExist || '模型不存在',
          icon: 'none'
        })
        return
      }

      this.loading = true; // 开始加载
      try {
        const isLoggedIn = uni.getStorageSync('isLoggedIn')
        
        // 1. 首先加载最核心的模型详情
        const detailRes = await getModelDetail(id)
        if (!detailRes || (detailRes.code !== 0 && detailRes.code !== 1)) {
          throw new Error(detailRes?.msg || '获取详情失败')
        }
        
        const data = detailRes.data || {}
        const fixImageUrl = (url) => {
          if (!url) return ''
          return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
        }

        // 2. 初始化基础信息（确保用户能看到东西）
        this.modelInfo = {
          id: String(id),
          name: data.name || '',
          description: data.description || '',
          category: data.category,
          copyright: data.copyright || data.Copyright,
          images: data.previewUrl ? [fixImageUrl(data.previewUrl)] : ['/static/images/3Dprinter.png'],
          likes: data.likeCount || data.likeNum || this.modelInfo.likes || 0,
          collections: data.collectCount || data.collectNum || this.modelInfo.collections || 0,
          isLiked: data.isLiked || false,
          isCollected: this.modelInfo.isCollected || false,
          author: data.username || data.nickname || data.userName || '',
          authorAvatar: data.authorAvatar || data.avatarUrl || data.avatar || data.userAvatar ? fixImageUrl(data.authorAvatar || data.avatarUrl || data.avatar || data.userAvatar) : '/static/images/Default avatar.png',
          modelFile: fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || '')
        }

        // 3. 获取正确的点赞数（从列表接口）和点赞状态
        try {
          const [pageRes, likeRes] = await Promise.all([
            getModelPage({ current: 1, size: 1, name: data.name }).catch(() => null),
            checkModelLike(id).catch(() => null)
          ])
          
          if (pageRes && pageRes.code === 1 && pageRes.data && pageRes.data.records) {
            const modelFromPage = pageRes.data.records.find(m => String(m.modelId) === String(id))
            if (modelFromPage) {
              this.modelInfo.likes = modelFromPage.likeCount || 0
              this.modelInfo.isLiked = modelFromPage.isLiked || false
            }
          }
          if (likeRes && likeRes.code === 1) {
            this.modelInfo.isLiked = likeRes.data === true
          }
        } catch (e) {
          console.warn('获取点赞信息失败:', e)
        }
        
        // 4. 获取收藏状态
        if (isLoggedIn) {
          try {
            const favoriteRes = await getFavoriteModels().catch(() => null)
            if (favoriteRes && favoriteRes.code === 1 && favoriteRes.data) {
              this.modelInfo.isCollected = favoriteRes.data.some(item => String(item.modelId) === String(id))
            }
          } catch (e) {
            console.warn('获取收藏状态失败:', e)
          }
        }
        
        let modelParam = {}
        try {
          if (data.modelParam) {
            modelParam = typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
          }
        } catch (e) {
        }
        
        // 解析尺寸、打印时间和耗材长度
        let dimensions = modelParam.dimensions || modelParam.size || modelParam.modelSize || ''
        let printTimeMinutes = modelParam.print_time_minutes || modelParam.printTime || modelParam.printDuration || modelParam.estimatedTime || ''
        let filamentLength = modelParam.filament_length_m || modelParam.filamentLength || ''
        
        this.printModels = [{
                id: id,
                name: data.name || '',
                image: fixImageUrl(data.previewUrl) || '/static/images/3Dprinter.png',
                modelFile: fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || ''),
                size: dimensions,
                printTime: this.formatPrintTime(printTimeMinutes),
                filamentLength: filamentLength ? `${filamentLength}m` : ''
              }]
        this.checkDescriptionLength()
        this.loading = false; // 结束加载
        this.loadShowcaseWorks()
      } catch (error) {
        this.loading = false; // 确保错误时也结束加载
        uni.showToast({
          title: error.message || this.texts.loadFailed,
          icon: 'none'
        })
      }
    },

    handleBack() {
      uni.navigateBack()
    },

    fixBlobUrl(url) {
      if (!url) return ''
      if (typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('file://'))) {
        return '/static/images/3Dprinter.png'
      }
      return url
    },

    handleMore() {
      uni.showActionSheet({
        itemList: [
          this.texts.share || '分享',
          this.texts.report || '举报',
          this.texts.collect || '收藏'
        ],
        success: (res) => {
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

    async handleLike() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
        return
      }

      // 乐观更新 UI
      this.modelInfo.isLiked = !this.modelInfo.isLiked
      this.modelInfo.likes += this.modelInfo.isLiked ? 1 : -1

      try {
        const res = this.modelInfo.isLiked
          ? await likeModel(this.modelId)
          : await unlikeModel(this.modelId)
        if (res.code !== 1) {
          // 如果后端返回失败，回滚 UI
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
          // 通知 explore 页面更新点赞状态
          uni.$emit('modelLikeChanged', {
            modelId: this.modelId,
            isLiked: this.modelInfo.isLiked,
            likes: this.modelInfo.likes
          })
        }
      } catch (error) {
        // 网络错误回滚 UI
        this.modelInfo.isLiked = !this.modelInfo.isLiked
        this.modelInfo.likes += this.modelInfo.isLiked ? 1 : -1
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: error.message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },

    async handleCollect() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
        return
      }

      // 乐观更新UI
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
      } catch (error) {
        // 回滚UI
        this.modelInfo.isCollected = !this.modelInfo.isCollected
        this.modelInfo.collections += this.modelInfo.isCollected ? 1 : -1
        
        uni.showToast({
          title: error.message || this.texts.operationFailed,
          icon: 'none'
        })
      }
    },
    async updateModelCount() {
      try {
        const res = await getModelPage({ current: 1, size: 100 })
        if (res.code === 1 && res.data && res.data.records) {
          const model = res.data.records.find(m => String(m.modelId) === String(this.modelId))
          if (model) {
            this.modelInfo.collections = model.collectCount || 0
            this.modelInfo.likes = model.likeCount || 0
          }
        }
      } catch (error) {
        console.error('更新模型数量失败:', error)
      }
    },

    handleShare() {
      uni.showShareMenu({
        withShareTicket: true
      })
    },
    
    handleCreatePost() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: `/pages/explore/createPost/createPost?modelId=${this.modelId}&modelName=${encodeURIComponent(this.modelInfo.name)}&modelImage=${encodeURIComponent(this.modelInfo.images[0] || '')}`
      })
    },

    handlePrint() {
      const modelId = this.modelInfo.id || this.modelId || ''
      const modelName = this.modelInfo.name || '3D模型'
      const modelUrl = this.modelInfo.modelFile || this.modelInfo.images[0] || ''
      
      const ext = modelUrl.split('.').pop().toLowerCase()
      if (ext === 'gcode') {
        uni.showModal({
          title: this.texts.formatNotSupported,
          content: this.texts.formatNotSupportedMsg,
          showCancel: false
        })
        return
      }
      
      // 获取尺寸信息
      const printModel = this.printModels[0] || {}
      const dimensions = {
        x: 0,
        y: 0,
        z: 0
      }
      
      // 解析尺寸信息
      if (printModel.size) {
        // 匹配格式：200mm × 150mm × 100mm
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

    handleCarouselChange(e) {
      this.currentCarouselIndex = e.detail.current
    },

    handleImageClick(index) {
      uni.previewImage({
        urls: this.modelInfo.images,
        current: index
      })
    },

    handleImageError(e) {
      e.target.src = '/static/images/3Dprinter.png'
    },

    handleAuthorClick() {
      uni.showToast({
        title: this.texts.viewAuthorProfile || '查看作者主页',
        icon: 'none'
      })
    },
    
    async handleDelete() {
      if (!this.modelId) {
        uni.showToast({ title: this.texts.modelIdNotFound || '模型ID不存在', icon: 'none' })
        return
      }

      uni.showModal({
        title: this.texts.confirmDelete || '确认删除',
        content: this.texts.confirmDeleteModel || '确定要删除这个模型吗？删除后无法恢复。',
        confirmColor: '#FF0000',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: this.texts.deleting || '删除中...' })
            try {
              const deleteRes = await deleteModel(this.modelId)
              if (deleteRes.code === 1 || deleteRes.code === 200) {
                uni.hideLoading()
                uni.showToast({ title: this.texts.deleteSuccess || '删除成功', icon: 'success' })
                // 返回上一页
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              } else {
                throw new Error(deleteRes.msg || this.texts.deleteFailed || '删除失败')
              }
            } catch (error) {
              uni.hideLoading()
              uni.showToast({ title: error.message || this.texts.deleteFailed || '删除失败', icon: 'none' })
            }
          }
        }
      })
    },

    handlePrintModelClick(model) {
      // 解析尺寸信息
      const dimensions = {
        x: 0,
        y: 0,
        z: 0
      }
      
      if (model.size) {
        // 匹配格式：200mm × 150mm × 100mm
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

    handleWorkClick(work) {
      // 跳转到作品详情页
      const workId = work.id || `mock_${Date.now()}`
      const title = work.info || work.desc || work.title || this.modelInfo.name || ''
      const image = work.image || ''
      
      uni.navigateTo({
        url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?workId=${workId}&image=${encodeURIComponent(image)}&title=${encodeURIComponent(title)}`
      })
    },
    
    async handleWorkLike(work) {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      work.isLiked = !work.isLiked
      work.likeCount += work.isLiked ? 1 : -1
      work.likes = work.likeCount

      const isMock = !work.id || String(work.id).includes('mock') || String(work.id) === '1' || String(work.id) === 'NaN' || String(work.id) === 'undefined'

      if (!isMock) {
        try {
          const res = await toggleLike('POST', work.id)
          if (res.code === 0 || res.code === 1) {
            // toggleLike 返回的 data 可能不正确，调用 checkLikeStatus 确认真实状态
            const checkRes = await checkLikeStatus('POST', work.id)
            if (checkRes.code === 0 || checkRes.code === 1) {
              work.isLiked = checkRes.data
            }
          }
        } catch (e) {
          console.error('点赞失败:', e)
        }
      } else {
        // 如果是本地 mock ID，更新本地存储
        if (work.id && (String(work.id).startsWith('mock_') || String(work.id) === '1')) {
          // 更新本地存储的点赞状态
          const index = this.showcaseWorks.findIndex(w => w.id === work.id)
          if (index !== -1) {
            this.showcaseWorks[index] = { ...work }
          }
        }
      }
    },
    
    getCategoryDisplayName(category) {
      // 如果传入的是中文分类，则返回对应语言的显示名称
      const categoryMap = {
        '日用居家': this.texts.dailyUse,
        '玩具手办': this.texts.toyFigure,
        '时尚穿戴': this.texts.fashionWear,
        '数码电器': this.texts.digitalDevice,
        '建筑模型': this.texts.architecturalModel,
        '艺术创意': this.texts.artCreative
      }
      
      // 如果找到对应的分类翻译则返回，否则返回原始值或空字符串
      return categoryMap[category] || category || ''
    },
    
    formatPrintTime(timeStr) {
      if (!timeStr) return ''
      
      // 如果是英文环境，转换时间格式
      if (this.languageStore.language === 'en') {
        // 匹配中文时间格式：4小时30分钟
        const match = timeStr.match(/(\d+)小时(\d+)分钟/)
        if (match) {
          const hours = match[1]
          const minutes = match[2]
          return `${hours}h ${minutes}m`
        }
        
        // 匹配只有小时：4小时
        const hourMatch = timeStr.match(/(\d+)小时/)
        if (hourMatch) {
          return `${hourMatch[1]}h`
        }
        
        // 匹配只有分钟：30分钟
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
  background: #FFF9F5;
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
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.basic-info-section {
  padding: 0 24rpx 32rpx;
}

.model-header {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
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
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
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
  background: rgba(0,0,0,0.05);
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
}

.stat-item.liked .stat-text {
  color: #ff6b9d;
}

.stat-item.collected.active .stat-text {
  color: #FFD700;
}

.stat-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}

.model-description {
  margin-bottom: 24rpx;
  padding: 28rpx;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
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
  background: rgba(102,126,234,0.1);
  border-radius: 20rpx;
  font-weight: 600;
}

.model-details {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 24rpx;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx solid rgba(0,0,0,0.05);
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
  background: linear-gradient(90deg, #FF5A00 0%, #FF8C00 100%);
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
  background: linear-gradient(135deg, #FF9500, #FF5A00);
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
  background: rgba(255,255,255,0.95);
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
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
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
  background: rgba(255,255,255,0.98);
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
  background: #FF5A00;
  color: #fff;
  width: 100%;
  padding: 28rpx 48rpx;
  border-radius: 60rpx;
}

.toolbar-item.primary:active {
  background: #CC4800;
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
  color: #FF5A00;
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
  background: #FFF9F5;
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
  border: 6rpx solid rgba(255,90,0,0.2);
  border-top: 6rpx solid #FF5A00;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}
</style>

