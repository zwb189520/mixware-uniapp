<template>
  <view class="page-container">
    <!-- 打印编辑导航栏组件 -->
    <PrintEditNavbar
      :model-name="modelName || '模型打印编辑'"
      @back-click="handleBack"
    />

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 3D模型预览组件 -->
      <ModelPreview
        :model-url="modelUrl"
        :scale="currentScale"
        @model-load="handleModelLoad"
        @model-error="handleModelError"
      />
    </scroll-view>

    <!-- 底部控制面板 -->
    <view class="control-panel">
      <!-- 缩放条组件 -->
      <ScaleControl
        :scale="currentScale"
        @scale-change="handleScaleChange"
      />

      <!-- 打印按钮 -->
      <PrintButton
        :scale="currentScale"
        :model-name="modelName"
        @print-click="handlePrint"
      />
    </view>
  </view>
</template>

<script>
import PrintEditNavbar from './components/PrintEditNavbar.vue'
import ModelPreview from './components/ModelPreview.vue'
import ScaleControl from './components/ScaleControl.vue'
import PrintButton from './components/PrintButton.vue'

export default {
  components: {
    PrintEditNavbar,
    ModelPreview,
    ScaleControl,
    PrintButton
  },
  data() {
    return {
      modelId: '',
      modelName: '',
      modelUrl: '',
      currentScale: 100
    }
  },
  onLoad(options) {
    this.modelId = options.id || ''
    this.modelName = options.name || ''
    this.modelUrl = options.url || ''
    
    // 使用示例数据
    this.useMockData()
  },
  methods: {
    useMockData() {
      // 使用示例数据
      this.modelName = '机械臂底座'
      this.modelUrl = '/static/3d-models/mechanical-arm-base.stl'
    },

    handleBack() {
      uni.navigateBack()
    },

    handleScaleChange(scale) {
      this.currentScale = scale
    },

    handlePrint() {
      uni.showModal({
        title: '打印确认',
        content: `确认打印模型：${this.modelName}\n缩放比例：${this.currentScale}%`,
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: `/pages/works/workDetail/workDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelUrl)}&scale=${this.currentScale}`
            })
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

.content-scroll {
  flex: 1;
  height: 0;
}

.control-panel {
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}
</style>