<template>
  <view class="my-works-page">
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

export default {
  name: 'MyWorks',
  components: {
    WorkCard
  },
  data() {
    return {
      worksList: [
        {
          id: 1,
          title: '小恐龙模型',
          image: '/static/images/work/work1.jpg',
          printTime: '2小时30分',
          printDate: '2024-01-15'
        },
        {
          id: 2,
          title: '手机支架',
          image: '/static/images/work/work2.jpg',
          printTime: '1小时45分',
          printDate: '2024-01-14'
        },
        {
          id: 3,
          title: '花瓶',
          image: '/static/images/work/work3.jpg',
          printTime: '3小时20分',
          printDate: '2024-01-13'
        },
        {
          id: 4,
          title: '钥匙扣',
          image: '/static/images/work/work4.jpg',
          printTime: '45分钟',
          printDate: '2024-01-12'
        },
        {
          id: 5,
          title: '玩具车',
          image: '/static/images/work/work5.jpg',
          printTime: '4小时10分',
          printDate: '2024-01-11'
        },
        {
          id: 6,
          title: '笔筒',
          image: '/static/images/work/work6.jpg',
          printTime: '1小时15分',
          printDate: '2024-01-10'
        }
      ]
    }
  },
  methods: {
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
