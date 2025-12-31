<template>
  <view class="model-preview">
    <view class="preview-container">
      <canvas 
        canvas-id="modelCanvas" 
        class="model-canvas"
        @tap="handleCanvasTap"
      ></canvas>
      
      <!-- 颜色标记显示 -->
      <view 
        v-for="(mark, index) in colors" 
        :key="mark.id"
        class="color-mark"
        :style="{
          left: mark.position.x + 'rpx',
          top: mark.position.y + 'rpx',
          backgroundColor: mark.color
        }"
        @tap="handleColorMarkTap(index)"
      >
        <text class="mark-text">{{ mark.color }}</text>
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
      required: true
    },
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
    }
  },
  methods: {
    handleCanvasTap(e) {
      const { x, y } = e.detail
      this.$emit('canvas-tap', { x, y })
    },

    handleColorMarkTap(index) {
      this.$emit('color-mark-tap', index)
    }
  }
}
</script>

<style scoped>
.model-preview {
  width: 100%;
  background: #f8f9fa;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-canvas {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.color-mark {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  transform: scale(0.8);
  transition: transform 0.2s;
}

.color-mark:hover {
  transform: scale(1);
}

.mark-text {
  font-size: 16rpx;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.3);
}
</style>