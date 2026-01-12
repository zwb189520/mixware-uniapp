<template>
  <scroll-view scroll-y class="page-scroll" :scroll-x="false" :show-scrollbar="false">
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
          :tabs="[
            { label: '每日推荐', value: 'daily' },
            { label: '热门创作', value: 'hot' },
            { label: '其他类目', value: 'category' }
          ]"
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
        v-if="currentTab === 'daily'"
        :left-list="dailyLeftList"
        :right-list="dailyRightList"
        :slide-direction="slideDirection"
        @card-click="handleModelClick"
        @like-click="toggleLike"
        @author-click="handleAuthorClick"
      />
      <WaterfallLayout
        v-if="currentTab === 'hot'"
        :left-list="hotLeftList"
        :right-list="hotRightList"
        :slide-direction="slideDirection"
        @card-click="handleModelClick"
        @like-click="toggleLike"
        @author-click="handleAuthorClick"
      />
      <WaterfallLayout
        v-if="currentTab === 'category'"
        :left-list="categoryLeftList"
        :right-list="categoryRightList"
        :slide-direction="slideDirection"
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
      @close="exploreStore.setShowSearch(false)"
      @search="handleSearch"
      @scan="handleScan"
      @camera="handleCamera"
      @tag-click="handleTagClick"
    />
  </scroll-view>
</template>

<script>
import BackgroundHeader from './components/backgroundHeader.vue'
import SearchBar from './components/SearchBar.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import SearchModal from './components/SearchModal.vue'
import WaterfallLayout from './components/waterfallLayout.vue'
import { getModelPage } from '@/api/models.js'
import { addFavorite, cancelFavorite } from '@/api/userFavorite.js'
import { getHotExamples } from '@/api/session.js'
import { useExploreStore } from '@/stores/explore.js'
import { storeToRefs } from 'pinia'

