<template>
  <view class="preview-page">
    <!-- 顶部栏 -->
    <view class="top-bar" :style="topBarStyle">
      <view class="back" @tap="handleBack">
        <uni-icons type="left" size="20" color="#fff"></uni-icons>
      </view>
      <text class="title">{{ modelName }}</text>
      <view class="empty"></view>
    </view>
    
    <!-- 3D 模型预览区域 -->
    <view class="canvas-wrap">
      <!-- 3D 预览画布 -->
      <view class="canvas-container">
        <Preview3D 
          v-if="modelUrl"
          ref="preview3d"
          :modelurl="modelUrl"
          :modelType="modelType"
          :scale="modelScale"
          :autoRotate="false"
          :autoRotateSpeed="1.6"
          :disableRaycaster="false"
          :enablePan="true"
          @loaded="onModelLoaded"
          @error="onModelLoadError"
          @dimensions="onModelDimensions"
        ></Preview3D>
        <view v-else class="empty-state">
          <text class="empty-text">暂无模型</text>
        </view>
        <view v-if="loading" class="loading-overlay">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </view>
    
    <!-- 模型尺寸显示 -->
    <view class="dimensions-bar">
      <text class="dimensions-text">{{ dimensionsText }}</text>
    </view>
    
    <!-- 底部设置区域 -->
    <view class="settings-section" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <!-- 缩放设置 -->
      <view class="setting-item">
        <text class="setting-label">缩放 {{ scalePercent }}%</text>
        <slider 
          :value="scalePercent" 
          :min="10" 
          :max="200" 
          :step="1" 
          @change="onScaleChange"
          @changing="onScaleChanging"
          activeColor="#2a7fff"
          backgroundColor="#333"
          block-color="#2a7fff"
          block-size="20"
        />
      </view>
      
      <!-- 打印按钮 -->
      <button class="next-btn" @tap="handlePrint">
        <text class="next-btn-text">开始打印</text>
      </button>
    </view>
  </view>
</template>

<script>
import { sendPrintCommand } from '@/api/iot.js'
import { getModelDetail } from '@/api/models.js'
import { getDefaultDevice } from '@/api/devices.js'
import Preview3D from '@/components/cc-threeJs/preview3D.vue'

