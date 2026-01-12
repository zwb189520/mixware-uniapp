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
    <GenerateButton
      :scale="currentScale"
      :rotation="currentRotation"
      :colors="colorMarks"
      :painting-marks="paintingMarks"
      @generate="handleGenerate"
    />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import ModelPreview from './components/ModelPreview.vue'
import SizeControl from './components/SizeControl.vue'
import RotationControl from './components/RotationControl.vue'
import ColorMark from './components/ColorMark.vue'
import PaintingGuide from './components/PaintingGuide.vue'
import GenerateButton from './components/GenerateButton.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    CustomNavbar,
    ModelPreview,
    SizeControl,
    RotationControl,
    ColorMark,
    PaintingGuide,
    GenerateButton,
    SafeArea
  },
  data() {
    return {
      modelName: '基础模型',
      modelUrl: '/static/3d-models/base-model.stl',
      currentScale: 100,
      currentRotation: { x: 0, y: 0, z: 0 },
      colorMarks: [],
      paintingMarks: []
    }
  },
  onLoad(options) {
    if (options.id) {
      this.modelName = options.name || '基础模型'
      this.modelUrl = options.url || '/static/3d-models/base-model.stl'
    } else {
      this.useMockData()
    }
  },
  methods: {
    useMockData() {
      this.modelName = '机械臂底座'
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
      this.paintingMarks.splice(index, 1)
    },

    handleGenerate() {
      uni.showModal({
        title: '生成确认',
        content: `生成新模型：${this.modelName}\n缩放：${this.currentScale}%\n颜色标记：${this.colorMarks.length}个\n涂色指导：${this.paintingMarks.length}个`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '生成中...'
            })

            setTimeout(() => {
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
      console.log('模型加载完成')
    },

    handleModelError() {
      console.log('模型加载失败')
      uni.showToast({
        title: '模型加载失败',
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
  background: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.content-scroll {
  flex: 1;
  height: 0;
}

.control-panel {
  background: #fff;
  padding: 32rpx;
  margin-top: 20rpx;
}
</style>