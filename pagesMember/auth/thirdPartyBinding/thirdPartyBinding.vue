<template>
  <view class="third-party-binding-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="content">
      <view class="binding-item">
        <view class="binding-info">
          <view class="binding-icon google-icon">
            <text class="icon-text">G</text>
          </view>
          <view class="binding-details">
            <text class="binding-name">{{ texts.googleBinding }}</text>
            <text class="binding-status">{{ googleBound ? texts.bound : texts.unbound }}</text>
          </view>
        </view>
        <view class="binding-action">
          <button v-if="!googleBound" class="bind-btn" @click="handleGoogleBind">
            {{ texts.bind }}
          </button>
          <button v-else class="unbind-btn" @click="handleGoogleUnbind">{{ texts.unbind }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'ThirdPartyBinding',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      googleBound: false
    }
  },

  mounted() {
    this.languageStore.loadLanguage()
  },

  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.accountSecurity.thirdPartyBinding
    }
  },

  methods: {
    handleBack() {
      uni.navigateBack()
    },

    handleGoogleBind() {
      uni.showLoading({
        title: this.texts.binding
      })

      setTimeout(() => {
        uni.hideLoading()
        this.googleBound = true
        uni.showToast({
          title: this.texts.bindingSuccess,
          icon: 'success'
        })
      }, 1500)
    },

    handleGoogleUnbind() {
      uni.showModal({
        title: this.texts.confirmCancel,
        content: this.texts.confirmCancelContent,
        success: res => {
          if (res.confirm) {
            this.googleBound = false
            uni.showToast({
              title: this.texts.unbindSuccess,
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
  background: #fff9f5;
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
  background: linear-gradient(
    135deg,
    #4285f4 0%,
    #34a853 25%,
    #fbbc05 50%,
    #ea4335 75%,
    #4285f4 100%
  );
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
  font-weight: 400;
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
  background: #ff5a00;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.unbind-btn {
  padding: 12rpx 32rpx;
  background: #fff;
  color: #ff5a00;
  border: 2rpx solid #ff5a00;
  border-radius: 8rpx;
  font-size: 26rpx;
}
</style>
