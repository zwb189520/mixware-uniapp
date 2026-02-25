<template>
  <view class="preview-page">
    <safe-area />
    <custom-navbar :title="modelName" @back="handleBack" />
    <view class="canvas-wrap">
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
          <text class="empty-text">{{ texts.noModel }}</text>
        </view>
        <view v-if="loading" class="loading-overlay">
          <text class="loading-text">{{ texts.loading }}</text>
        </view>
      </view>
    </view>
    <view class="dimensions-bar">
      <text class="dimensions-text">{{ dimensionsText }}</text>
    </view>
    <view class="settings-section" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="setting-item">
        <text class="setting-label">{{ texts.scale }} {{ scalePercent }}%</text>
        <slider 
          :value="scalePercent" 
          :min="10" 
          :max="100" 
          :step="1" 
          @change="onScaleChange"
          @changing="onScaleChanging"
          activeColor="#2a7fff"
          backgroundColor="#333"
          block-color="#2a7fff"
          block-size="20"
        />
      </view>
      
      <!-- 重置按钮 -->
      <button class="reset-btn" @tap="handleReset">
        <text class="reset-btn-text">{{ texts.reset }}</text>
      </button>
      
      <!-- 打印按钮 -->
      <button class="next-btn" @tap="handlePrint">
        <text class="next-btn-text">{{ texts.startPrint }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import { sendPrintCommand } from '@/api/iot.js'
import { getModelDetail } from '@/api/models.js'
import { getDefaultDevice } from '@/api/devices.js'
import Preview3D from '@/components/cc-threeJs/preview3D.vue'
import { useLanguageStore } from '@/stores'

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
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    },
    topBarStyle() {
      const heightPx = (this.topBarHeightPx || 0) + (this.statusBarHeight || 0)
      return {
        paddingTop: `${this.statusBarHeight || 0}px`,
        height: `${heightPx}px`
      }
    },
    dimensionsText() {
      if (this.dimensions && this.dimensions.x && this.dimensions.y && this.dimensions.z) {
        return `${this.texts.size}: ${this.dimensions.x}mm(X)×${this.dimensions.y}mm(Y)×${this.dimensions.z}mm(Z)`
      }
      return `${this.texts.size}: 0mm(X)×0mm(Y)×0mm(Z)`
    }
  },
  onLoad(options) {
    this.languageStore.loadLanguage()
    this.modelId = options.id || ''
    
    if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
      uni.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }

    this.modelName = options.name || ''
    this.modelUrl = decodeURIComponent(options.url || '')
    this.modelType = options.modelType || this.getModelTypeFromUrl(this.modelUrl)
    
    // 接收并解析尺寸信息
    if (options.dimensions) {
      try {
        const parsedDimensions = JSON.parse(decodeURIComponent(options.dimensions))
        if (parsedDimensions && parsedDimensions.x && parsedDimensions.y && parsedDimensions.z) {
          this.dimensions = {
            x: Math.round(parsedDimensions.x * 10) / 10,
            y: Math.round(parsedDimensions.y * 10) / 10,
            z: Math.round(parsedDimensions.z * 10) / 10
          }
          console.log('使用从 modelDetail 传递的尺寸:', this.dimensions)
        }
      } catch (e) {
        console.error('解析尺寸参数失败:', e)
      }
    }
    
    // console.log('解析后的页面参数:', { id: this.modelId, name: this.modelName, url: this.modelUrl, modelType: this.modelType, dimensions: this.dimensions })
    
    const ext = this.modelUrl.split('.').pop().toLowerCase()
    if (ext === 'gcode') {
      uni.showModal({
        title: this.texts.formatNotSupported,
        content: this.texts.formatNotSupportedMsg,
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
      return
    }
    
    this.initStatusBarHeight()
    
    const systemInfo = uni.getSystemInfoSync()
    const safeAreaBottom = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0
    this.safeAreaBottom = safeAreaBottom
    
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
        // console.log('请求模型详情，ID:', this.modelId)
        const res = await getModelDetail(this.modelId)
        // console.log('模型详情API返回:', res)
        if (res && res.data) {
          const data = res.data
          this.modelInfo = data
          this.modelName = data.name || this.modelName
          
          const fixImageUrl = (url) => {
            if (!url) return ''
            return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
          }
          
          this.modelUrl = fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || '')
          this.modelType = this.getModelTypeFromUrl(this.modelUrl)
          
          // 解析尺寸信息
          let dimensions = null
          if (data.modelParam) {
            try {
              const modelParam = typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
              const sizeStr = modelParam.size || modelParam.modelSize || modelParam.dimensions || ''
              if (sizeStr) {
                const sizeMatch = sizeStr.match(/([\d.]+)mm[^\d]+([\d.]+)mm[^\d]+([\d.]+)mm/)
                if (sizeMatch) {
                  dimensions = {
                    x: parseFloat(sizeMatch[1]),
                    y: parseFloat(sizeMatch[2]),
                    z: parseFloat(sizeMatch[3])
                  }
                }
              }
            } catch (e) {
              console.error('解析 modelParam 失败:', e)
            }
          }
          
          // 如果没有从页面参数获取到尺寸信息，才使用解析出的尺寸
          if (!this.dimensions.x && dimensions) {
            console.log('使用从 API 解析出的尺寸:', dimensions)
            this.dimensions = {
              x: Math.round(dimensions.x * 10) / 10,
              y: Math.round(dimensions.y * 10) / 10,
              z: Math.round(dimensions.z * 10) / 10
            }
          } else if (!this.dimensions.x && data.dimensions && data.dimensions.x) {
            console.log('使用 API 直接返回的尺寸:', data.dimensions)
            this.dimensions = {
              x: Math.round(data.dimensions.x * 10) / 10,
              y: Math.round(data.dimensions.y * 10) / 10,
              z: Math.round(data.dimensions.z * 10) / 10
            }
          }
        }
      } catch (error) {
        console.error('获取模型详情失败:', error instanceof Error ? error.message : (error ? JSON.stringify(error) : '未知错误'))
        if (error.message.includes(this.texts.modelNotExist)) {
          uni.showToast({ title: this.texts.modelNotExist, icon: 'none' })
        } else {
          uni.showToast({ title: this.texts.loadModelInfoFailed, icon: 'none' })
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
      // console.log('=== 模型加载完成 ===')
      
      this.$nextTick(() => {
        this.applyModelScale()
        
        // 延迟检查尺寸，如果还是0则手动触发一次centerAndScale
        setTimeout(() => {
          if (this.dimensions.x === 0) {
            this.applyModelScale()
          }
        }, 500)
      })
    },
    onModelLoadError(error) {
      this.loading = false
      console.error('模型加载失败:', error instanceof Error ? error.message : (error ? JSON.stringify(error) : '未知错误'))
      uni.showToast({ title: this.texts.modelLoadFailed, icon: 'none' })
    },
    onModelDimensions(dimensions) {
      if (!dimensions || typeof dimensions.x === 'undefined' || dimensions.x === 0) {
        return
      }

      this.dimensions = {
        x: Math.round(dimensions.x * 10) / 10,
        y: Math.round(dimensions.y * 10) / 10,
        z: Math.round(dimensions.z * 10) / 10
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
    
    // 重置模型位置和缩放
    handleReset() {
      console.log('=== 重置按钮被点击 ===')
      
      // 重置数据
      this.scalePercent = 100
      this.modelScale = 1
      
      if (this.$refs.preview3d) {
        // 调用组件的重置方法
        if (typeof this.$refs.preview3d.resetModel === 'function') {
          try {
            this.$refs.preview3d.resetModel()
            
            // 额外确保尺寸更新
            this.$nextTick(() => {
              this.applyModelScale()
            })

            uni.showToast({
              title: this.texts.resetSuccess || '重置成功',
              icon: 'success',
              duration: 1000
            })
          } catch (e) {
            console.error('重置失败:', e)
          }
        }
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
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      try {
        uni.showLoading({
          title: this.texts.gettingDeviceInfo
        })
        
        const deviceRes = await getDefaultDevice()
        console.log('默认设备响应:', deviceRes)
        console.log('默认设备数据:', deviceRes.data)
        
        const deviceId = deviceRes.data?.deviceId || deviceRes.data?.data?.deviceId
        console.log('解析后的设备ID:', deviceId)
        
        if (!deviceId) {
          uni.hideLoading()
          uni.showToast({
            title: this.texts.addDeviceFirst,
            icon: 'none'
          })
          return
        }
        
        uni.showLoading({
          title: this.texts.sendingPrintCommand
        })
        
        console.log('设备ID:', deviceId)
        console.log('发送打印命令:', { deviceId, modelId: this.modelId })
        const res = await sendPrintCommand(deviceId, this.modelId, 'P')
        console.log('打印命令返回:', res)
        
        uni.hideLoading()
        uni.showToast({
          title: this.texts.printCommandSent,
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/explore/workDetail/workDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelUrl)}&modelUrl=${encodeURIComponent(this.modelUrl)}&scale=${this.scalePercent}&deviceId=${deviceId}`
          })
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('打印命令失败:', error)
        uni.showToast({
          title: error.message || this.texts.sendPrintCommandFailed,
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
  /* flex: 1; */
	height: 1100rpx;
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

.reset-btn {
	width: 100%;
	height: 88rpx;
	border-radius: 44rpx;
	background-color: #666;
	border: none;
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
}

.reset-btn-text {
	color: #ffffff;
	font-weight: 600;
}

.reset-btn:active {
	opacity: 0.8;
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