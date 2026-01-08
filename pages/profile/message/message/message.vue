<template>
  <view class="message-page">
    <safe-area />
    <message-navbar />
    <message-list ref="messageList" />
  </view>
</template>

<script>
import MessageNavbar from '../components/messageNavbar.vue'
import MessageList from '../components/messageList.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'Message',
  components: {
    MessageNavbar,
    MessageList,
    SafeArea
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
