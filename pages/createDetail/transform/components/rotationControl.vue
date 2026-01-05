<template>
  <view class="rotation-control">
    <view class="control-header">
      <text class="control-title">旋转调节</text>
    </view>
    
    <view class="rotation-sliders">
      <view class="slider-item">
        <view class="slider-label">
          <text class="label-text">X轴</text>
          <text class="label-value">{{ rotation.x }}°</text>
        </view>
        <slider
          class="rotation-slider"
          :value="rotation.x"
          min="0"
          max="360"
          step="15"
          backgroundColor="#e0e0e0"
          activeColor="#f5576c"
          block-size="32"
          @change="handleXChange"
        />
      </view>
      
      <view class="slider-item">
        <view class="slider-label">
          <text class="label-text">Y轴</text>
          <text class="label-value">{{ rotation.y }}°</text>
        </view>
        <slider
          class="rotation-slider"
          :value="rotation.y"
          min="0"
          max="360"
          step="15"
          backgroundColor="#e0e0e0"
          activeColor="#f5576c"
          block-size="32"
          @change="handleYChange"
        />
      </view>
      
      <view class="slider-item">
        <view class="slider-label">
          <text class="label-text">Z轴</text>
          <text class="label-value">{{ rotation.z }}°</text>
        </view>
        <slider
          class="rotation-slider"
          :value="rotation.z"
          min="0"
          max="360"
          step="15"
          backgroundColor="#e0e0e0"
          activeColor="#f5576c"
          block-size="32"
          @change="handleZChange"
        />
      </view>
    </view>
    
    <view class="quick-actions">
      <button class="quick-btn" @click="handleReset">重置</button>
      <button class="quick-btn" @click="handleRotate90">旋转90°</button>
      <button class="quick-btn" @click="handleRotate180">旋转180°</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RotationControl',
  props: {
    rotation: {
      type: Object,
      default: () => ({ x: 0, y: 0, z: 0 })
    }
  },
  methods: {
    handleXChange(e) {
      this.$emit('rotation-change', {
        ...this.rotation,
        x: e.detail.value
      })
    },

    handleYChange(e) {
      this.$emit('rotation-change', {
        ...this.rotation,
        y: e.detail.value
      })
    },

    handleZChange(e) {
      this.$emit('rotation-change', {
        ...this.rotation,
        z: e.detail.value
      })
    },

    handleReset() {
      this.$emit('rotation-change', { x: 0, y: 0, z: 0 })
    },

    handleRotate90() {
      this.$emit('rotation-change', {
        x: (this.rotation.x + 90) % 360,
        y: (this.rotation.y + 90) % 360,
        z: (this.rotation.z + 90) % 360
      })
    },

    handleRotate180() {
      this.$emit('rotation-change', {
        x: (this.rotation.x + 180) % 360,
        y: (this.rotation.y + 180) % 360,
        z: (this.rotation.z + 180) % 360
      })
    }
  }
}
</script>

<style scoped>
.rotation-control {
  margin-bottom: 48rpx;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.control-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.rotation-sliders {
  margin-bottom: 32rpx;
}

.slider-item {
  margin-bottom: 32rpx;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-text {
  font-size: 28rpx;
  color: #666;
}

.label-value {
  font-size: 24rpx;
  color: #f5576c;
  font-weight: 600;
}

.rotation-slider {
  width: 100%;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
  justify-content: space-between;
}

.quick-btn {
  flex: 1;
  height: 64rpx;
  background: #f8f9fa;
  border: 1rpx solid #e0e0e0;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f5576c;
  color: #fff;
  border-color: #f5576c;
}
</style>