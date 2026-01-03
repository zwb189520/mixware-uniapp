<template>
  <view class="firmware-section">
    <view class="section-title">
      <text>固件设置</text>
    </view>
    <view class="setting-item">
      <text class="setting-label">当前固件版本</text>
      <text class="setting-value">{{ firmwareVersion }}</text>
    </view>
    <view class="setting-item">
      <text class="setting-label">防抖功能</text>
      <view class="switch-container" @click="toggleAntiShake">
        <view :class="['switch', { 'switch-active': antiShakeEnabled }]">
          <view class="switch-dot"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FirmwareSettings',
  data() {
    return {
      firmwareVersion: 'v2.1.3',
      antiShakeEnabled: true
    }
  },
  methods: {
    toggleAntiShake() {
      this.antiShakeEnabled = !this.antiShakeEnabled
    }
  }
}
</script>

<style scoped>
.firmware-section {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.setting-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 400;
}

.switch-container {
  cursor: pointer;
}

.switch {
  width: 96rpx;
  height: 48rpx;
  background: #e0e0e0;
  border-radius: 24rpx;
  position: relative;
  transition: background 0.3s;
}

.switch-active {
  background: #4CAF50;
}

.switch-dot {
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.switch-active .switch-dot {
  transform: translateX(48rpx);
}
</style>
