<template>
  <view class="creation-tools">
    <view v-for="(tool, index) in tools" :key="index" :class="getCardPositionClass(index)">
      <tool-button 
        :text="tool.text" 
        :description="tool.description" 
        :icon="tool.icon" 
        :backgroundImage="tool.backgroundImage"
        :cardHeight="getCardHeight(index)"
        @click="handleToolClick(tool)" 
      />
    </view>
  </view>
</template>

<script>
import ToolButton from './ToolButton.vue'

export default {
  name: 'CreationTools',
  components: {
    ToolButton
  },
  data() {
    return {
      tools: [
        {
          text: '拍一拍',
          description: '拍照生成3D模型',
          icon: 'camera',
          backgroundImage: '/static/images/create/camera-card.png'
        },
        {
          text: '说一说',
          description: '对话生成3D模型',
          icon: 'chat',
          backgroundImage: '/static/images/create/chat-card.png'
        },
        {
          text: '画一画',
          description: '涂鸦生成3D模型',
          icon: 'color',
          backgroundImage: '/static/images/create/draw-card.png'
        },
        {
          text: '变一变',
          description: '根据模型调整参数生成模型',
          icon: 'compose',
          backgroundImage: '/static/images/create/transform-card.png'
        }
      ],
      isNavigating: false
    }
  },
  methods: {
    getCardHeight(index) {
      // 索引0(左上)和3(右下)为长卡片，索引1(左下)和2(右上)为短卡片
      return index === 0 || index === 3 ? 300 : 200
    },
    
    getCardPositionClass(index) {
      // 索引3(右下)卡片往上移动100rpx
      return index === 3 ? 'move-up' : ''
    },
    
    handleToolClick(tool) {
      if (this.isNavigating) return
      
      this.isNavigating = true
      
      if (tool.text === '拍一拍') {
        uni.navigateTo({
          url: '/pages/create/createDetail/photography/photography',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.text === '说一说') {
        uni.navigateTo({
          url: '/pages/create/createDetail/chat/chat',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.text === '画一画') {
        uni.navigateTo({
          url: '/pages/create/createDetail/draw/draw',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else if (tool.text === '变一变') {
        uni.navigateTo({
          url: '/pages/create/createDetail/transform/transform',
          complete: () => {
            this.isNavigating = false
          }
        })
      } else {
        uni.showToast({
          title: `选择了${tool.text}`,
          icon: 'none'
        })
        console.log(`触发功能: ${tool.text} - ${tool.description}`)
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

.move-up {
  margin-top: -100rpx;
  margin-bottom: 100rpx;
  z-index: 2;
}

.move-up .tool-button {
  transform: none !important;
}

.move-up .tool-button:active {
  transform: scale(0.95) !important;
}
</style>