<template>
  <view class="page">
    <!-- 安全区域 -->
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    
    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 功能按钮区域 -->
      <view class="creation-tools">
        <view 
          v-for="(tool, index) in tools" 
          :key="index" 
          :class="[getCardPositionClass(index), tool.id === 'aiChat' ? 'ai-chat-card' : '']"
          class="tool-button"
          @click="handleToolClick(tool)"
          :style="{ height: getCardHeight(index) + 'rpx' }"
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
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'
import { createSession } from '@/api/session.ts'

export default {
  data() {
    return {
      statusBarHeight: 0,
      isNavigating: false
    }
  },
  computed: {
    texts() {
      return useLanguageStore().texts.create
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
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  onShow() {
    useLanguageStore().updateTabBar()
  },
  methods: {
    getCardHeight(index) {
      return index === 4 ? 200 : 240
    },
    getCardPositionClass(index) {
      return index === 4 ? 'ai-chat-full-width' : ''
    },
    async handleToolClick(tool) {
      if (this.isNavigating) return
      
      // 检查登录状态
      const isLoggedIn = uni.getStorageSync('isLoggedIn')
      if (!isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      
      this.isNavigating = true
      
      const navigate = (url) => {
        uni.navigateTo({
          url,
          complete: () => { this.isNavigating = false }
        })
      }
      
      switch (tool.id) {
        case 'photography':
          navigate('/pages/create/createDetail/photography/photography')
          break
        case 'chat':
          navigate('/pages/create/createDetail/chat/chat')
          break
        case 'aiChat':
          try {
            const res = await createSession()
            if ((res.code === 1 || res.code === 0) && res.data?.sessionId) {
              navigate(`/pages/create/createDetail/aiChat/aiChat?sessionId=${res.data.sessionId}`)
            } else {
              this.isNavigating = false
            }
          } catch (error) {
            console.error('创建会话失败:', error)
            this.isNavigating = false
          }
          break
        case 'draw':
          navigate('/pages/create/createDetail/draw1/draw1')
          break
        case 'transform':
          uni.showToast({ title: '功能开发中', icon: 'none' })
          this.isNavigating = false
          break
        default:
          uni.showToast({ title: `选择了${tool.text}`, icon: 'none' })
          this.isNavigating = false
      }
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #FFF9F5;
}
.page::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
.content {
  padding: 40rpx;
  height: calc(100vh - v-bind(statusBarHeight + 'px'));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 60rpx;
  align-items: center;
  box-sizing: border-box;
}

.creation-tools {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40rpx;
  width: 100%;
  padding: 0 20rpx;
  position: relative;
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

.tool-button:active {
  transform: scale(0.95);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.button-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
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

.arrow-icon {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  z-index: 3;
}

.ai-chat-full-width {
  grid-column: 1 / -1;
  margin-top: 0;
}

.ai-chat-card {
  padding: 80rpx 40rpx;
}
</style>

