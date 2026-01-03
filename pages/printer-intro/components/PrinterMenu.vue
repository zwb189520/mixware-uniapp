<template>
  <view v-if="visible" class="menu-overlay" @tap="handleClose">
    <view class="menu-content" @tap.stop>
      <view class="menu-item" @tap="handleDeviceInfo">
        <text class="menu-text">打印机设备信息</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="menu-item" @tap="handleCalibration">
        <text class="menu-text">校准功能</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="menu-item" @tap="handleReconfigureNetwork">
        <text class="menu-text">重新配网</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="menu-item" @tap="handleUnbind">
        <text class="menu-text">解除绑定</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterMenu',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleDeviceInfo() {
      this.$emit('device-info')
      this.handleClose()
    },
    handleCalibration() {
      this.$emit('calibration')
      this.handleClose()
    },
    handleReconfigureNetwork() {
      this.$emit('reconfigure-network')
      this.handleClose()
    },
    handleUnbind() {
      this.$emit('unbind')
      this.handleClose()
    }
  }
}
</script>

<style scoped>
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.menu-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 20rpx 0;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 32rpx;
  color: #333;
}
</style>
