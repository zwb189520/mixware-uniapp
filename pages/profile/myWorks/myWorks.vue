<template>
  <view class="my-works-page">
    <safe-area></safe-area>
    <!-- navbar -->
    <view class="navbar">
      <view class="navbar-left">
        <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>我的作品</text>
      </view>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 作品列表 -->
    <view class="works-container">
      <view class="works-grid">
        <view 
          v-for="(work, index) in worksList" 
          :key="index"
          class="work-item"
          @click="handleWorkClick(work)"
        >
          <WorkCard :work="work" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import WorkCard from './components/WorkCard.vue'
import { getModelRecords, getPrintRecords } from '@/api/operationRecords.js'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'MyWorks',
  components: {
    WorkCard,
    SafeArea
  },
  data() {
    return {
      worksList: [],
      loading: false,
      selectedWork: null,
      showActionSheet: false
    }
  },
  mounted() {
    this.loadWorks()
  },
  methods: {
    async loadWorks() {
      this.loading = true
      console.log('开始加载作品...')
      try {
        this.worksList = [
          {
            id: 1,
            title: '3D打印小熊',
            image: '/static/images/create/camera-card.png',
            printTime: '2小时30分',
            printDate: '2025-12-15',
            type: 'print',
            status: 'completed'
          },
          {
            id: 2,
            title: 'AI生成花瓶',
            image: '/static/images/create/draw-card.png',
            printTime: '-',
            printDate: '2025-12-14',
            type: 'model',
            status: 'completed'
          },
          {
            id: 3,
            title: '创意摆件',
            image: '/static/images/create/transform-card.png',
            printTime: '1小时45分',
            printDate: '2025-12-13',
            type: 'print',
            status: 'completed'
          },
          {
            id: 4,
            title: '卡通人物',
            image: '/static/images/create/chat-card.png',
            printTime: '-',
            printDate: '2025-12-12',
            type: 'model',
            status: 'completed'
          },
          {
            id: 5,
            title: '手机支架',
            image: '/static/images/create/camera-card.png',
            printTime: '45分钟',
            printDate: '2025-12-10',
            type: 'print',
            status: 'completed'
          },
          {
            id: 6,
            title: '装饰灯罩',
            image: '/static/images/create/draw-card.png',
            printTime: '-',
            printDate: '2025-12-08',
            type: 'model',
            status: 'completed'
          }
        ]
        
        console.log('作品列表:', this.worksList)
      } catch (error) {
        console.error('加载作品失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    formatDuration(duration) {
      if (!duration) return '未知'
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      if (hours > 0) {
        return `${hours}小时${minutes}分`
      }
      return `${minutes}分钟`
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    handleBack() {
      uni.navigateBack()
    },
    
    handleWorkClick(work) {
      this.selectedWork = work
      uni.showActionSheet({
        itemList: ['打印海报'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.handlePrintPoster(work)
          }
        }
      })
    },
    
    handlePrintPoster(work) {
      uni.showToast({
        title: '正在生成海报...',
        icon: 'loading'
      })
      
      setTimeout(() => {
        uni.showToast({
          title: '海报生成成功',
          icon: 'success'
        })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.my-works-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.navbar-left {
  width: 60rpx;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #333;
}

.navbar-right {
  width: 60rpx;
}

.works-container {
  padding: 20rpx;
}

.works-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx;
}

.work-item {
  width: 50%;
  padding: 10rpx;
  box-sizing: border-box;
}
</style>
