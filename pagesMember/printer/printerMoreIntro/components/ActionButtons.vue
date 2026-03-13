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
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  border-radius: 48rpx;
  border: 2rpx solid rgba(255, 107, 53, 0.2);
  cursor: pointer;
  transition: all 0.3s;
}

.action-button:active {
  transform: scale(0.98);
}

.unbind-button {
  background: linear-gradient(135deg, #FFF9F5 0%, #FFE8DC 100%);
  border-color: #FF6B35;
}

.unbind-button .button-text {
  color: #FF6B35;
}

.button-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}
</style>
