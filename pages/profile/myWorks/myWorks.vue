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
      loading: false
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
        const modelRes = await getModelRecords(1, 10)
        console.log('模型记录响应:', modelRes)
        
        const modelWorks = (modelRes.data?.records || []).map(record => ({
          id: record.recordId,
          title: record.resourceId || '模型生成',
          image: '/static/images/work/default.jpg',
          printTime: '-',
          printDate: this.formatDate(record.operationTime),
          type: 'model',
          status: record.status
        }))
        
        this.worksList = modelWorks
        
        try {
          const printRes = await getPrintRecords(1, 10)
          console.log('打印记录响应:', printRes)
          
          const printWorks = (printRes.data?.records || []).map(record => ({
            id: record.recordId,
            title: record.resourceId || '打印任务',
            image: '/static/images/work/default.jpg',
            printTime: '-',
            printDate: this.formatDate(record.operationTime),
            type: 'print',
            status: record.status
          }))
          
          this.worksList = [...this.worksList, ...printWorks]
        } catch (printError) {
          console.log('获取打印记录失败，忽略:', printError)
        }
        
        console.log('作品列表:', this.worksList)
        
        if (this.worksList.length === 0) {
          uni.showToast({
            title: '暂无作品记录',
            icon: 'none'
          })
        }
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
      uni.navigateTo({
        url: `/pages/explore/workDetail/workDetail?workId=${work.id}`
      })
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
