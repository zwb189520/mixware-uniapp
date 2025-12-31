<template>
  <view class="chat-page">
    <ChatNavbar @back-click="handleBackClick" />
    
    <view class="chat-container">
      <scroll-view 
        class="messages-container" 
        scroll-y 
        :scroll-top="scrollTop"
        @scrolltoupper="handleScrollToTop"
      >
        <view v-if="messages.length === 0" class="empty-state">
          <text class="empty-text">开始聊天，描述您想要的图片</text>
        </view>
        
        <view v-for="message in messages" :key="message.id" class="message-wrapper">
          <MessageBubble 
            v-if="message.type !== 'image'" 
            :message="message"
          />
          <ImageMessage 
            v-else 
            :message="message"
            @select="handleImageSelect"
          />
        </view>
      </scroll-view>
      
      <view v-if="selectedImage" class="action-bar">
        <button class="generate-3d-btn" @click="handleGenerate3D">
          <text>生成3D模型</text>
        </button>
      </view>
      
      <ChatInput 
        @send-message="handleSendMessage"
        @receive-message="handleReceiveMessage"
      />
    </view>
  </view>
</template>

<script>
import ChatNavbar from './components/ChatNavbar.vue'
import MessageBubble from './components/MessageBubble.vue'
import ImageMessage from './components/ImageMessage.vue'
import ChatInput from './components/ChatInput.vue'

export default {
  components: {
    ChatNavbar,
    MessageBubble,
    ImageMessage,
    ChatInput
  },
  data() {
    return {
      messages: [],
      selectedImage: null,
      scrollTop: 0
    }
  },
  methods: {
    handleBackClick() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    handleSendMessage(message) {
      this.messages.push(message)
      this.scrollToBottom()
    },
    
    handleReceiveMessage(message) {
      this.messages.push(message)
      this.scrollToBottom()
    },
    
    handleImageSelect(selectedMessage) {
      if (this.selectedImage) {
        this.selectedImage.selected = false
      }
      this.selectedImage = selectedMessage
      selectedMessage.selected = true
    },
    
    handleGenerate3D() {
      uni.navigateTo({
        url: '/pages/3Dpreviewdetail/3Dpreviewdetail'
      })
    },
    
    handleScrollToTop() {
      this.scrollTop = 0
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.messages-container {
  flex: 1;
  padding: 15px;
  background: #f5f5f5;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.message-wrapper {
  margin-bottom: 15px;
}

.action-bar {
  padding: 15px;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.generate-3d-btn {
  width: 100%;
  height: 45px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
}
</style>