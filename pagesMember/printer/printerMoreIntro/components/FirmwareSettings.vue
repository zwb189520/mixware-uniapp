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

<script lang="ts">
// @ts-nocheck
export default {
  name: 'FirmwareSettings',
  props: {
    deviceInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      firmwareVersion: '-',
      antiShakeEnabled: true
    }
  },
  watch: {
    deviceInfo: {
      handler(newVal) {
        if (newVal && newVal.firmwareVersion) {
          this.firmwareVersion = newVal.firmwareVersion
        }
      },
      immediate: true
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
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 107, 53, 0.08);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}

.setting-value {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 600;
}

.switch-container {
  cursor: pointer;
}

.switch {
  width: 96rpx;
  height: 48rpx;
  background: rgba(255, 107, 53, 0.15);
  border-radius: 24rpx;
  position: relative;
  transition: background 0.3s;
}

.switch-active {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
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
}

.switch-active .switch-dot {
  transform: translateX(48rpx);
}
</style>