export default {
  components: {
    BackgroundHeader,
    SearchBar,
    CategoryTabs,
    SearchModal,
    WaterfallLayout
  },
  setup() {
    const exploreStore = useExploreStore()
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
  data() {
    return {
      slideDirection: 'right'
    }
  },
  onLoad() {
    this.exploreStore.initFromStorage()
    this.loadModels()
    this.loadHotTags()
  },
  onShow() {
    if (!this.dailyModels.length || !this.hotModels.length || !this.categoryModels.length) {
      this.loadModels()
    }
  },
  methods: {
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
        console.log('开始调用API...')
        const res = await getModelPage({
          current: params.current || 1,
          size: params.size || 30
        })
        
        console.log('API返回数据:', res)
        
        if (res.code === 1 && res.data && res.data.records) {
          console.log('获取到真实数据:', res.data.records.length, '条')
          this.assignModelsToTabs(res.data.records)
        } else {
          console.log('API返回格式不正确，使用模拟数据')
          this.useMockData()
        }
      } catch (error) {
        console.error('获取模型列表失败:', error)
        this.useMockData()
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
        this.useMockData()
        return
      }
      
      const fixImageUrl = (url) => {
        if (!url) return '/static/images/logo.png'
        return url.replace('localhost:9000', '47.102.212.37:9000')
      }
      
      // 将API数据转换为组件需要的格式 - 优化移动端显示
      const formattedModels = models.map(model => ({
        id: model.modelId,
        name: model.name || '未命名模型',
        desc: model.description || model.name || '暂无描述',
        image: fixImageUrl(model.previewUrl), // 移动端默认图片
        author: model.userId ? model.userId.substring(0, 8) : '匿名用户', // 移动端显示简短用户ID
        authorAvatar: fixImageUrl(model.previewUrl), // 移动端默认头像
        likes: model.collectCount || 0,
        isLiked: false,
        viewCount: model.viewCount || 0,
        category: this.mapCategoryToTab(model.category) // 映射分类到tab
      }))
      
      // 根据分类分配到不同tab - 优化移动端显示数量
      const tabData = {
        daily: formattedModels.filter(m => m.category === 'daily').slice(0, 10), // 移动端限制显示数量
        hot: formattedModels.filter(m => m.category === 'hot' || m.viewCount > 1000).slice(0, 10),
        category: formattedModels.filter(m => m.category !== 'daily' && m.category !== 'hot').slice(0, 10)
      }
      
      // 移动端数据平衡处理
      const totalModels = formattedModels.length
      if (tabData.daily.length === 0 && totalModels > 0) {
        tabData.daily = formattedModels.slice(0, Math.min(8, Math.ceil(totalModels / 3)))
      }
      if (tabData.hot.length === 0 && totalModels > 0) {
        tabData.hot = formattedModels.slice(Math.ceil(totalModels / 3), Math.min(8, Math.ceil(totalModels * 2 / 3)))
      }
      if (tabData.category.length === 0 && totalModels > 0) {
        tabData.category = formattedModels.slice(Math.ceil(totalModels * 2 / 3), Math.min(8, totalModels))
      }
      
      // 移动端最少数据保证 - 减少数量优化性能
      Object.keys(tabData).forEach(tab => {
        if (tabData[tab].length < 4) {
          const needed = 4 - tabData[tab].length
          const mockData = this.getMockDataForTab(tab, needed)
          tabData[tab] = [...tabData[tab], ...mockData]
        }
      })
      
      this.dailyModels = tabData.daily
      this.hotModels = tabData.hot
      this.categoryModels = tabData.category
      
      this.exploreStore.setDailyModels(this.dailyModels)
      this.exploreStore.setHotModels(this.hotModels)
      this.exploreStore.setCategoryModels(this.categoryModels)
    },
    
    useMockData() {
      const mockImages = {
        models: [],
        avatars: []
      }
      
      for (let i = 1; i <= 100; i++) {
        const isPortrait = Math.random() > 0.5
        const width = isPortrait ? 400 : 500 + Math.floor(Math.random() * 200)
        const height = isPortrait ? 500 + Math.floor(Math.random() * 300) : 400
        mockImages.models.push(`https://picsum.photos/${width}/${height}?random=${i}`)
      }
      
      for (let i = 1; i <= 50; i++) {
        mockImages.avatars.push(`https://picsum.photos/150/150?random=${i + 1000}`)
      }
      
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
      
      const generateModels = (tab, startId, count) => {
        const models = []
        for (let i = 0; i < count; i++) {
          const templateIndex = (startId + i - 1) % modelTemplates.length
          const template = modelTemplates[templateIndex]
          const author = authorTemplates[templateIndex]
          
          // 根据模板名称选择合适的图片
          const getItemImage = (itemName, index) => {
            const itemImages = {
              '手机支架': `https://dsfs.oppo.com/omp/1664442731539-_-bb3cbfd7b702401dba597a9945ff5235.png?_w_=1080&_h_=1080`,
              '钥匙扣': `https://cbu01.alicdn.com/img/ibank/O1CN01KfqMGR2GCtPky7Qoa_!!2147728980-0-cib.jpg`,
              '收纳盒': `https://cbu01.alicdn.com/img/ibank/2016/526/617/2894716625_923772813.jpg`,
              '笔筒': `https://pic.616pic.com/ys_bnew_img/00/30/60/rrmZDSIbSs.jpg`,
              '耳机架': `https://cbu01.alicdn.com/img/ibank/O1CN01wg4Nep2K6ifSJGgw1_!!2760789508-0-cib.jpg`,
              '数据线收纳': `https://cbu01.alicdn.com/img/ibank/O1CN01l65E5h1Kk6Uyk4upQ_!!2215467641201-0-cib.jpg`,
              '手机壳': `https://picx.zhimg.com/v2-676e5d88d0ab2a182a2c70c7641a16eb_r.jpg?source=1def8aca`,
              '纸巾盒': `https://cbu01.alicdn.com/img/ibank/O1CN01OpBgvn1eC1NnxIRtx_!!2200827953834-0-cib.jpg`,
              '摆件': `https://cbu01.alicdn.com/img/ibank/2019/347/038/12547830743_1443547778.jpg`,
              '收纳架': `https://cbu01.alicdn.com/img/ibank/O1CN01bCrG481Do2c0g1pL3_!!1085180262-0-cib.jpg`,
              '花瓶': `https://tgi1.jia.com/114/829/14829851.jpg`,
              '灯具': `https://zhongces3.sina.com.cn/product/20230425/7a9149b8e375054d8cfc4c562b49501d.png`,
              '钟表': `https://pic.nximg.cn/file/20210203/31791123_172557126080_2.jpg`,
              '相框': `https://cbu01.alicdn.com/img/ibank/2017/491/765/5294567194_1372921596.jpg`,
              '书签': `https://cbu01.alicdn.com/img/ibank/2019/371/242/11340242173_1674806832.jpg`,
              '杯垫': `https://cbu01.alicdn.com/img/ibank/2018/528/516/9466615825_757688625.jpg`,
              '门挡': `https://img.alicdn.com/i3/2095704141/O1CN01Sf4QI11gScszbxAZM_!!2095704141.jpg`,
              '挂钩': `https://cbu01.alicdn.com/img/ibank/O1CN01DvqZqP2GVffazbzPK_!!2211464189021-0-cib.jpg`,
              '置物架': `https://cbu01.alicdn.com/img/ibank/O1CN017Cwl7Q1GKg1mTjDoh_!!2357510604-0-cib.jpg?__r__=1672638415033`,
              '工具架': `https://cbu01.alicdn.com/img/ibank/O1CN01kKFk0Q1GXxUgzfR8K_!!1962070633-0-cib.jpg?__r__=1665193105817`,
              '调料架': `https://cbu01.alicdn.com/img/ibank/O1CN01HOWwRP1rexIs87L99_!!2211405535657-0-cib.jpg`,
              '餐具盒': `https://ts3.tc.mm.bing.net/th/id/OIP-C.Au53-tzn8d46q1QDKayxUQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3`,
              '牙刷架': `https://cbu01.alicdn.com/img/ibank/O1CN01ihxRts207p76H907v_!!2210968976803-0-cib.jpg`,
              '肥皂盒': `https://img.alicdn.com/i2/2904479150/O1CN0148Iqan2HSkmWJyyeC_!!2904479150.jpg`,
              '花盆': `https://cbu01.alicdn.com/img/ibank/2015/509/607/1995706905_1672540778.jpg`,
              '鸟屋': `https://ts1.tc.mm.bing.net/th/id/OIP-C.BDYjo5KD9dmKTKKx5hJ6tAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3`,
              '喂鸟器': `https://cbu01.alicdn.com/img/ibank/O1CN01V3vMSB1DNTeC12674_!!2215958830204-0-cib.jpg`,
              '风铃': `https://k.sinaimg.cn/n/sinakd202091s/636/w750h686/20200901/ab59-iypetiv4293040.jpg/w700d1q75cms.jpg?by=cms_fixed_width`,
              '书立': `https://p1.ssl.qhmsg.com/t01f298c5c93b99427a.jpg`,
              '文件夹': `https://pic.nximg.cn/file/20150420/9885883_141443174000_2.jpg`
            }
            return itemImages[itemName] || mockImages.models[index % mockImages.models.length]
          }
          
          models.push({
            id: startId + i,
            name: template.name,
            desc: template.desc,
            image: getItemImage(template.name, templateIndex),
            author: author,
            authorAvatar: mockImages.avatars[templateIndex % mockImages.avatars.length],
            likes: Math.floor(Math.random() * 2000) + 100,
            isLiked: Math.random() > 0.7,
            viewCount: Math.floor(Math.random() * 10000) + 500,
            category: tab
          })
        }
        return models
      }
      
      this.dailyModels = generateModels('daily', 1, 30)
      this.hotModels = generateModels('hot', 31, 30)
      this.categoryModels = generateModels('category', 61, 30)
      
      this.exploreStore.setDailyModels(this.dailyModels)
      this.exploreStore.setHotModels(this.hotModels)
      this.exploreStore.setCategoryModels(this.categoryModels)
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
          image: '/static/images/logo.png',
          author: '示例用户',
          authorAvatar: '/static/images/logo.png',
          likes: Math.floor(Math.random() * 1000) + 1,
          isLiked: false,
          viewCount: Math.floor(Math.random() * 10000) + 100,
          category: tab
        })
      }
      
      return mockData
    },
    
    switchTab(tab) {
      const tabs = ['daily', 'hot', 'category']
      const currentIndex = tabs.indexOf(this.currentTab)
      const newIndex = tabs.indexOf(tab)
      this.slideDirection = newIndex > currentIndex ? 'left' : 'right'
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
            return url.replace('localhost:9000', '47.102.212.37:9000')
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
      console.log('扫码')
    },
    handleCamera() {
      console.log('拍照')
    },
    handleTagClick(tag) {
      console.log('点击标签:', tag)
      this.exploreStore.setKeyword(tag)
      this.searchModels(tag)
    },
    handleModelClick(item) { 
      console.log('点击模型:', item.name);
      uni.navigateTo({
        url: `/pages/explore/modelDetail/modelDetail?id=${item.id}`
      })
    },
    handleAuthorClick(item) {
      console.log('点击作者:', item.author);
    },
    async toggleLike(item) {
      try {
        if (item.isLiked) {
          await cancelFavorite(item.id)
          item.isLiked = false
          item.likes--
          uni.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        } else {
          await addFavorite(item.id)
          item.isLiked = true
          item.likes++
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