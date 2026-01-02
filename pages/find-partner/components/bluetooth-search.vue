<template>
  <view class="bluetooth-search">
    <view class="search-section">
      <view class="search-header">
        <text class="section-title">蓝牙设备搜索</text>
        <view class="search-controls">
          <view class="toggle-switch" @click="toggleWGFilter">
            <text class="toggle-label">过滤WG</text>
            <view class="switch" :class="{ 'active': isWGFiltered }">
              <view class="switch-ball"></view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="search-actions">
        <view class="search-button" @click="startSearch" :class="{ 'searching': isSearching }">
          <uni-icons type="color" size="20" :color="isSearching ? '#fff' : '#007aff'"></uni-icons>
          <text class="button-text">{{ isSearching ? '搜索中...' : '搜索蓝牙设备' }}</text>
        </view>
      </view>
      
      <view class="device-list" v-if="devices.length > 0">
        <view 
          v-for="device in devices" 
          :key="device.id" 
          class="device-item"
          @click="connectDevice(device)"
        >
          <view class="device-icon">
            <uni-icons type="color" size="24" color="#007aff"></uni-icons>
          </view>
          <view class="device-info">
            <view class="device-name">{{ device.name }}</view>
            <view class="device-id">{{ device.id }}</view>
            <view class="device-signal">信号强度: {{ device.signal }}</view>
          </view>
          <view class="connect-status" :class="{ 'connected': device.isConnected }">
            {{ device.isConnected ? '已连接' : '连接' }}
          </view>
        </view>
      </view>
      
      <view class="no-devices" v-else-if="!isSearching">
        <text>暂无设备，请点击搜索按钮</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BluetoothSearch',
  data() {
    return {
      isWGFiltered: false,
      isSearching: false,
      devices: [
        {
          id: 'device-001',
          name: 'Ender-3 V2',
          signal: '-45dBm',
          isConnected: false
        },
        {
          id: 'device-002', 
          name: 'Prusa i3 MK3S',
          signal: '-52dBm',
          isConnected: false
        }
      ]
    }
  },
  methods: {
    toggleWGFilter() {
      this.isWGFiltered = !this.isWGFiltered
    },
    startSearch() {
      this.isSearching = true
      // 模拟搜索过程
      setTimeout(() => {
        this.isSearching = false
        // 这里可以添加实际搜索蓝牙设备的逻辑
      }, 3000)
    },
    connectDevice(device) {
      if (!device.isConnected) {
        device.isConnected = true
        console.log('连接到设备:', device.name)
      }
    }
  }
}
</script>

<style scoped>
.bluetooth-search {
  padding: 0 30rpx;
}

.search-section {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.search-controls {
  display: flex;
  align-items: center;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.toggle-label {
  font-size: 24rpx;
  color: #666;
}

.switch {
  width: 80rpx;
  height: 40rpx;
  background-color: #ddd;
  border-radius: 20rpx;
  position: relative;
  transition: background-color 0.3s;
}

.switch.active {
  background-color: #007aff;
}

.switch-ball {
  width: 32rpx;
  height: 32rpx;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: left 0.3s;
}

.switch.active .switch-ball {
  left: 44rpx;
}

.search-actions {
  padding: 30rpx;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background-color: #f0f8ff;
  border: 1rpx solid #007aff;
  border-radius: 8rpx;
  gap: 12rpx;
}

.search-button.searching {
  background-color: #007aff;
}

.button-text {
  font-size: 28rpx;
  color: #007aff;
}

.search-button.searching .button-text {
  color: #fff;
}

.device-list {
  border-top: 1rpx solid #f5f5f5;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.device-item:last-child {
  border-bottom: none;
}

.device-icon {
  width: 60rpx;
  height: 60rpx;
  background-color: #f0f8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.device-id {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.device-signal {
  font-size: 22rpx;
  color: #999;
}

.connect-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 20rpx;
}

.connect-status.connected {
  background-color: #e8f5e8;
  color: #52c41a;
}

.no-devices {
  text-align: center;
  padding: 60rpx 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
