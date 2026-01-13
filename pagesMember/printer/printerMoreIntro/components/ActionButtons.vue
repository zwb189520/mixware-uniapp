<template>
  <view class="action-buttons">
    <view class="action-button" @click="handleReconfigure">
      <text class="button-text">重新配网</text>
    </view>
    <view class="action-button unbind-button" @click="handleUnbind">
      <text class="button-text">解除绑定</text>
    </view>
  </view>
</template>

<script>
import { deleteDevice } from '@/api/devices.js'

export default {
  name: 'ActionButtons',
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleReconfigure() {
        uni.navigateTo({
          url: '/pagesMember/printer/addDevice/addDevice'
        })
      },
    async handleUnbind() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不存在',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '确认解除绑定',
        content: '解除绑定后将无法控制此打印机，确定要继续吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteDevice(this.deviceId)
              uni.showToast({
                title: '已解除绑定',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            } catch (error) {
              uni.showToast({
                title: error.message || '解除绑定失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.action-buttons {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-button {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 44rpx;
  border: 2rpx solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button:active {
  background: #f5f5f5;
}

.unbind-button {
  background: #fff;
  border-color: #ff4d4f;
}

.unbind-button .button-text {
  color: #ff4d4f;
}

.button-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}
</style>
