<template>
  <view class="page-container">
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
        @like-click="handleLike"
        @collect-click="handleCollect"
        @download-click="handleDownload"
        @share-click="handleShare"
      />

      <!-- 3D模型打印信息组件 -->
      <PrintInfo
        :print-models="printModels"
      />

      <!-- 作品展示组件 -->
      <ShowcaseWorks
        :showcase-works="showcaseWorks"
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
import PrintInfo from './components/PrintInfo.vue'
import ShowcaseWorks from './components/ShowcaseWorks.vue'
import BottomToolbar from './components/BottomToolbar.vue'
import { modelApi } from '@/sheep/api/api.js'

export default {
  components: {
    ModelNavbar,
    ModelInfo,
    PrintInfo,
    ShowcaseWorks,
    BottomToolbar
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
    // 从路由参数获取模型ID
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
      try {
        uni.showLoading({
          title: '加载中...'
        })

        const response = await modelApi.getModelDetail(id)
        
        if (response.code === 0 && response.data) {
          const data = response.data
          
          // 处理API数据转换为组件需要的格式
          this.modelInfo = {
            id: data.modelId || id,
            name: data.name || '未命名模型',
            description: data.description || '暂无描述',
            category: data.category || '未分类',
            copyright: data.copyright || '未知',
            images: data.images && data.images.length > 0 
              ? data.images 
              : [data.previewUrl || '/static/img/logo.png'],
            likes: data.likeCount || Math.floor(Math.random() * 1000) + 1,
            collections: data.collectCount || Math.floor(Math.random() * 500) + 1,
            downloads: data.downloadCount || Math.floor(Math.random() * 300) + 1,
            isLiked: false,
            isCollected: false,
            author: data.authorName || `用户${data.userId || '000'}`,
        authorAvatar: data.authorAvatar || '/static/img/logo.png',
          }
        } else {
          console.error('API返回错误:', response.msg)
          this.useMockData()
        }
      } catch (error) {
        console.error('加载模型详情失败:', error)
        uni.showToast({
          title: '加载失败，使用示例数据',
          icon: 'none'
        })
        this.useMockData()
      } finally {
        uni.hideLoading()
      }
    },

    useMockData() {
      // 使用示例数据
      this.modelInfo = {
        id: this.modelId || '1',
        name: '创意机械手臂',
        description: '这是一个精心设计的机械手臂模型，适用于3D打印和教育学习。模型包含多个可动关节，可以模拟真实机械手臂的动作。适合初学者到中级用户，支持PLA和ABS材料打印。',
        category: '机械模型',
        copyright: 'CC BY-NC 4.0',
        images: [
          '/static/img/logo.png',
          '/static/img/logo.png',
          '/static/img/logo.png'
        ],
        likes: 234,
        collections: 156,
        downloads: 89,
        isLiked: false,
        isCollected: false,
        author: '张设计师',
        authorAvatar: '/static/img/logo.png'
      }

      this.printModels = [
        {
          image: '/static/img/logo.png',
          name: '机械臂底座',
          size: '120x80x20mm',
          printTime: '2小时30分钟'
        },
        {
          image: '/static/img/logo.png',
          name: '机械臂关节',
          size: '60x40x30mm',
          printTime: '1小时45分钟'
        },
        {
          image: '/static/img/logo.png',
          name: '机械臂抓手',
          size: '40x30x25mm',
          printTime: '1小时15分钟'
        }
      ]

      this.showcaseWorks = [
        {
          image: '/static/img/logo.png',
          info: 'PLA材质打印效果'
        },
        {
          image: '/static/img/logo.png',
          info: '组装完成效果'
        },
        {
          image: '/static/img/logo.png',
          info: '打印过程展示'
        },
        {
          image: '/static/img/logo.png',
          info: '细节展示'
        }
      ]
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

    handleCollect() {
      this.modelInfo.isCollected = !this.modelInfo.isCollected
      this.modelInfo.isCollected ? this.modelInfo.collections++ : this.modelInfo.collections--
      
      uni.showToast({
        title: this.modelInfo.isCollected ? '收藏成功' : '取消收藏',
        icon: 'success'
      })
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
      uni.showModal({
        title: '3D模型浏览',
        content: '即将进入3D模型浏览界面',
        showCancel: false,
        confirmText: '确定',
        success: () => {
          // 这里可以跳转到3D浏览页面或打开3D模型
          uni.previewImage({
            urls: this.modelInfo.images,
            current: 0
          })
        }
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