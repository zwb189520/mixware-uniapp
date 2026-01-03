<template>
  <view class="printer-image-container">
    <image 
      class="printer-image" 
      :src="printerImage" 
      mode="aspectFit"
    />
  </view>
</template>

<script>
export default {
  name: 'PrinterImage',
  data() {
    return {
      printerImage: '/static/img/printer.png'
    }
  }
}
</script>

<style scoped>
.printer-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.printer-image {
  width: 400rpx;
  height: 400rpx;
}
</style>
