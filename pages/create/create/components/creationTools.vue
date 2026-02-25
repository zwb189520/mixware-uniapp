<template>
  <view class="creation-tools">
    <!-- <view class="all-button">
      <image 
        class="all-button-background" 
        src="/static/images/create/allin.png" 
        mode="aspectFill"
      />
      <view class="all-button-overlay"></view>
      <view class="all-button-content">
        <text class="all-button-text">{{ texts.allFunction }}</text>
        <text class="all-button-desc">{{ texts.allDesc }}</text>
      </view>
      <image 
        class="arrow-icon" 
        src="/static/images/create/right-arrow.png" 
        mode="aspectFit"
      />
    </view> -->
    
    <view 
      v-for="(tool, index) in tools" 
      :key="index" 
      :class="[getCardPositionClass(index), tool.id === 'aiChat' ? 'ai-chat-card' : '']"
      class="tool-button"
      @click="handleToolClick(tool)"
      :style="{ 
        height: getCardHeight(index) + 'rpx'
      }"
    >
      <image 
        class="button-background" 
        :src="tool.backgroundImage" 
        mode="aspectFill"
      />
      <view class="button-overlay"></view>
      <view class="button-content">
        <text class="button-text">{{ tool.text }}</text>
        <text class="button-desc">{{ tool.description }}</text>
      </view>
      <image 
        class="arrow-icon" 
        src="/static/images/create/right-arrow.png" 
        mode="aspectFit"
      />
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  name: 'CreationTools',
  data() {
    return {
      isNavigating: false
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.create
    },
    tools() {
      return [
        {
          id: 'photography',
          text: this.texts.photography,
          description: this.texts.photographyDesc,
          icon: 'camera',
          backgroundImage: '/static/images/create/photography.png'
        },
        {
          id: 'chat',
          text: this.texts.chat,
          description: this.texts.chatDesc,
          icon: 'chat',
          backgroundImage: '/static/images/create/chat.png'
        },
        {
          id: 'draw',
          text: this.texts.draw,
          description: this.texts.drawDesc,
          icon: 'color',
          backgroundImage: '/static/images/create/draw.png'
        },
        {
          id: 'transform',
          text: this.texts.transform,
          description: this.texts.transformDesc,
          icon: 'compose',
          backgroundImage: '/static/images/create/transform.png'
        },
        {
          id: 'aiChat',
          text: this.texts.aiChat,
          description: this.texts.aiChatDesc,
          icon: 'chat',
          backgroundImage: '/static/images/create/aichat.png'
        }
      ]
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    getCardHeight(index) {
      if (index === 4) return 200 // AI对话卡片高度
      return 240 // 所有卡片高度统一
    },
    
    getCardPositionClass(index) {
      if (index === 4) return 'ai-chat-full-width'
      return '' // 移除 move-up
    },
    
    handleToolClick(tool) {
      if (this.isNavigating) return
      
      this.isNavigating = true
      
      if (tool.id === 'photography') {
        uni.navigateTo({
          url: '/pages/create/createDetail/photography/photography',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.id === 'chat') {
        uni.navigateTo({
          url: '/pages/create/createDetail/chat/chat',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.id === 'aiChat') {
        uni.navigateTo({
          url: '/pages/create/createDetail/aiChat/aiChat',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.id === 'draw') {
        uni.navigateTo({
          url: '/pages/create/createDetail/draw1/draw1',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.text === this.texts.transform) {
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        })
        this.isNavigating = false
      } else {
        uni.showToast({
          title: `选择了${tool.text}`,
          icon: 'none'
        })
        this.isNavigating = false
      }
    }
  }
}
</script>

<style scoped>
.creation-tools {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40rpx;
  width: 100%;
  padding: 0 20rpx;
  position: relative;
}

.all-button {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
  position: relative;
  border-radius: 24rpx;
  padding: 150rpx 30rpx;
  text-align: center;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.all-button:active {
  transform: scale(0.95);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.all-button-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.all-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.all-button-content {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  z-index: 2;
  text-align: left;
}

.all-button-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.all-button-desc {
  font-size: 20rpx;
  color: #fff;
  display: block;
}

.arrow-icon {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  z-index: 3;
}

.tool-button {
  position: relative;
  border-radius: 24rpx;
  padding: 50rpx 30rpx;
  text-align: center;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.button-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.tool-button:active {
  transform: scale(0.95);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.button-content {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  z-index: 2;
  text-align: left;
}

.button-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.button-desc {
  font-size: 20rpx;
  color: #fff;
  display: block;
}

.move-up {
  margin-top: -80rpx;
  margin-bottom: 100rpx;
  z-index: 2;
}

.move-up .tool-button {
  transform: none !important;
}

.move-up .tool-button:active {
  transform: scale(0.95) !important;
}

.ai-chat-full-width {
  grid-column: 1 / -1;
  margin-top: 0;
}

.ai-chat-card {
  padding: 80rpx 40rpx;
}
</style>