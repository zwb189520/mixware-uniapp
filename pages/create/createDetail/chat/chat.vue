<template>
  <view class="chat-page">
    <safe-area />
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="handleBackClick">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="navbar-title">
        <text>AI助手</text>
      </view>
      <view class="navbar-right">
        <uni-icons type="more-filled" size="24"></uni-icons>
      </view>
    </view>
    
    <!-- 聊天区域 -->
    <scroll-view 
      class="chat-container" 
      scroll-y 
      :scroll-top="scrollTop"
      @scrolltoupper="handleScrollToTop"
      @scrolltolower="handleScrollToBottom"
    >
      <view class="messages-area">
        <view 
          v-for="message in messages" 
          :key="message.id" 
          class="message" 
          :class="message.isUser ? 'user' : 'ai'"
        >
          <!-- 头像 -->
          <view class="avatar" :class="message.isUser ? 'user' : 'ai'">
            <text>{{ message.isUser ? '我' : 'AI' }}</text>
          </view>
          
          <!-- 消息内容 -->
          <view class="message-content">
            <view class="bubble">
              <text v-if="!message.isTyping" class="message-text">{{ message.content }}</text>
              <view v-else class="typing-indicator">
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
              </view>
            </view>
            <view class="message-time">{{ formatTime(message.timestamp) }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入区域 -->
    <view class="input-area">
      <button class="voice-btn" @click="handleVoiceInput">
        <uni-icons type="mic" size="24" color="#666"></uni-icons>
      </button>
      
      <view class="input-wrapper">
        <input 
          v-model="inputMessage"
          class="message-input" 
          placeholder="输入消息..."
          maxlength="500"
          confirm-type="send"
          @confirm="handleSendMessage"
        />
      </view>
      
      <button 
        class="send-btn" 
        :class="{ 'disabled': !inputMessage.trim() || isWaitingForResponse }"
        :disabled="!inputMessage.trim() || isWaitingForResponse"
        @click="handleSendMessage"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script>
import { textToModel } from '@/api/hunyuan3d.js'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    SafeArea
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      scrollTop: 0,
      messageCount: 1,
      isWaitingForResponse: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // 初始化欢迎消息
      this.initWelcomeMessage()
      
      // 每分钟更新时间
      setInterval(() => this.updateAllMessageTimes(), 60000)
    },

    initWelcomeMessage() {
      const welcomeMessage = {
        id: Date.now(),
        type: 'text',
        content: '你好！我是AI 3D模型生成助手。我可以帮你将文字描述转换成3D模型。\n\n你可以这样使用我：\n• 描述你想要生成的3D模型\n• 说明模型风格（如：写实、卡通、科幻等）\n• 指定颜色、形状等具体要求\n• 我会根据你的描述生成对应3D模型\n\n例如："帮我生成一个机器人模型，金属质感，未来风格"\n\n现在就开始创作吧！',
        author: 'AI助手',
        timestamp: new Date(),
        isUser: false
      }
      
      this.messages.push(welcomeMessage)
      this.messageCount++
      this.scrollToBottom()
    },

    handleBackClick() {
      uni.navigateBack({
        delta: 1
      })
    },

    handleSendMessage() {
      const message = this.inputMessage.trim()
      if (!message || this.isWaitingForResponse) return

      // 添加用户消息
      this.addMessage(message, 'user')
      this.inputMessage = ''
      this.isWaitingForResponse = true

      // 模拟AI回复
      setTimeout(() => {
        this.simulateAIResponse(message)
      }, 1000 + Math.random() * 2000)
    },

    addMessage(content, sender) {
      const message = {
        id: Date.now(),
        type: 'text',
        content: content,
        author: sender === 'user' ? '我' : 'AI助手',
        timestamp: new Date(),
        isUser: sender === 'user'
      }
      
      this.messages.push(message)
      this.messageCount++
      this.scrollToBottom()
    },

    async simulateAIResponse(userMessage) {
      try {
        uni.showLoading({
          title: '生成3D模型中...'
        })
        
        const res = await textToModel(userMessage)
        
        uni.hideLoading()
        
        if (res.data && res.data.taskId) {
          const responseMessage = `3D模型生成中，任务ID: ${res.data.taskId}`
          this.addMessageWithTypingEffect(responseMessage)
          
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${res.data.taskId}&name=生成的3D模型&url=${encodeURIComponent('/static/images/explore-bg.png')}`
            })
          }, 1500)
        } else {
          const errorMessage = '生成失败，请重试'
          this.addMessageWithTypingEffect(errorMessage)
        }
      } catch (error) {
        uni.hideLoading()
        const errorMessage = error.message || '生成3D模型失败'
        this.addMessageWithTypingEffect(errorMessage)
      }
    },

    addMessageWithTypingEffect(message) {
      // 先添加AI消息（显示打字效果）
      const typingMessage = {
        id: Date.now(),
        type: 'text',
        content: '',
        author: 'AI助手',
        timestamp: new Date(),
        isUser: false,
        isTyping: true
      }
      
      this.messages.push(typingMessage)
      this.messageCount++
      this.scrollToBottom()
      
      // 模拟打字效果
      let index = 0
      const typingSpeed = 50
      const messageId = typingMessage.id
      
      const typeInterval = setInterval(() => {
        if (index < message.length) {
          const currentMessage = this.messages.find(m => m.id === messageId)
          if (currentMessage) {
            currentMessage.content = message.substring(0, index + 1)
          }
          index++
        } else {
          clearInterval(typeInterval)
          // 打字结束，更新消息状态
          const currentMessage = this.messages.find(m => m.id === messageId)
          if (currentMessage) {
            currentMessage.isTyping = false
          }
          this.isWaitingForResponse = false
        }
      }, typingSpeed)
      
      this.scrollToBottom()
    },

    handleVoiceInput() {
      // 语音输入功能
      uni.showToast({
        title: '语音输入功能开发中',
        icon: 'none'
      })
    },

    formatTime(date) {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    updateMessageTime(messageId) {
      // 消息时间更新逻辑
      this.$forceUpdate()
    },

    updateAllMessageTimes() {
      // 更新所有消息时间
      this.messages.forEach(message => {
        message.timestamp = message.timestamp
      })
      this.$forceUpdate()
    },

    scrollToBottom() {
      this.scrollTop = Math.random()
    },

    handleScrollToTop() {
      // 上拉刷新逻辑
    },

    handleScrollToBottom() {
      // 下拉加载更多逻辑
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: relative;
  z-index: 999;
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

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-area {
  padding: 30rpx 0;
  min-height: 100%;
}

.message {
  display: flex;
  margin-bottom: 40rpx;
  padding: 0 30rpx;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
}

.message.user .avatar {
  margin-left: 20rpx;
  order: 2;
}

.message.ai .avatar {
  margin-right: 20rpx;
  order: 1;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message.user .message-content {
  align-items: flex-end;
  order: 1;
}

.message.ai .message-content {
  align-items: flex-start;
  order: 2;
}

.bubble {
  padding: 24rpx 28rpx;
  border-radius: 18rpx;
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
}

.message.user .bubble {
  background: #95ec69;
  border-top-right-radius: 4rpx;
}

.message.ai .bubble {
  background: #ffffff;
  border: 1rpx solid #e0e0e0;
  border-top-left-radius: 4rpx;
}

.message-text {
  font-size: 30rpx;
  line-height: 1.4;
  color: #333333;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #999999;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.message-time {
  font-size: 20rpx;
  color: #999999;
  margin-top: 8rpx;
  padding: 0 8rpx;
}

.input-area {
  height: 100rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  border-top: 1rpx solid #e0e0e0;
  gap: 20rpx;
}

.voice-btn {
  width: 60rpx;
  height: 60rpx;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-icon {
  font-size: 40rpx;
}

.input-wrapper {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
}

.message-input {
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  font-size: 30rpx;
  color: #333333;
}

.message-input::placeholder {
  color: #999999;
}

.send-btn {
  width: 110rpx;
  height: 64rpx;
  background: #2d8cf0;
  color: #ffffff;
  border: none;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(45, 140, 240, 0.3);
  transition: all 0.3s ease;
}

.send-btn:not(:disabled) {
  background: #2d8cf0;
  color: #ffffff;
}

.send-btn:disabled,
.send-btn.disabled {
  background: #cccccc !important;
  color: #999999 !important;
  box-shadow: none !important;
}
</style>