<template>
  <view v-if="visible" class="wifi-modal-overlay" @tap="handleClose">
    <view class="wifi-modal-content" @tap.stop>
      <!-- 头部 -->
      <view class="modal-header">
        <view class="header-left">
          <uni-icons type="close" size="24" color="#333" @click="handleClose"></uni-icons>
        </view>
        <view class="header-title">
          <text>请选择要连接的WiFi</text>
        </view>
        <view class="header-right">
          <uni-icons type="refreshempty" size="24" color="#007aff" @click="handleRefresh"></uni-icons>
        </view>
      </view>
      
      <!-- 2.4G提示 -->
      <view class="network-tips">
        <text class="tips-text">该设备仅支持2.4GWiFi网络</text>
      </view>
      
      <!-- WiFi列表 -->
      <view class="wifi-list">
        <view 
          v-for="(wifi, index) in wifiList" 
          :key="index"
          class="wifi-item"
          @tap="handleSelectWiFi(wifi)"
        >
          <view class="wifi-info">
            <text class="wifi-name">{{ wifi.ssid }}</text>
          </view>
          <uni-icons type="wifi" size="20" color="#999"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WiFiSelectorModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    wifiList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleRefresh() {
      this.$emit('refresh')
    },
    handleSelectWiFi(wifi) {
      this.$emit('select', wifi.ssid)
    }
  }
}
</script>

<style scoped>
.wifi-modal-overlay {
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

.wifi-modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.header-left,
.header-right {
  width: 60rpx;
}

.header-title {
  flex: 1;
  text-align: center;
}

.header-title text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.network-tips {
  background-color: #e6f2ff;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #007aff;
  text-align: center;
}

.wifi-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.wifi-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.wifi-item:last-child {
  border-bottom: none;
}

.wifi-info {
  flex: 1;
}

.wifi-name {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.wifi-signal {
  display: block;
  font-size: 24rpx;
  color: #999;
}
</style>