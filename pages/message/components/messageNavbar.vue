<template>
  <view class="message-navbar">
    <view class="navbar-left">
      <uni-icons type="left" size="24" @click="handleBack"></uni-icons>
    </view>
    <view class="navbar-title">
      <text>消息</text>
    </view>
    <view class="navbar-right">
      <uni-icons type="gear" size="20" @click="handleSettings"></uni-icons>
      <uni-icons type="trash" size="20" @click="handleClear"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageNavbar',
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleClear() {
      uni.showModal({
        title: '提示',
        content: '确定要清除所有消息吗？',
        success: (res) => {
          if (res.confirm) {
            // 获取消息列表组件实例并清除消息
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const messageListComponent = currentPage.$refs.messageList
            if (messageListComponent) {
              messageListComponent.clearAllMessages()
            }
          }
        }
      })
    },
    handleSettings() {
        uni.navigateTo({
          url: '/pages/message/messageSettings/messageSettings'
        })
      }
  }
}
</script>

<style scoped>
.message-navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.navbar-left {
  width: 60rpx;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.navbar-right {
  display: flex;
  gap: 30rpx;
  width: 60rpx;
  justify-content: flex-end;
}
</style>
