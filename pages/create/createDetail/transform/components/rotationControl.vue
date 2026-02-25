<template>
  <view class="rotation-control">
    <view class="control-header">
      <text class="control-title">{{ texts.rotationAdjustment }}</text>
    </view>
    
    <view class="rotation-sliders">
      <view class="slider-item">
        <view class="slider-label">
          <text class="label-text">{{ texts.axisX }}</text>
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
          <text class="label-text">{{ texts.axisY }}</text>
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
          <text class="label-text">{{ texts.axisZ }}</text>
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
      <button class="quick-btn" @click="handleReset">{{ texts.reset }}</button>
      <button class="quick-btn" @click="handleRotate90">{{ texts.rotate90 }}</button>
      <button class="quick-btn" @click="handleRotate180">{{ texts.rotate180 }}</button>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  name: 'RotationControl',
  props: {
    rotation: {
      type: Object,
      default: () => ({ x: 0, y: 0, z: 0 })
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.create
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
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
        ...this.rotation,
        y: (this.rotation.y + 90) % 360
      })
    },

    handleRotate180() {
      this.$emit('rotation-change', {
        ...this.rotation,
        y: (this.rotation.y + 180) % 360
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
  color: #FF5A00;
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
  background: #FFF9F5;
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
  background: #FF5A00;
  color: #fff;
  border-color: #FF5A00;
}
</style>