<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="modelName" @back="handleBack" />
    <scroll-view scroll-y class="content-scroll">
      <ModelPreview
        :model-url="modelUrl"
        :scale="currentScale"
        :rotation="currentRotation"
        :colors="colorMarks"
        @model-load="handleModelLoad"
        @model-error="handleModelError"
      />
      <view class="control-panel">
        <SizeControl
          :scale="currentScale"
          @scale-change="handleScaleChange"
        />
        <RotationControl
          :rotation="currentRotation"
          @rotation-change="handleRotationChange"
        />
        <ColorMark
          :colors="colorMarks"
          @color-add="handleColorAdd"
          @color-remove="handleColorRemove"
        />
        <PaintingGuide
          :marks="paintingMarks"
          @mark-add="handlePaintingMarkAdd"
          @mark-remove="handlePaintingMarkRemove"
        />
      </view>
    </scroll-view>
    
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
              {{ isGenerating ? texts.generating : texts.generate3DModel }}
            </text>
          </view>
        </button>
        
        <view class="model-summary">
          <text class="summary-text">
            {{ texts.scale }}: {{ currentScale }}% | {{ texts.colorMarks }}: {{ colorMarks.length }}{{ texts.unit }} | {{ texts.paintingGuide }}: {{ paintingMarks.length }}{{ texts.unit }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import ModelPreview from './components/ModelPreview.vue'
import SizeControl from './components/SizeControl.vue'
import RotationControl from './components/RotationControl.vue'
import ColorMark from './components/ColorMark.vue'
import PaintingGuide from './components/PaintingGuide.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'

export default {
  components: {
    CustomNavbar,
    ModelPreview,
    SizeControl,
    RotationControl,
    ColorMark,
    PaintingGuide,
    SafeArea
  },
  data() {
    return {
      modelUrl: '/static/3d-models/base-model.stl',
      currentScale: 100,
      currentRotation: { x: 0, y: 0, z: 0 },
      colorMarks: [],
      paintingMarks: [],
      isGenerating: false
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.create
    },
    modelName() {
      return this.texts.transform
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  onLoad(options) {
    if (options.id) {
      this.modelUrl = options.url || '/static/3d-models/base-model.stl'
    } else {
      this.useMockData()
    }
  },
  methods: {
    useMockData() {
      this.modelUrl = '/static/3d-models/mechanical-arm-base.stl'
    },

    handleBack() {
      uni.navigateBack()
    },

    handleScaleChange(scale) {
      this.currentScale = scale
    },

    handleRotationChange(rotation) {
      this.currentRotation = rotation
    },

    handleColorAdd(color) {
      this.colorMarks.push({
        id: Date.now(),
        color: color.color,
        position: color.position,
        area: color.area
      })
    },

    handleColorRemove(index) {
      this.colorMarks.splice(index, 1)
    },

    handlePaintingMarkAdd(mark) {
      this.paintingMarks.push({
        id: Date.now(),
        position: mark.position,
        instructions: mark.instructions,
        color: mark.color
      })
    },

    handlePaintingMarkRemove(index) {
      this.paintingMarks.splice(index,1)
    },

    handleGenerate() {
      uni.showModal({
        title: texts.generateConfirm,
        content: `${texts.generateNewModel}：${this.modelName}\n${texts.scale}：${this.currentScale}%\n${texts.colorMarks}：${this.colorMarks.length}${texts.unit}\n${texts.paintingGuide}：${this.paintingMarks.length}${texts.unit}`,
        success: (res) => {
          if (res.confirm) {
            this.isGenerating = true
            uni.showLoading({
              title: texts.generating
            })

            setTimeout(() => {
              this.isGenerating = false
              uni.hideLoading()
              uni.navigateTo({
                url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${Date.now()}&name=${this.modelName}_变体&url=${this.modelUrl}`
              })
            }, 2000)
          }
        }
      })
    },

    handleModelLoad() {
    },

    handleModelError() {
      uni.showToast({
        title: texts.modelLoadFailed,
        icon: 'error'
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
  background: #FFF9F5;
}

.safe-area-top {
  background: #fff;
}

.content-scroll {
  flex:1;
  height: 0;
}

.control-panel {
  background: #fff;
  padding: 32rpx;
  margin-top: 20rpx;
}

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
  border: 3rpx solid rgba(255,255,255,0.3);
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