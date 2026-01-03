<template>
  <scroll-view scroll-y class="page-scroll" :scroll-x="false" :show-scrollbar="false">
    <!-- 安全区域 -->
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    
    <!-- 顶部背景组件 -->
    <BackgroundHeader
      background-image="/static/images/explore-bg.png"
      logo-image="/static/images/logo.png"
      welcome-text="欢迎来到Mixware"
    />

    <!-- 白色圆角盖：从搜索框开始向下 -->
    <view class="main-card">
      <!-- 吸顶容器 -->
      <view class="sticky-bar">
        <!-- 搜索栏组件 -->
        <SearchBar
          placeholder="搜索模型"
          :keyword="keyword"
          @search-click="showSearch = true"
          @scan-click="handleScan"
        />

        <!-- 分类标签组件 -->
        <CategoryTabs
          :current-tab="currentTab"
          @tab-change="switchTab"
        />
      </view>

      <!-- 瀑布流布局组件 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <WaterfallLayout
        v-else
        :left-list="leftList"
        :right-list="rightList"
        :current-tab="currentTab"
        @card-click="handleModelClick"
        @like-click="toggleLike"
        @author-click="handleAuthorClick"
      />
    </view>

    <!-- 搜索弹层组件 -->
    <SearchModal
      :visible="showSearch"
      :placeholder="'搜索你感兴趣的内容'"
      :keyword="keyword"
      :hot-tags="hotTags"
      @close="showSearch = false"
      @search="handleSearch"
      @scan="handleScan"
      @camera="handleCamera"
      @tag-click="handleTagClick"
    />
  </scroll-view>
</template>

<script>
import BackgroundHeader from './components/BackgroundHeader.vue'
import SearchBar from './components/SearchBar.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import SearchModal from './components/SearchModal.vue'
import WaterfallLayout from './components/WaterfallLayout.vue'
import { modelApi } from '@/common/api.js'

