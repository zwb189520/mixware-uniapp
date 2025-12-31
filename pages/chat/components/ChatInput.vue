<template>
  <view class="chat-input-container">
    <view class="input-wrapper">
      <view class="input-field">
        <input 
          v-model="inputText"
          class="text-input"
          placeholder="请输入您想要生成的图片描述..."
          :disabled="isGenerating"
          @keyup.enter="handleSend"
        />
      </view>
      <view class="send-button" :class="{ 'generating': isGenerating }" @click="handleSend">
        <text class="send-text">{{ isGenerating ? '生成中...' : '发送' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatInput',
  data() {
    return {
      inputText: '',
      isGenerating: false
    }
  },
  methods: {
    handleSend() {
      if (!this.inputText.trim() || this.isGenerating) return
      
      const message = {
        id: Date.now(),
        type: 'user',
        content: this.inputText.trim()
      }
      
      this.$emit('send-message', message)
      this.inputText = ''
      
      this.isGenerating = true
      setTimeout(() => {
        this.isGenerating = false
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: '正在根据您的描述生成图片...',
          imageUrl: '/static/img/generated-image.jpg',
          selected: false
        }
        this.$emit('receive-message', aiMessage)
      }, 2000)
    }
  }
}
</script>

<style scoped>
.chat-input-container {
  padding: 10px 15px;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
}

.input-field {
  flex: 1;
  max-width: calc(100% - 70px);
}

.text-input {
  width: 100%;
  max-width: 100%;
  height: 40px;
  padding: 0 15px;
  background: #f8f9fa;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.text-input:disabled {
  color: #999;
}

.send-button {
  width: 60px;
  min-width: 60px;
  height: 40px;
  background: #4CAF50;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.send-button.generating {
  background: #999;
}

.send-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}
</style>