<template>
  <view class="page-container">
    <safe-area />
    <!-- 模型导航栏组件 -->
    <ModelNavbar
      :model-name="modelInfo.name || '模型详情'"
      @back-click="handleBack"
      @more-click="handleMore"
    />

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 3D模型简介组件 -->
      <ModelInfo
        :model-info="modelInfo"
        :print-models="printModels"
        :showcase-works="showcaseWorks"
        @like-click="handleLike"
        @collect-click="handleCollect"
        @download-click="handleDownload"
        @share-click="handleShare"
      />
    </scroll-view>

    <!-- 底部工具栏组件 -->
    <BottomToolbar
      :model-info="modelInfo"
      @like-click="handleLike"
      @collect-click="handleCollect"
      @print-click="handlePrint"
    />
  </view>
</template>

<script>
import ModelNavbar from './components/ModelNavbar.vue'
import ModelInfo from './components/ModelInfo.vue'
import BottomToolbar from './components/BottomToolbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { addFavorite, cancelFavorite } from '@/api/userFavorite.js'
import { getModelDetail } from '@/api/models.js'

export default {
  components: {
    ModelNavbar,
    ModelInfo,
    BottomToolbar,
    SafeArea
  },
  data() {
    return {
      modelId: null,
      modelInfo: {
        id: '',
        name: '',
        description: '',
        category: '',
        copyright: '',
        images: [],
        likes: 0,
        collections: 0,
        downloads: 0,
        isLiked: false,
        isCollected: false,
        author: '',
        authorAvatar: ''
      },
      printModels: [],
      showcaseWorks: []
    }
  },
  onLoad(options) {
    if (options.id) {
      this.modelId = options.id
      this.loadModelDetail(options.id)
    } else {
      uni.showToast({
        title: '模型ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    async loadModelDetail(id) {
      uni.showLoading({
        title: '加载中...'
      })
      try {
        console.log('请求模型详情，ID:', id)
        const res = await getModelDetail(id)
        console.log('模型详情API返回:', res)
        const data = res.data
        console.log('data.modelParam:', data.modelParam)
        
        this.modelInfo = {
          id: String(id),
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          copyright: data.copyright || 'CC BY 4.0',
          images: data.previewUrl ? [data.previewUrl] : [],
          likes: data.collectCount || 0,
          collections: data.collectCount || 0,
          downloads: data.downloadCount || 0,
          isLiked: data.isLiked || false,
          isCollected: data.isCollected || false,
          author: data.userId || '',
          authorAvatar: data.previewUrl || '',
          modelFile: data.downloadUrl || data.modelFile || data.modelUrl || ''
        }
        
        let modelParam = {}
        try {
          if (data.modelParam) {
            modelParam = typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
            console.log('解析后的modelParam:', modelParam)
          }
        } catch (e) {
          console.log('解析modelParam失败:', e)
        }
        
        this.printModels = [{
                id: id,
                name: data.name || '模型',
                image: data.previewUrl || '',
                modelFile: data.downloadUrl || data.modelFile || data.modelUrl || '',
                size: modelParam.size || modelParam.modelSize || modelParam.dimensions || '未知',
                printTime: modelParam.printTime || modelParam.printDuration || modelParam.estimatedTime || '未知'
              }]
        console.log('printModels:', this.printModels)
        this.showcaseWorks = data.showcaseWorks || []
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      }
    },

    handleBack() {
      uni.navigateBack()
    },

    handleMore() {
      uni.showActionSheet({
        itemList: ['分享', '举报', '收藏', '下载'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.handleShare()
              break
            case 1:
              uni.showToast({ title: '举报成功', icon: 'success' })
              break
            case 2:
              this.handleCollect()
              break
            case 3:
              this.handleDownload()
              break
          }
        }
      })
    },

    handleLike() {
      this.modelInfo.isLiked = !this.modelInfo.isLiked
      this.modelInfo.isLiked ? this.modelInfo.likes++ : this.modelInfo.likes--
      
      uni.showToast({
        title: this.modelInfo.isLiked ? '点赞成功' : '取消点赞',
        icon: 'success'
      })
    },

    async handleCollect() {
      try {
        if (this.modelInfo.isCollected) {
          await cancelFavorite(this.modelId)
          this.modelInfo.isCollected = false
          this.modelInfo.collections--
          uni.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        } else {
          await addFavorite(this.modelId)
          this.modelInfo.isCollected = true
          this.modelInfo.collections++
          uni.showToast({
            title: '收藏成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
      }
    },

    handleDownload() {
      uni.showLoading({
        title: '准备下载...'
      })

      // 模拟下载过程
      setTimeout(() => {
        uni.hideLoading()
        this.modelInfo.downloads++
        uni.showToast({
          title: '下载开始',
          icon: 'success'
        })
      }, 1500)
    },

    handleShare() {
      uni.showShareMenu({
        withShareTicket: true
      })
    },

    handlePrint() {
      // 进入3D模型基础浏览
      const modelId = this.modelInfo.id || this.modelId || ''
      const modelName = this.modelInfo.name || '3D模型'
      const modelUrl = this.modelInfo.modelFile || this.modelInfo.images[0] || ''
      uni.navigateTo({
        url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelName)}&url=${encodeURIComponent(modelUrl)}`
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.content-scroll {
  flex: 1;
  height: 0;
  padding-bottom: 120rpx;
}

.content-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
</style>