<template>
  <view class="generate-button-container">
    <view class="button-wrapper">
      <button 
        class="generate-btn"
        :class="{ 'generating': isGenerating }"
        :disabled="isGenerating"
        @click="handleGenerate"
      >
        <view class="btn-content">
          <view v-if="!isGenerating" class="btn-icon">🎯</view>
          <view v-else class="btn-loading">
            <view class="loading-spinner"></view>
          </view>
          
          <text class="btn-text">
            {{ isGenerating ? '生成中...' : '生成3D模型' }}
          </text>
        </view>
      </button>
      
      <view class="model-summary">
        <text class="summary-text">
          缩放: {{ scale }}% | 颜色: {{ colors.length }}个 | 指导: {{ paintingMarks.length }}个
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GenerateButton',
  props: {
    scale: {
      type: Number,
      default: 100
    },
    rotation: {
      type: Object,
      default: () => ({ x: 0, y: 0, z: 0 })
    },
    colors: {
      type: Array,
      default: () => []
    },
    paintingMarks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isGenerating: false
    }
  },
  methods: {
    async handleGenerate() {
      if (this.isGenerating) return
      
      this.isGenerating = true
      
      try {
        this.$emit('generate')
      } catch (error) {
        console.error('生成失败:', error)
        uni.showToast({
          title: '生成失败',
          icon: 'error'
        })
      } finally {
        setTimeout(() => {
          this.isGenerating = false
        }, 2000)
      }
    }
  }
}
</script>

<style scoped>
.generate-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.button-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.generate-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 44rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 100%;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top: 3rpx solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.generating {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

.model-summary {
  text-align: center;
}

.summary-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}
</style>