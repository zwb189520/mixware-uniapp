<template>
  <view class="third-party-binding-page">
    <view class="navbar">
      <view class="navbar-left" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">第三方账号绑定</text>
      </view>
      <view class="navbar-right"></view>
    </view>
    
    <view class="content">
      <view class="binding-item">
        <view class="binding-info">
          <view class="binding-icon google-icon">
            <text class="icon-text">G</text>
          </view>
          <view class="binding-details">
            <text class="binding-name">Google</text>
            <text class="binding-status">{{ googleBound ? '已绑定' : '未绑定' }}</text>
          </view>
        </view>
        <view class="binding-action">
          <button v-if="!googleBound" class="bind-btn" @click="handleGoogleBind">绑定</button>
          <button v-else class="unbind-btn" @click="handleGoogleUnbind">解绑</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ThirdPartyBinding',
  data() {
    return {
      googleBound: false
    }
  },
  
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleGoogleBind() {
      uni.showLoading({
        title: '绑定中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        this.googleBound = true
        uni.showToast({
          title: '绑定成功',
          icon: 'success'
        })
      }, 1500)
    },
    
    handleGoogleUnbind() {
      uni.showModal({
        title: '解绑确认',
        content: '确定要解绑Google账号吗？',
        success: (res) => {
          if (res.confirm) {
            this.googleBound = false
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.third-party-binding-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #fff;
  padding-top: env(safe-area-inset-top);
}

.navbar-left,
.navbar-right {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.content {
  padding: 30rpx;
}

.binding-item {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.binding-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.binding-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.google-icon {
  background: linear-gradient(135deg, #4285F4 0%, #34A853 25%, #FBBC05 50%, #EA4335 75%, #4285F4 100%);
}

.google-icon .icon-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.binding-details {
  display: flex;
  flex-direction: column;
}

.binding-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.binding-status {
  font-size: 24rpx;
  color: #999;
}

.binding-action {
  margin-left: 20rpx;
}

.bind-btn {
  padding: 12rpx 32rpx;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.unbind-btn {
  padding: 12rpx 32rpx;
  background: #fff;
  color: #ff4d4f;
  border: 2rpx solid #ff4d4f;
  border-radius: 8rpx;
  font-size: 26rpx;
}
</style>
