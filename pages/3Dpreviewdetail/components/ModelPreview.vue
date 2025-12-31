<template>
  <view class="model-preview-container">
    <view class="model-preview" @click="handlePreviewClick">
      <view v-if="!modelLoaded" class="loading-container">
        <text class="loading-text">模型加载中...</text>
      </view>
      <view v-else class="model-container">
        <view class="model-placeholder" :style="modelStyle">
          <text class="model-text">{{ modelName }}</text>
          <text class="model-scale">缩放: {{ scale }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModelPreview',
  props: {
    modelUrl: {
      type: String,
      default: ''
    },
    scale: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      modelLoaded: false,
      modelName: '3D模型'
    }
  },
  computed: {
    modelStyle() {
      return {
        transform: `scale(${this.scale / 100})`,
        width: '200rpx',
        height: '200rpx'
      }
    }
  },
  mounted() {
    this.loadModel()
  },
  methods: {
    loadModel() {
      // 模拟模型加载
      setTimeout(() => {
        this.modelLoaded = true
        this.$emit('model-load')
      }, 1000)
    },

    handlePreviewClick() {
      console.log('模型预览点击')
    }
  }
}
</script>

<style scoped>
.model-preview-container {
  flex: 1;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600rpx;
}

.model-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
}

.loading-text {
  font-size: 32rpx;
  color: #666;
}

.model-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.model-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1296db;
  border-radius: 20rpx;
  transition: transform 0.3s ease;
}

.model-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.model-scale {
  font-size: 24rpx;
  color: #fff;
  opacity: 0.8;
}
</style>