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
    loadModelDetail(id) {
      uni.showLoading({
        title: '加载中...'
      })
      setTimeout(() => {
        this.useMockData()
        uni.hideLoading()
      }, 300)
    },

    useMockData() {
      const modelTemplates = [
        { name: '手机支架', desc: '可调节角度的手机支架，支持横竖屏切换，适合各种尺寸手机' },
        { name: '钥匙扣', desc: '个性化钥匙扣，多种款式可选，可定制姓名或图案' },
        { name: '收纳盒', desc: '多层收纳盒，节省桌面空间，可分类存放小物件' },
        { name: '笔筒', desc: '创意笔筒，多种款式，可收纳各种文具用品' },
        { name: '耳机架', desc: '耳机收纳架，简约设计，保护耳机不受损坏' },
        { name: '数据线收纳', desc: '数据线收纳盒，整洁有序，避免线缆缠绕' },
        { name: '手机壳', desc: '个性化手机壳，多种图案，保护手机防摔' },
        { name: '纸巾盒', desc: '创意纸巾盒，多种款式，美观实用' },
        { name: '摆件', desc: '桌面装饰摆件，多种风格，提升空间美感' },
        { name: '收纳架', desc: '多功能收纳架，节省空间，可放置各种物品' },
        { name: '花瓶', desc: '现代简约花瓶，装饰性强，适合各种花卉' },
        { name: '灯具', desc: '创意台灯，可调节亮度，护眼设计' },
        { name: '钟表', desc: '桌面时钟，简约设计，静音运行' },
        { name: '相框', desc: '创意相框，多种尺寸，展示美好回忆' },
        { name: '书签', desc: '个性化书签，多种图案，方便阅读' },
        { name: '杯垫', desc: '创意杯垫，防滑设计，保护桌面' },
        { name: '门挡', desc: '实用门挡，防止门突然关闭' },
        { name: '挂钩', desc: '强力挂钩，可承重，节省空间' },
        { name: '置物架', desc: '墙面置物架，充分利用垂直空间' },
        { name: '工具架', desc: '工具收纳架，整齐存放各种工具' },
        { name: '调料架', desc: '厨房调料架，方便取用调料' },
        { name: '餐具盒', desc: '餐具收纳盒，卫生整洁' },
        { name: '牙刷架', desc: '牙刷收纳架，保持牙刷干燥' },
        { name: '肥皂盒', desc: '创意肥皂盒，防滑设计' },
        { name: '花盆', desc: '创意花盆，多种造型，适合各种植物' },
        { name: '鸟屋', desc: '小鸟屋，为鸟类提供栖息之所' },
        { name: '喂鸟器', desc: '自动喂鸟器，方便鸟类进食' },
        { name: '风铃', desc: '装饰风铃，悦耳动听' },
        { name: '书立', desc: '书本支撑架，保持书本整齐' },
        { name: '文件夹', desc: '文件收纳夹，整理各种文件' }
      ]

      const authorTemplates = [
        '张创客', '李设计师', '王手工', '陈工匠', '刘制作',
        '赵工坊', '创意达人', '手工专家', '小制作', '设计师',
        '制作高手', '打印专家', '艺术家小王', '创客达人', '手工设计师',
        '打印爱好者', '手工制作', '创意工坊', '制作专家', '打印工坊',
        '手工达人', '创意设计', '制作师', '打印师', '工匠达人',
        '设计师', '手工收藏家', '创意设计师', '打印爱好者', '生活制作'
      ]

      const id = parseInt(this.modelId) || 1
      const templateIndex = (id - 1) % modelTemplates.length
      const template = modelTemplates[templateIndex]
      const author = authorTemplates[templateIndex]

      const generateModelImage = (index) => {
        const isPortrait = (index % 2) === 0
        const width = isPortrait ? 400 : 500 + (index % 3) * 100
        const height = isPortrait ? 500 + (index % 4) * 100 : 400
        return `https://picsum.photos/${width}/${height}?random=${index + 1}`
      }

      const modelImageIndex = templateIndex % 100
      const avatarIndex = templateIndex % 50

      this.modelInfo = {
        id: String(id),
        name: template.name,
        description: template.desc + '。这是一个精心设计的3D打印模型，适用于各种打印场景。模型细节丰富，打印效果出色，适合初学者到高级用户使用。支持PLA和ABS材料打印。',
        category: '3D模型',
        copyright: 'CC BY 4.0',
        images: [
          generateModelImage(modelImageIndex),
          generateModelImage(modelImageIndex + 1),
          generateModelImage(modelImageIndex + 2)
        ],
        likes: Math.floor(Math.random() * 2000) + 100,
        collections: Math.floor(Math.random() * 1000) + 50,
        downloads: Math.floor(Math.random() * 500) + 20,
        isLiked: Math.random() > 0.7,
        isCollected: Math.random() > 0.8,
        author: author,
        authorAvatar: `https://picsum.photos/150/150?random=${avatarIndex + 1000}`
      }

      this.printModels = [
        { image: `https://picsum.photos/400/300?random=${templateIndex * 1000 + 1}`, name: '主要部件', size: `${100 + Math.floor(Math.random() * 100)}x${80 + Math.floor(Math.random() * 80)}x${20 + Math.floor(Math.random() * 30)}mm`, printTime: `${1 + Math.floor(Math.random() * 3)}小时${Math.floor(Math.random() * 60)}分钟` },
        { image: `https://picsum.photos/400/300?random=${templateIndex * 1000 + 2}`, name: '次要部件', size: `${60 + Math.floor(Math.random() * 60)}x${40 + Math.floor(Math.random() * 40)}x${20 + Math.floor(Math.random() * 20)}mm`, printTime: `${Math.floor(Math.random() * 2)}小时${Math.floor(Math.random() * 60)}分钟` },
        { image: `https://picsum.photos/400/300?random=${templateIndex * 1000 + 3}`, name: '装饰部件', size: `${40 + Math.floor(Math.random() * 40)}x${30 + Math.floor(Math.random() * 30)}x${10 + Math.floor(Math.random() * 20)}mm`, printTime: `${Math.floor(Math.random() * 60) + 20}分钟` }
      ]

      this.showcaseWorks = [
        { image: `https://picsum.photos/800/600?random=${templateIndex * 10000 + 1}`, info: '正面展示' },
        { image: `https://picsum.photos/600/800?random=${templateIndex * 10000 + 2}`, info: '侧面展示' },
        { image: `https://picsum.photos/800/600?random=${templateIndex * 10000 + 3}`, info: '细节展示' },
        { image: `https://picsum.photos/600/800?random=${templateIndex * 10000 + 4}`, info: '成品展示' }
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
      const modelId = this.modelInfo.id || this.modelId || ''
      const modelName = this.modelInfo.name || '3D模型'
      const modelUrl = this.modelInfo.images[0] || ''
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