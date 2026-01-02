<template>
  <view class="message-page">
    <message-navbar />
    <message-list ref="messageList" />
  </view>
</template>

<script>
import MessageNavbar from './components/message-navbar.vue'
import MessageList from './components/message-list.vue'

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
