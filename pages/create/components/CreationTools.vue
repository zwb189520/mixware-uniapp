<template>
  <view class="creation-tools">
    <tool-button 
      v-for="(tool, index) in tools" 
      :key="index" 
      :text="tool.text" 
      :description="tool.description" 
      :icon="tool.icon" 
      :gradient="tool.gradient"
      @click="handleToolClick(tool)" 
    />
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
          icon: '📷',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          text: '说一说',
          description: '对话生成3D模型',
          icon: '🗣️',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          text: '画一画',
          description: '涂鸦生成3D模型',
          icon: '🎨',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          text: '变一变',
          description: '根据模型调整参数生成模型',
          icon: '🔄',
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
      ]
    }
  },
  methods: {
    handleToolClick(tool) {
      if (tool.text === '拍一拍') {
        uni.navigateTo({
          url: '/pages/photography/photography'
        })
      } else if (tool.text === '说一说') {
        uni.navigateTo({
          url: '/pages/chat/chat'
        })
      } else {
        uni.showToast({
          title: `选择了${tool.text}`,
          icon: 'none'
        })
        console.log(`触发功能: ${tool.text} - ${tool.description}`)
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
}
</style>