<template>
  <view class="realtime-progress">
    <view class="progress-section" v-if="isPrinting">
      <view class="encouragement-message">
        <text class="message-text">{{ encouragementMessage }}</text>
      </view>
      
      <view class="printer-animation">
        <view class="printer-body">
          <view class="printer-head" :class="{ 'printing': isPrinting }"></view>
          <view class="printer-bed"></view>
          <view class="filament-output">
            <view class="filament" :style="{ height: filamentHeight + 'rpx' }"></view>
          </view>
        </view>
        <view class="printed-object" v-if="filamentHeight > 50">
          <view class="object-shape"></view>
        </view>
      </view>
      
      <view class="progress-info">
        <view class="progress-bar-container">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progress + '%' }"></view>
          </view>
          <text class="progress-text">{{ progress }}%</text>
        </view>
        <view class="time-info">
          <text class="time-text">预计剩余时间: {{ remainingTime }}</text>
        </view>
      </view>
    </view>
    
    <view class="idle-section" v-else>
      <view class="idle-message">
        <text class="idle-text">打印机待机中</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RealtimeProgress',
  data() {
    return {
      isPrinting: false,
      progress: 0,
      filamentHeight: 0,
      remainingTime: '2小时30分钟',
      encouragementMessage: '你的创造正在诞生，快去打印机旁看看吧！'
    }
  },
  mounted() {
    this.startProgressSimulation()
  },
  methods: {
    startProgressSimulation() {
      // 模拟打印进度
      this.isPrinting = true
      this.progress = 0
      this.filamentHeight = 0
      
      const interval = setInterval(() => {
        if (this.progress >= 100) {
          clearInterval(interval)
          this.isPrinting = false
          this.progress = 100
          this.filamentHeight = 200
          return
        }
        
        this.progress += 1
        this.filamentHeight = this.progress * 2
        
        // 动态更新剩余时间
        const remainingMinutes = Math.floor((100 - this.progress) * 1.5)
        const hours = Math.floor(remainingMinutes / 60)
        const minutes = remainingMinutes % 60
        this.remainingTime = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`
      }, 200)
    }
  }
}
</script>

<style scoped>
.realtime-progress {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}

.encouragement-message {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
}

.message-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 1.5;
}

.printer-animation {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 40rpx;
  min-height: 300rpx;
}

.printer-body {
  position: relative;
  width: 300rpx;
  height: 200rpx;
  background-color: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  margin-right: 40rpx;
}

.printer-head {
  width: 60rpx;
  height: 40rpx;
  background-color: #495057;
  border-radius: 4rpx;
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

.printer-head.printing {
  animation: printingMovement 2s infinite ease-in-out;
}

.printer-bed {
  width: 280rpx;
  height: 120rpx;
  background-color: #dee2e6;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4rpx;
}

.filament-output {
  position: absolute;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 4rpx;
  background-color: #e9ecef;
  border-radius: 2rpx;
}

.filament {
  width: 100%;
  background: linear-gradient(to bottom, #007aff, #0056b3);
  border-radius: 2rpx;
  transition: height 0.3s ease;
}

.printed-object {
  position: absolute;
  bottom: 20rpx;
  right: 40rpx;
}

.object-shape {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
}

.progress-info {
  text-align: center;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff 0%, #0056b3 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #007aff;
  min-width: 80rpx;
}

.time-info {
  margin-top: 20rpx;
}

.time-text {
  font-size: 24rpx;
  color: #666;
}

.idle-section {
  text-align: center;
  padding: 60rpx 0;
}

.idle-text {
  font-size: 32rpx;
  color: #999;
}

@keyframes printingMovement {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10rpx);
  }
}
</style>