export default {
  components: {
    Preview3D
  },
  data() {
    return {
      modelId: '',
      modelName: '',
      modelUrl: '',
      modelType: '',
      loading: false,
      statusBarHeight: 0,
      topBarHeightPx: 0,
      safeAreaBottom: 0,
      // 模型尺寸
      dimensions: {
        x: 0,
        y: 0,
        z: 0
      },
      // 缩放相关
      modelScale: 1,
      scalePercent: 100,
      modelInfo: {}
    }
  },
  computed: {
    topBarStyle() {
      const heightPx = (this.topBarHeightPx || 0) + (this.statusBarHeight || 0)
      return {
        paddingTop: `${this.statusBarHeight || 0}px`,
        height: `${heightPx}px`
      }
    },
    dimensionsText() {
      if (this.dimensions.x && this.dimensions.y && this.dimensions.z) {
        return `模型尺寸: ${this.dimensions.x}mm(X)×${this.dimensions.y}mm(Y)×${this.dimensions.z}mm(Z)`
      }
      return `模型尺寸: 0mm(X)×0mm(Y)×0mm(Z)`
    }
  },
  onLoad(options) {
    console.log('原始页面参数:', options)
    this.modelId = options.id || ''
    this.modelName = options.name || '3D模型'
    this.modelUrl = decodeURIComponent(options.url || '')
    this.modelType = options.modelType || this.getModelTypeFromUrl(this.modelUrl)
    
    console.log('解析后的页面参数:', { id: this.modelId, name: this.modelName, url: this.modelUrl, modelType: this.modelType })
    
    // 初始化状态栏高度
    this.initStatusBarHeight()
    
    // 获取系统信息，设置安全区域
    const systemInfo = uni.getSystemInfoSync()
    const safeAreaBottom = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0
    this.safeAreaBottom = safeAreaBottom
    
    // 如果有模型URL，直接加载；否则尝试通过API获取
    if (this.modelUrl) {
      this.loading = true
    } else if (this.modelId) {
      this.loadModelDetail()
    }
  },
  methods: {
    initStatusBarHeight() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
        if (typeof uni.upx2px === 'function') {
          try {
            this.topBarHeightPx = uni.upx2px(88)
          } catch (e) {
            console.warn('uni.upx2px 调用失败，使用默认值:', e)
            this.topBarHeightPx = 44
          }
        } else {
          this.topBarHeightPx = 44
        }
      } catch (e) {
        console.error('初始化状态栏高度失败:', e)
        this.statusBarHeight = 0
        this.topBarHeightPx = 44
      }
    },
    async loadModelDetail() {
      try {
        this.loading = true
        console.log('请求模型详情，ID:', this.modelId)
        const res = await getModelDetail(this.modelId)
        console.log('模型详情API返回:', res)
        if (res && res.data) {
          this.modelInfo = res.data
          this.modelName = res.data.name || this.modelName
          this.modelUrl = res.data.modelFile || ''
          this.modelType = this.getModelTypeFromUrl(this.modelUrl)
          
          // 如果API返回了尺寸信息，直接使用
          if (res.data.dimensions) {
            this.dimensions = res.data.dimensions
          }
        }
      } catch (error) {
        console.error('获取模型详情失败:', error)
        if (error.message.includes('模型不存在')) {
          uni.showToast({ title: '模型不存在', icon: 'none' })
        } else {
          uni.showToast({ title: '获取模型信息失败', icon: 'none' })
        }
      } finally {
        this.loading = false
      }
    },
    
    handleBack() {
      uni.navigateBack()
    },
    onModelLoaded() {
      this.loading = false
      console.log('模型加载完成')
      this.$nextTick(() => {
        this.applyModelScale()
      })
    },
    onModelLoadError(error) {
      this.loading = false
      console.error('模型加载失败:', error)
      uni.showToast({ title: '模型加载失败', icon: 'none' })
    },
    onModelDimensions(dimensions) {
      // 接收模型尺寸数据
      if (dimensions && dimensions.x && dimensions.y && dimensions.z) {
        this.dimensions = {
          x: Math.round(dimensions.x * 10) / 10,
          y: Math.round(dimensions.y * 10) / 10,
          z: Math.round(dimensions.z * 10) / 10
        }
      }
    },
    getModelTypeFromUrl(url) {
      // 从URL获取模型类型
      if (!url) return ''
      const ext = url.split('.').pop().toLowerCase()
      const typeMap = {
        'glb': 'glb',
        'gltf': 'gltf',
        'obj': 'obj',
        'stl': 'stl'
      }
      return typeMap[ext] || ''
    },
    onScaleChange(e) {
      this.scalePercent = e.detail.value
      this.modelScale = this.scalePercent / 100
      this.applyModelScale()
    },
    onScaleChanging(e) {
      this.scalePercent = e.detail.value
      this.modelScale = this.scalePercent / 100
      this.applyModelScale()
    },
    // 应用模型缩放
    applyModelScale() {
      if (this.$refs.preview3d && typeof this.$refs.preview3d.centerAndScale === 'function') {
        this.$refs.preview3d.centerAndScale(this.modelScale)
      }
    },
    // 安全调用缩放方法
    safeApplyScale() {
      try {
        if (this.$refs.preview3d && this.$refs.preview3d.centerAndScale) {
          this.$refs.preview3d.centerAndScale(this.modelScale)
        }
      } catch (error) {
        console.warn('缩放应用失败:', error)
      }
    },
    async handlePrint() {
      try {
        uni.showLoading({
          title: '获取设备信息...'
        })
        
        const deviceRes = await getDefaultDevice()
        const deviceId = deviceRes.data?.data?.deviceId
        
        if (!deviceId) {
          uni.hideLoading()
          uni.showToast({
            title: '请先添加设备',
            icon: 'none'
          })
          return
        }
        
        uni.showLoading({
          title: '发送打印命令...'
        })
        
        console.log('设备ID:', deviceId)
        console.log('发送打印命令:', { deviceId, modelId: this.modelId })
        const res = await sendPrintCommand(deviceId, this.modelId, 'P')
        console.log('打印命令返回:', res)
        
        uni.hideLoading()
        uni.showToast({
          title: '打印命令已发送',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/explore/workDetail/workDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelUrl)}&modelUrl=${encodeURIComponent(this.modelUrl)}&scale=${this.scalePercent}`
          })
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('打印命令失败:', error)
        uni.showToast({
          title: error.message || '发送打印命令失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.preview-page {
	min-height: 100vh;
	height: 100vh;
	background-color: #1a1a1a;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.top-bar {
	min-height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24rpx;
	border-bottom: 1rpx solid #333;
	box-sizing: border-box;
	background-color: #2a2a2a;
}

.top-bar .title {
	font-size: 34rpx;
	font-weight: 600;
	color: #fff;
	flex: 1;
	text-align: center;
}

.top-bar .back {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty {
	width: 60rpx;
}

.canvas-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: #1a1a1a;
}

.canvas-container {
	flex: 1;
	position: relative;
	background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
}

.empty-state {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.empty-text {
	font-size: 28rpx;
	color: #666;
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(26, 26, 26, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.loading-text {
	font-size: 28rpx;
	color: #fff;
}

.dimensions-bar {
	background-color: #2a2a2a;
	padding: 16rpx 24rpx;
	border-top: 1rpx solid #333;
}

.dimensions-text {
	font-size: 24rpx;
	color: #999;
	font-weight: 500;
}

.settings-section {
	background-color: #2a2a2a;
	padding: 24rpx;
	border-top: 1rpx solid #333;
}

.setting-item {
	margin-bottom: 32rpx;
}

.setting-label {
	font-size: 28rpx;
	color: #fff;
	margin-bottom: 16rpx;
	display: block;
}

.next-btn {
	width: 100%;
	height: 88rpx;
	border-radius: 44rpx;
	background-color: #2a7fff;
	border: none;
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

.next-btn-text {
	color: #ffffff;
	font-weight: 600;
}

.next-btn:active {
	opacity: 0.8;
}
</style>