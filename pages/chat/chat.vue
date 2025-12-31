<template>
  <view class="page-container">
    <!-- 对话区域 -->
    <scroll-view 
      scroll-y 
      class="chat-area"
      :scroll-into-view="scrollIntoView"
      :show-scrollbar="false"
    >
      <view class="chat-content">
        <!-- 消息列表 -->
        <view 
          v-for="(message, index) in messages" 
          :key="index"
          :id="'message-' + index"
          class="message-item"
          :class="message.type"
        >
          <view class="message-bubble">
            <text class="message-text">{{ message.content }}</text>
            <!-- 如果是图片消息，显示图片 -->
            <view v-if="message.imageUrl" class="image-container">
              <image 
                :src="message.imageUrl" 
                class="message-image"
                mode="aspectFill"
                @click="selectImage(message)"
              />
              <view v-if="message.selected" class="selected-overlay">
                <text class="selected-icon">✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 输入提示 -->
        <view v-if="messages.length === 0" class="empty-tip">
          <text class="tip-text">开始对话，告诉我你想要生成什么样的3D模型</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区 -->
    <view class="input-area">
      <view class="input-container">
        <input 
          v-model="inputText"
          class="chat-input"
          placeholder="描述你想要生成的3D模型..."
          :disabled="isGenerating"
          @confirm="sendMessage"
        />
        <button 
          class="send-btn"
          :disabled="!inputText.trim() || isGenerating"
          @click="sendMessage"
        >
          <text v-if="!isGenerating">发送</text>
          <text v-else>生成中...</text>
        </button>
      </view>
      
      <!-- 胶囊按钮 -->
      <view class="capsule-container">
        <capsule-button
          :disabled="!hasSelectedImage"
          text="浏览3D模型"
          @click="view3DModel"
        />
      </view>
    </view>


  </view>
</template>

<script>
import CapsuleButton from './components/CapsuleButton.vue'

export default {
  components: {
    CapsuleButton
  },
  data() {
    return {
      messages: [],
      inputText: '',
      isGenerating: false,
      scrollIntoView: '',
      hasSelectedImage: false,
      selectedMessageIndex: -1
    }
  },
  methods: {
    async sendMessage() {
      if (!this.inputText.trim() || this.isGenerating) return

      const userMessage = {
        type: 'user',
        content: this.inputText.trim(),
        timestamp: Date.now()
      }

      this.messages.push(userMessage)
      this.inputText = ''
      this.scrollToBottom()

      // 模拟AI回复和图片生成
      this.isGenerating = true
      setTimeout(() => {
        const aiMessage = {
          type: 'ai',
          content: '我正在根据您的描述生成图片，请稍等...',
          timestamp: Date.now()
        }
        this.messages.push(aiMessage)
        this.scrollToBottom()
      }, 1000)

      // 模拟图片生成
      setTimeout(() => {
        const imageMessage = {
          type: 'ai',
          content: '根据您的描述，我生成了以下图片，请选择一张作为3D模型的基础：',
          imageUrl: '/static/img/logo.png', // 模拟生成的图片
          timestamp: Date.now(),
          selected: false
        }
        this.messages.push(imageMessage)
        this.isGenerating = false
        this.scrollToBottom()
      }, 3000)
    },

    selectImage(message) {
      // 取消之前选中的图片
      this.messages.forEach(msg => {
        if (msg.imageUrl) {
          msg.selected = false
        }
      })

      // 选中当前图片
      message.selected = true
      this.hasSelectedImage = true
      this.selectedMessageIndex = this.messages.indexOf(message)
    },

    view3DModel() {
      if (!this.hasSelectedImage) return

      const selectedMessage = this.messages[this.selectedMessageIndex]
      uni.navigateTo({
        url: `/pages/modelDetail/3Dpreviewdetail/3Dpreviewdetail?id=123&name=生成的3D模型&url=${selectedMessage.imageUrl}`
      })
    },

    scrollToBottom() {
      this.scrollIntoView = `message-${this.messages.length - 1}`
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.chat-area {
  flex: 1;
  height: 0;
}

.chat-content {
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.message-item {
  margin-bottom: 32rpx;
  display: flex;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 480rpx;
  padding: 24rpx 32rpx;
  border-radius: 32rpx;
  position: relative;
}

.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai .message-bubble {
  background: #fff;
  border: 1rpx solid #e0e0e0;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
}

.user .message-text {
  color: #fff;
}

.image-container {
  margin-top: 16rpx;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
}

.message-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 16rpx;
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.selected-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

.input-area {
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.input-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.chat-input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
}

.send-btn[disabled] {
  background: #ccc;
}

.capsule-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>