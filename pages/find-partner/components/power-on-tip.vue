<template>
  <view class="power-on-tip">
    <view class="tip-content">
      <view class="tip-icon">
        <uni-icons type="color" size="40" color="#ff9500"></uni-icons>
      </view>
      <view class="tip-text">
        <text class="tip-title">请先开启您的3D打印机</text>
        <text class="tip-desc">确保打印机处于开机状态且蓝牙功能正常</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PowerOnTip'
}
</script>

<style scoped>
.power-on-tip {
  background-color: #fff3e0;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 12rpx;
  border: 1rpx solid #ffe0b2;
}

.tip-content {
  display: flex;
  align-items: center;
}

.tip-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.tip-text {
  flex: 1;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #ff9500;
  margin-bottom: 8rpx;
}

.tip-desc {
  display: block;
  font-size: 24rpx;
  color: #ffb74d;
}
</style>
