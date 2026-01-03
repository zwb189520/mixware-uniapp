<template>
  <view class="printer-intro-page">
    <printer-intro-navbar />
    
    <view class="content-container">
      <printer-name-selector @printer-change="handlePrinterChange" />
      
      <printer-status :status="printerStatus" />
      
      <printer-image />
      
      <printer-progress 
        :progress="progress" 
        :estimated-time="estimatedTime"
      />
      
      <view v-if="showEncouragement" class="encouragement-text">
        <text>你的创造正在诞生，快去打印机旁看看吧！</text>
      </view>
    </view>
  </view>
</template>

<script>
import PrinterIntroNavbar from './components/PrinterIntroNavbar.vue'
import PrinterNameSelector from './components/PrinterNameSelector.vue'
import PrinterStatus from './components/PrinterStatus.vue'
import PrinterImage from './components/PrinterImage.vue'
import PrinterProgress from './components/PrinterProgress.vue'

export default {
  name: 'PrinterIntro',
  components: {
    PrinterIntroNavbar,
    PrinterNameSelector,
    PrinterStatus,
    PrinterImage,
    PrinterProgress
  },
  data() {
    return {
      printerStatus: 'idle',
      progress: 0,
      estimatedTime: '0分钟',
      showEncouragement: true
    }
  },
  methods: {
    handlePrinterChange(printer) {
      console.log('切换打印机:', printer)
    }
  }
}
</script>

<style scoped>
.printer-intro-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
}

.encouragement-text {
  margin-top: 40rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.encouragement-text text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
  text-align: center;
  display: block;
}
</style>
