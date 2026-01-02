<template>
  <view class="message-list">
    <view class="message-section">
      <view class="section-title">系统通知</view>
      <view class="message-items">
        <view 
          v-for="item in systemNotifications" 
          :key="item.id" 
          class="message-item"
        >
          <view class="message-icon">
            <uni-icons type="info" size="20" color="#007aff"></uni-icons>
          </view>
          <view class="message-content">
            <view class="message-title">{{ item.title }}</view>
            <view class="message-desc">{{ item.description }}</view>
            <view class="message-time">{{ item.time }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="message-section">
      <view class="section-title">打印通知</view>
      <view class="message-items">
        <view 
          v-for="item in printNotifications" 
          :key="item.id" 
          class="message-item"
        >
          <view class="message-icon">
            <uni-icons type="color" size="20" color="#ff9500"></uni-icons>
          </view>
          <view class="message-content">
            <view class="message-title">{{ item.title }}</view>
            <view class="message-desc">{{ item.description }}</view>
            <view class="message-time">{{ item.time }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageList',
  data() {
    return {
      systemNotifications: [
        {
          id: 1,
          title: '系统维护通知',
          description: '系统将于今晚22:00-24:00进行维护升级',
          time: '2小时前'
        },
        {
          id: 2,
          title: '功能更新',
          description: '新增AI智能推荐功能，快来体验吧！',
          time: '1天前'
        }
      ],
      printNotifications: [
        {
          id: 1,
          title: '打印任务完成',
          description: '您的3D模型"飞机模型"已打印完成',
          time: '30分钟前'
        },
        {
          id: 2,
          title: '打印进度提醒',
          description: '您的打印任务"手机支架"已完成80%',
          time: '1小时前'
        }
      ]
    }
  },
  
  methods: {
    clearAllMessages() {
      this.systemNotifications = []
      this.printNotifications = []
      
      uni.showToast({
        title: '已清除所有消息',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.message-list {
  padding: 20rpx 0;
}

.message-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.message-items {
  background-color: #fff;
}

.message-item {
  display: flex;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.message-item:last-child {
  border-bottom: none;
}

.message-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
  border-radius: 50%;
  margin-right: 20rpx;
}

.message-content {
  flex: 1;
}

.message-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.message-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}
</style>