export default {
  components: {
    BackgroundHeader,
    SearchBar,
    CategoryTabs,
    SearchModal,
    WaterfallLayout
  },
  data() {
    return {
      showSearch: false,
      keyword: '',
      currentTab: 'daily',
      statusBarHeight: 0,
      loading: false,
      hotTags: ['手办', '手机支架', '高达', '收纳', '解压', '盒子', '可动', '我的世界', '钥匙扣', '收纳盒', '伸缩剑', '解压玩具', '摆件', '面具', '海贼王', '纸巾盒', '钢铁侠', 'k2', '挂件', '航模', '马里奥'],
      dailyModels: [],
      hotModels: [],
      categoryModels: []
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.loadModels()
  },
  onShow() {
    if (!this.dailyModels.length || !this.hotModels.length || !this.categoryModels.length) {
      this.loadModels()
    }
  },
  computed: {
    leftList() {
      let src = this.currentTab === 'daily'   ? this.dailyModels
              : this.currentTab === 'hot'     ? this.hotModels
              : this.categoryModels;
      return src.filter((_, i) => i % 2 === 0);
    },
    rightList() {
      let src = this.currentTab === 'daily'   ? this.dailyModels
              : this.currentTab === 'hot'     ? this.hotModels
              : this.categoryModels;
      return src.filter((_, i) => i % 2 === 1);
    }
  },
  methods: {
    async loadModels(params = {}) {
      try {
        this.loading = true
        
        const defaultParams = {
          current: 1,
          size: 20,
          ...params
        }
        
        const response = await modelApi.getModels(defaultParams)
        
        if (response.code === 0 && response.data) {
          const models = response.data.records || []
          
          // 处理API返回的数据结构，转换为组件需要的格式
          const processedModels = models.map(item => ({
            id: item.modelId,
            name: item.name || '未命名模型',
            desc: item.description || '暂无描述',
            image: item.previewUrl || '/static/img/logo.png', // 使用默认图片
            author: `用户${item.userId || '000'}`, // 由于API没有提供用户名，使用userId
            authorAvatar: '/static/img/logo.png', // 使用默认头像
            likes: item.collectCount || Math.floor(Math.random() * 1000) + 1,
            isLiked: false,
            viewCount: item.viewCount || Math.floor(Math.random() * 10000) + 100,
            uploadTime: item.uploadTime,
            category: item.category || '未分类',
            status: item.status || 'active'
          }))
          
          // 根据不同的分类逻辑分配数据
          this.assignModelsToTabs(processedModels)
        } else {
          console.error('API返回错误:', response.msg)
          uni.showToast({
            title: response.msg || '数据加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('加载模型数据失败:', error)
        uni.showToast({
          title: '网络请求失败，请检查网络连接',
          icon: 'none',
          duration: 2000
        })
        // 使用示例数据作为备用
        this.useMockData()
      } finally {
        this.loading = false
      }
    },
    
    assignModelsToTabs(models) {
      if (!models.length) {
        this.useMockData()
        return
      }
      
      // 根据分类字段或其他逻辑来分配数据
      const categories = ['daily', 'hot', 'category']
      const tabData = {
        daily: [],
        hot: [],
        category: []
      }
      
      models.forEach((model, index) => {
        // 简单的分配逻辑：每3个一组分别分配到不同tab
        const tabIndex = index % 3
        const category = categories[tabIndex]
        tabData[category].push(model)
      })
      
      // 确保每个tab至少有6个数据
      Object.keys(tabData).forEach(tab => {
        if (tabData[tab].length < 6) {
          // 如果数据不够，循环使用现有数据
          const needed = 6 - tabData[tab].length
          const mockData = this.getMockDataForTab(tab, needed)
          tabData[tab] = [...tabData[tab], ...mockData]
        }
      })
      
      this.dailyModels = tabData.daily
      this.hotModels = tabData.hot
      this.categoryModels = tabData.category
    },
    
    useMockData() {
      // 使用示例数据作为备用
      const mockData = {
        daily: [
          { id: 1, name: '机械手臂', desc: '适合初学者的机械模型', image: '/static/img/logo.png', author: '张设计师', authorAvatar: '/static/img/logo.png', likes: 234, isLiked: false, viewCount: 1234, category: 'daily' },
          { id: 2, name: '建筑模型', desc: '经典建筑复刻', image: '/static/img/logo.png', author: '李建筑师', authorAvatar: '/static/img/logo.png', likes: 456, isLiked: true, viewCount: 2345, category: 'daily' },
          { id: 3, name: '动漫手办', desc: '热门动漫角色', image: '/static/img/logo.png', author: '王艺术家', authorAvatar: '/static/img/logo.png', likes: 789, isLiked: false, viewCount: 3456, category: 'daily' },
          { id: 4, name: '工具模型', desc: '实用工具设计', image: '/static/img/logo.png', author: '陈工程师', authorAvatar: '/static/img/logo.png', likes: 123, isLiked: false, viewCount: 567, category: 'daily' },
          { id: 5, name: '创意花瓶', desc: '现代简约风格', image: '/static/img/logo.png', author: '刘设计师', authorAvatar: '/static/img/logo.png', likes: 567, isLiked: false, viewCount: 890, category: 'daily' },
          { id: 6, name: '玩具汽车', desc: '儿童益智玩具', image: '/static/img/logo.png', author: '赵创客', authorAvatar: '/static/img/logo.png', likes: 345, isLiked: true, viewCount: 1234, category: 'daily' }
        ],
        hot: [
          { id: 7, name: '创意手机支架', desc: '多功能手机支架', image: '/static/img/logo.png', author: '创意达人', authorAvatar: '/static/img/logo.png', likes: 1234, isLiked: false, viewCount: 5678, category: 'hot' },
          { id: 8, name: '可动机器人', desc: '12自由度机器人', image: '/static/img/logo.png', author: '机器人专家', authorAvatar: '/static/img/logo.png', likes: 987, isLiked: true, viewCount: 4321, category: 'hot' },
          { id: 9, name: '艺术花瓶', desc: '现代艺术风格', image: '/static/img/logo.png', author: '艺术家小王', authorAvatar: '/static/img/logo.png', likes: 654, isLiked: false, viewCount: 2109, category: 'hot' },
          { id: 10, name: '益智拼图', desc: '儿童智力开发', image: '/static/img/logo.png', author: '教育达人', authorAvatar: '/static/img/logo.png', likes: 432, isLiked: false, viewCount: 1876, category: 'hot' },
          { id: 11, name: '创意灯具', desc: '可调节亮度台灯', image: '/static/img/logo.png', author: '灯光设计师', authorAvatar: '/static/img/logo.png', likes: 1567, isLiked: true, viewCount: 3456, category: 'hot' },
          { id: 12, name: '收纳盒', desc: '多层收纳盒', image: '/static/img/logo.png', author: '收纳专家', authorAvatar: '/static/img/logo.png', likes: 876, isLiked: false, viewCount: 2987, category: 'hot' }
        ],
        category: [
          { id: 13, name: '玩具游戏', desc: '益智积木、遥控车', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 128, isLiked: false, viewCount: 654, category: 'category' },
          { id: 14, name: '家居用品', desc: '收纳盒、台灯', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 96, isLiked: false, viewCount: 543, category: 'category' },
          { id: 15, name: '艺术创意', desc: '摆件、花瓶', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 234, isLiked: false, viewCount: 876, category: 'category' },
          { id: 16, name: '教育学习', desc: '拼图、教具', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 67, isLiked: false, viewCount: 432, category: 'category' },
          { id: 17, name: '工具配件', desc: '螺丝盒、扳手', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 189, isLiked: false, viewCount: 765, category: 'category' },
          { id: 18, name: '建筑设计', desc: '桥梁、房屋', image: '/static/img/logo.png', author: '小编', authorAvatar: '/static/img/logo.png', likes: 145, isLiked: false, viewCount: 1098, category: 'category' }
        ]
      }
      
      this.dailyModels = mockData.daily
      this.hotModels = mockData.hot
      this.categoryModels = mockData.category
    },
    
    getMockDataForTab(tab, count) {
      const templates = {
        daily: ['创意小物件', '简约设计', '实用工具'],
        hot: ['热门爆款', '时尚新品', '畅销产品'],
        category: ['分类精品', '特色商品', '推荐项目']
      }
      
      const template = templates[tab] || templates.daily
      const mockData = []
      
      for (let i = 0; i < count; i++) {
        mockData.push({
          id: Date.now() + i,
          name: template[i % template.length] + (i + 1),
          desc: `这是${template[i % template.length]}的描述`,
          image: '/static/img/logo.png',
          author: '示例用户',
          authorAvatar: '/static/img/logo.png',
          likes: Math.floor(Math.random() * 1000) + 1,
          isLiked: false,
          viewCount: Math.floor(Math.random() * 10000) + 100,
          category: tab
        })
      }
      
      return mockData
    },
    
    switchTab(tab) { 
      this.currentTab = tab;
      this.$nextTick(() => {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 });
      });
    },
    handleSearch() { 
      this.searchModels(this.keyword)
      this.showSearch = false
    },
    async searchModels(keyword) {
      if (!keyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        const params = {
          current: 1,
          size: 20,
          name: keyword.trim()
        }
        
        const response = await modelApi.getModels(params)
        
        if (response.code === 0 && response.data) {
          const models = response.data.records || []
          
          const processedModels = models.map(item => ({
            id: item.modelId,
            name: item.name || '未命名模型',
            desc: item.description || '暂无描述',
            image: item.previewUrl || '/static/img/logo.png',
            author: `用户${item.userId || '000'}`,
            authorAvatar: '/static/img/logo.png',
            likes: item.collectCount || Math.floor(Math.random() * 1000) + 1,
            isLiked: false,
            viewCount: item.viewCount || Math.floor(Math.random() * 10000) + 100,
            uploadTime: item.uploadTime,
            category: item.category || 'search',
            status: item.status || 'active'
          }))
          
          // 将搜索结果显示在当前选中的tab中
          const currentTabKey = this.currentTab
          if (currentTabKey === 'daily') {
            this.dailyModels = processedModels.length ? processedModels.slice(0, 6) : this.getMockDataForTab('daily', 6)
          } else if (currentTabKey === 'hot') {
            this.hotModels = processedModels.length ? processedModels.slice(0, 6) : this.getMockDataForTab('hot', 6)
          } else {
            this.categoryModels = processedModels.length ? processedModels.slice(0, 6) : this.getMockDataForTab('category', 6)
          }
          
          uni.showToast({
            title: `找到 ${processedModels.length} 个相关结果`,
            icon: 'success',
            duration: 2000
          })
        } else {
          console.error('搜索API返回错误:', response.msg)
          uni.showToast({
            title: '搜索失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('搜索模型失败:', error)
        uni.showToast({
          title: '搜索请求失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    handleScan() { 
      console.log('扫码');
    },
    handleCamera() {
      console.log('拍照');
    },
    handleTagClick(tag) {
      console.log('点击标签:', tag);
      this.keyword = tag;
      this.searchModels(tag);
    },
    handleModelClick(item) { 
      console.log('点击模型:', item.name);
      uni.navigateTo({
        url: `/pages/modelDetail/modelDetail?id=${item.id}`
      })
    },
    handleAuthorClick(item) {
      console.log('点击作者:', item.author);
    },
    toggleLike(item) {
      item.isLiked = !item.isLiked;
      item.isLiked ? item.likes++ : item.likes--;
    }
  }
}
</script>

<style scoped>
/* 页面级样式 */
.page-scroll {
  height: 100vh;
  background: #f5f5f5;
}

.page-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}

/* 安全区域 */
.safe-area-top {
  width: 100%;
}

/* 白色圆角盖：从搜索框开始向下 */
.main-card {
  background: #fff;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  margin-top: -20rpx;
  padding-top: 20rpx;
  position: relative;
  z-index: 1;
}

/* 吸顶容器 */
.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e0e0e0;
  border-top: 4rpx solid #07C160;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>