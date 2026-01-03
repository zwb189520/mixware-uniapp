<template>
  <view class="message-page">
    <message-navbar />
    <message-list ref="messageList" />
  </view>
</template>

<script>
import MessageNavbar from '../components/messageNavbar.vue'
import MessageList from '../components/messageList.vue'

export default {
  name: 'Message',
  components: {
    MessageNavbar,
    MessageList
  }
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
