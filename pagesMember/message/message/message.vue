<template>
  <view class="message-page">
    <safe-area />
    <custom-navbar title="消息" @back="handleBack">
      <template #right>
        <uni-icons type="gear" size="24" @click="handleSettings"></uni-icons>
        <uni-icons type="trash" size="24" @click="handleClear"></uni-icons>
      </template>
    </custom-navbar>
    <message-list ref="messageList" />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import MessageList from '../components/messageList.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'Message',
  components: {
    CustomNavbar,
    MessageList,
    SafeArea
  },
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
            const messageListComponent = this.$refs.messageList
            if (messageListComponent) {
              messageListComponent.clearAllMessages()
            }
          }
        }
      })
    },
    handleSettings() {
      uni.navigateTo({
        url: '/pagesMember/message/messageSettings/messageSettings'
      })
    }
  }
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}
</style>
