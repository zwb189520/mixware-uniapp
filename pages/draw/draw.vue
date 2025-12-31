<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="navbar-container">
      <view class="navbar">
        <view class="navbar-left" @click="handleBack">
          <uni-icons type="left" size="24"></uni-icons>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">画一画</text>
        </view>
        <view class="navbar-right" @click="clearCanvas">
          <text class="nav-text">清空</text>
        </view>
      </view>
    </view>

    <!-- 绘制区域 -->
    <view class="draw-area">
      <canvas 
        canvas-id="drawCanvas"
        class="canvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
      ></canvas>
    </view>

    <!-- 底部工具栏 -->
    <view class="toolbar">
      <!-- 画笔大小 -->
      <view class="tool-group">
        <text class="tool-label">画笔</text>
        <view class="size-controls">
          <view 
            v-for="size in brushSizes" 
            :key="size.value"
            class="size-option"
            :class="{ active: currentBrushSize === size.value }"
            @click="setBrushSize(size.value)"
          >
            <view 
              class="size-circle"
              :style="{ width: size.value * 2 + 'rpx', height: size.value * 2 + 'rpx' }"
            ></view>
          </view>
        </view>
      </view>

      <!-- 颜色选择 -->
      <view class="tool-group">
        <text class="tool-label">颜色</text>
        <view class="color-controls">
          <view 
            v-for="color in colors" 
            :key="color.value"
            class="color-option"
            :class="{ active: currentColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="setColor(color.value)"
          >
            <view v-if="currentColor === color.value" class="color-check">✓</view>
          </view>
        </view>
      </view>

      <!-- 生成3D模型按钮 -->
      <view class="generate-btn" @click="generate3DModel">
        <text class="generate-text">生成3D模型</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      ctx: null,
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      currentBrushSize: 8,
      currentColor: '#000000',
      brushSizes: [
        { label: '细', value: 4 },
        { label: '中', value: 8 },
        { label: '粗', value: 12 }
      ],
      colors: [
        { label: '黑', value: '#000000' },
        { label: '红', value: '#ff0000' },
        { label: '蓝', value: '#0000ff' },
        { label: '绿', value: '#00ff00' },
        { label: '紫', value: '#800080' },
        { label: '橙', value: '#ffa500' }
      ],
      canvasWidth: 0,
      canvasHeight: 0
    }
  },
  onLoad() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      this.ctx = uni.createCanvasContext('drawCanvas', this)
      
      // 获取屏幕尺寸设置canvas
      const systemInfo = uni.getSystemInfoSync()
      this.canvasWidth = systemInfo.windowWidth
      this.canvasHeight = systemInfo.windowHeight - 200
      
      // 设置白色背景
      this.ctx.setFillStyle('#ffffff')
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.ctx.draw()
    },

    handleTouchStart(e) {
      const touch = e.touches[0]
      this.isDrawing = true
      this.lastX = touch.x
      this.lastY = touch.y
    },

    handleTouchMove(e) {
      if (!this.isDrawing) return
      
      const touch = e.touches[0]
      const currentX = touch.x
      const currentY = touch.y
      
      this.ctx.beginPath()
      this.ctx.moveTo(this.lastX, this.lastY)
      this.ctx.lineTo(currentX, currentY)
      this.ctx.setStrokeStyle(this.currentColor)
      this.ctx.setLineWidth(this.currentBrushSize)
      this.ctx.setLineCap('round')
      this.ctx.setLineJoin('round')
      this.ctx.stroke()
      this.ctx.draw(true)
      
      this.lastX = currentX
      this.lastY = currentY
    },

    handleTouchEnd() {
      this.isDrawing = false
    },

    setBrushSize(size) {
      this.currentBrushSize = size
    },

    setColor(color) {
      this.currentColor = color
    },

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.ctx.setFillStyle('#ffffff')
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.ctx.draw()
    },

    handleBack() {
      uni.navigateBack()
    },

    generate3DModel() {
      // 保存画布为临时图片
      uni.canvasToTempFilePath({
        canvasId: 'drawCanvas',
        success: (res) => {
          uni.navigateTo({
            url: `/pages/modelDetail/3Dpreviewdetail/3Dpreviewdetail?id=drawn-${Date.now()}&name=画作生成的3D模型&url=${res.tempFilePath}`
          })
        },
        fail: () => {
          uni.showToast({
            title: '请先绘制图形',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  position: relative;
}

.navbar-left,
.navbar-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar-left /deep/ .uni-icons,
.navbar-right /deep/ .uni-icons {
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
}

.navbar-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
}

.nav-text {
  font-size: 28rpx;
  color: #333;
}

.navbar-left:active {
  opacity: 0.6;
}

.navbar-container {
  background: #fff;
  border-bottom: 1rpx solid #e0e0e0;
  padding-top: env(safe-area-inset-top);
  z-index: 100;
}

.draw-area {
  flex: 1;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.canvas {
  width: 100%;
  height: 100%;
}

.toolbar {
  background: #fff;
  padding: 32rpx;
  border-top: 1rpx solid #e0e0e0;
}

.tool-group {
  margin-bottom: 24rpx;
}

.tool-group:last-child {
  margin-bottom: 0;
}

.tool-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.size-controls {
  display: flex;
  gap: 24rpx;
}

.size-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 50%;
  background: #f9f9f9;
}

.size-option.active {
  border-color: #667eea;
  background: #f0f2ff;
}

.size-circle {
  background: #333;
  border-radius: 50%;
}

.color-controls {
  display: flex;
  gap: 16rpx;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 4rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-option.active {
  border-color: #333;
}

.color-check {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  text-shadow: 0 0 2rpx rgba(0, 0, 0, 0.5);
}

.generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
}

.generate-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>