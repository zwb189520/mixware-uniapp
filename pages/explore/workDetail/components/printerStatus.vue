<template>
  <view class="printer-status-container">
    <view class="printer-status-section">
      <text class="section-title">{{ texts.printerStatus }}</text>
      
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
          >{{ displayStatus }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

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
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    },
    displayStatus() {
      if (this.printerStatus === '忙碌' || this.printerStatus === 'Busy') {
        return this.texts.busy
      } else if (this.printerStatus === '空闲' || this.printerStatus === 'Idle') {
        return this.texts.idle
      }
      return this.printerStatus
    },
    statusClass() {
      return this.displayStatus === this.texts.busy ? 'status-busy' : 'status-idle'
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
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
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
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
  background: #FFF9F5;
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
  color: #FF5A00;
  background: #FFF9F5;
}

.status-idle {
  color: #7ED321;
  background: #FFF9F5;
}
</style>