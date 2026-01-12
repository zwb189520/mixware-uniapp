<template>
  <view class="add-device-page">
    <safe-area />
    <custom-navbar title="添加设备" @back="handleBack" />
    <view class="page-content">
      <view class="wifi-title-section">
        <text class="wifi-title">连接WiFi</text>
      </view>
      <view class="wifi-select-section" @click="handleSelectWiFi">
        <text class="select-label">{{ selectedWiFi || '请选择WiFi' }}</text>
        <text class="select-action">选择</text>
      </view>
      <view class="password-section">
        <input 
          class="password-input" 
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入WiFi密码"
          v-model="wifiPassword"
        />
        <view class="eye-icon" @click="togglePassword">
          <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <view class="tips-section">
        <text class="tips-text">请确保连接的家庭WiFi网络为2.4G网络</text>
      </view>
      <view class="button-section">
        <button class="next-button" @click="handleNext">下一步</button>
      </view>
    </view>
    <WiFiSelectorModal 
      :visible="showWiFiList" 
      @close="handleWiFiListClose"
      @select="handleWiFiSelected"
    />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import WiFiSelectorModal from './components/WiFiSelectorModal.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'AddDevice',
  components: {
    CustomNavbar,
    WiFiSelectorModal,
    SafeArea
  },
  data() {
    return {
      wifiPassword: '',
      showPassword: false,
      selectedWiFi: '',
      showWiFiList: false
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    handleSelectWiFi() {
      this.showWiFiList = true
    },
    handleWiFiListClose() {
      this.showWiFiList = false
    },
    handleWiFiSelected(wifiName) {
      this.selectedWiFi = wifiName
      this.showWiFiList = false
    },
    handleNext() {
      if (!this.selectedWiFi) {
        uni.showToast({
          title: '请选择WiFi',
          icon: 'none'
        })
        return
      }
      
      if (!this.wifiPassword) {
        uni.showToast({
          title: '请输入WiFi密码',
          icon: 'none'
        })
        return
      }
      
      uni.navigateTo({
        url: `/pages/profile/printer/deviceSuccess/deviceSuccess?printerId=${this.printerId}`
      })
    }
  }
}
</script>

<style scoped>
.add-device-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 40rpx;
}

.wifi-title-section {
  margin-bottom: 40rpx;
}

.wifi-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.wifi-select-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  margin-bottom: 10rpx;
}

.select-label {
  font-size: 32rpx;
  color: #333;
}

.select-action {
  font-size: 32rpx;
  color: #007aff;
}

.password-section {
  position: relative;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-input {
  width: 100%;
  padding: 30rpx;
  padding-right: 80rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  border: none;
}

.eye-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
}

.tips-section {
  margin-bottom: 60rpx;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.next-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}
</style>