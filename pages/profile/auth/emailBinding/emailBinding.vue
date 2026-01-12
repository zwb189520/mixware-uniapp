<template>
  <view class="email-binding-page">
    <safe-area />
    <custom-navbar title="邮箱绑定" @back="handleBack" />
    <view class="content">
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input class="form-input" v-model="email" placeholder="请输入邮箱地址" />
      </view>
      <view class="form-item">
        <text class="form-label">验证码</text>
        <view class="code-input-container">
          <input class="form-input code-input" v-model="code" placeholder="请输入验证码" />
          <button class="code-btn" @click="handleGetCode" :disabled="countdown > 0">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>
      <button class="submit-btn" @click="handleSubmit">确认绑定</button>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'EmailBinding',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      email: '',
      code: '',
      countdown: 0,
      timer: null
    }
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleGetCode() {
      if (!this.email) {
        uni.showToast({
          title: '请输入邮箱地址',
          icon: 'none'
        })
        return
      }
      
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
      
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    },
    
    handleSubmit() {
      if (!this.email || !this.code) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      uni.showToast({
        title: '邮箱绑定成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style scoped>
.email-binding-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 30rpx;
}

.form-item {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 400;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-input-container {
  display: flex;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 200rpx;
  height: 80rpx;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  line-height: 80rpx;
}

.code-btn:disabled {
  background: #ccc;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 40rpx;
}
</style>
