<template>
  <view class="print-button-container">
    <view 
      class="print-button" 
      :class="{ 'print-button-active': isActive }"
      @click="handlePrintClick"
    >
      <text class="print-button-icon">🖨️</text>
      <text class="print-button-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrintButton',
  props: {
    scale: {
      type: Number,
      default: 100
    },
    modelName: {
      type: String,
      default: ''
    }
  },
  computed: {
    isActive() {
      return this.scale > 0
    },
    buttonText() {
      if (this.scale === 0) return '缩放过小'
      if (this.scale < 50) return '缩放过小'
      return '开始打印'
    }
  },
  methods: {
    handlePrintClick() {
      if (this.scale <= 0) {
        uni.showToast({
          title: '请调整缩放比例',
          icon: 'error'
        })
        return
      }
      
      // 跳转到工作详情页面
      uni.navigateTo({
        url: `/pages/modelDetail/3Dpreviewdetail/workdetail/workdetail?workId=001&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent('/static/img/logo.png')}&scale=${this.scale}`
      })
    }
  }
}
</script>

<style scoped>
.print-button-container {
  width: 100%;
}

.print-button {
  width: 100%;
  height: 88rpx;
  background: #e0e0e0;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.print-button-active {
  background: #1296db;
}

.print-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.print-button-icon {
  font-size: 32rpx;
}

.print-button-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #999;
}

.print-button-active .print-button-text {
  color: #fff;
}

.print-button:not(.print-button-active) .print-button-icon {
  filter: grayscale(100%);
}
</style>