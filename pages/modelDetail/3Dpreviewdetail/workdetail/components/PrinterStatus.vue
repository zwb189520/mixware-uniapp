<template>
  <view class="printer-status-container">
    <view class="printer-status-section">
      <text class="section-title">打印机状态</text>
      
      <view class="printer-info">
        <image 
          class="printer-image" 
          :src="printerImage" 
          mode="aspectFit"
          @error="handleImageError"
        />
        <view class="printer-details">
          <text class="printer-name">{{ printerName }}</text>
          <text 
            class="printer-status"
            :class="statusClass"
          >{{ printerStatus }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterStatus',
  props: {
    printerName: {
      type: String,
      default: ''
    },
    printerStatus: {
      type: String,
      default: '空闲'
    },
    printerImage: {
      type: String,
      default: ''
    }
  },
  computed: {
    statusClass() {
      return this.printerStatus === '忙碌' ? 'status-busy' : 'status-idle'
    }
  },
  methods: {
    handleImageError(e) {
      console.log('打印机图片加载失败:', e)
    }
  }
}
</script>

<style scoped>
.printer-status-container {
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.printer-status-section {
  width: 100%;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.printer-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.printer-image {
  width: 100rpx;
  height: 100rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.printer-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.printer-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.printer-status {
  font-size: 24rpx;
  font-weight: 600;
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  align-self: flex-start;
}

.status-busy {
  color: #e53e3e;
  background: #fed7d7;
}

.status-idle {
  color: #38a169;
  background: #c6f6d5;
}
</style>