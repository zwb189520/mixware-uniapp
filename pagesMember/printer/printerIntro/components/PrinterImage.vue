<template>
  <view class="printer-image-container">
    <image 
      class="printer-image" 
      :src="printerImage" 
      mode="aspectFit"
    />
  </view>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: 'PrinterImage',
  data() {
    return {
      printerImage: '/static/images/3Dprinter.png'
    }
  }
}
</script>

<style scoped>
.printer-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  position: relative;
}

.printer-image-container::before {
  content: '';
  position: absolute;
  width: 480rpx;
  height: 480rpx;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.12) 0%, rgba(255, 142, 83, 0.04) 50%, transparent 70%);
  border-radius: 50%;
  animation: glow 3s ease-in-out infinite;
}

.printer-image-container::after {
  content: '';
  position: absolute;
  width: 520rpx;
  height: 520rpx;
  border: 2rpx solid rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  animation: rotate-border 20s linear infinite;
}

@keyframes glow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0.9; }
}

@keyframes rotate-border {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.printer-image {
  width: 440rpx;
  height: 440rpx;
  filter: drop-shadow(0 12rpx 32rpx rgba(0, 0, 0, 0.12));
  position: relative;
  z-index: 1;
  animation: float-printer 4s ease-in-out infinite;
}

@keyframes float-printer {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15rpx); }
}
</style>


