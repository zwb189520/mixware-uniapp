<template>
  <view class="preview-page">
    <safe-area class="fixed-top" />
    <custom-navbar class="fixed-top" :title="modelName" @back="handleBack" />
    <view class="canvas-wrap">
      <view class="canvas-container">
        <!-- 左侧工具按钮栏 -->
        <view class="left-toolbar">
          <view class="toolbar-btn" @tap="handleCenter">
            <uni-icons type="location-filled" size="20" color="#fff"></uni-icons>
            <text class="toolbar-text">{{ texts.center }}</text>
          </view>
          <view class="toolbar-btn" @tap="handleRotate">
            <uni-icons type="reload" size="20" color="#fff"></uni-icons>
            <text class="toolbar-text">{{ texts.rotate }}</text>
          </view>
          <view class="toolbar-btn" @tap="handleCopy">
            <uni-icons type="plus" size="20" color="#fff"></uni-icons>
            <text class="toolbar-text">{{ texts.copy }}</text>
          </view>
          <view class="toolbar-btn" @tap="handleFit">
            <uni-icons type="eye" size="20" color="#fff"></uni-icons>
            <text class="toolbar-text">{{ texts.fit }}</text>
          </view>
          <view class="toolbar-btn" @tap="handleDelete">
            <uni-icons type="trash" size="20" color="#fff"></uni-icons>
            <text class="toolbar-text">{{ texts.delete }}</text>
          </view>
        </view>

        <!-- 旋转面板 -->
        <RotationPanel
          ref="rotationPanel"
          :visible="showRotationPanel"
          @close="showRotationPanel = false"
          @reset="onRotationReset"
          @rotationChanging="onRotationChanging"
          @rotationChange="onRotationChange"
        />
        
        <Preview3D 
          v-if="showPreview && modelUrl"
          ref="preview3d"
          :modelurl="modelUrl"
          :modelType="modelType"
          :scale="modelScale"
          :autoRotate="false"
          :autoRotateSpeed="1.6"
          :disableRaycaster="false"
          :enablePan="true"
          :enableModelDrag="isModelSelected"
          @loaded="onModelLoaded"
          @error="onModelLoadError"
          @dimensions="onModelDimensions"
          @click="onModelClick"
          @boundaryCheck="onBoundaryCheck"
          @scaleUpdate="onScaleUpdate"
        ></Preview3D>
        
        <view v-if="!modelUrl" class="empty-state">
          <text class="empty-text">{{ texts.noModel }}</text>
        </view>
        <view v-if="loading" class="loading-overlay">
          <text class="loading-text">{{ texts.loading }}</text>
          <view v-if="isGenerating" class="cancel-btn" @tap="handleCancelGenerate">
            <text class="cancel-btn-text">取消生成</text>
          </view>
        </view>
      </view>
    </view>
    <view class="dimensions-bar">
      <text class="dimensions-text">{{ dimensionsText }}</text>
    </view>
    <view class="settings-section">
      <view class="setting-item" :class="{ 'disabled': !isModelSelected }">
        <text class="setting-label">{{ texts.scale }} {{ scalePercent }}%</text>
        <slider 
          :value="scalePercent" 
          :min="10" 
          :max="100" 
          :step="1" 
          :disabled="!isModelSelected"
          @change="onScaleChange"
          @changing="onScaleChanging"
          activeColor="#2a7fff"
          backgroundColor="#333"
          block-color="#2a7fff"
          block-size="20"
        />
      </view>
      
      <!-- 支撑结构开关 -->
      <view class="setting-item support-item" :class="{ 'disabled': !isModelSelected }">
        <text class="setting-label">{{ texts.addSupports || '添加支撑结构' }}</text>
        <switch 
          :checked="addSupports" 
          :disabled="!isModelSelected"
          @change="onSupportChange"
          color="#2a7fff"
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

      <!-- 底部空白区域 -->
      <view :style="{ height: (safeAreaBottom + 40) + 'px' }"></view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { sendPrintCommand } from '@/api/iot.ts'
import { getModelDetail } from '@/api/models.ts'
import { getDefaultDevice } from '@/api/devices.ts'
import { getTaskStatus, cancelTask } from '@/api/hunyuan3d.ts'
import Preview3D from '@/components/cc-threeJs/preview3D.vue'
import RotationPanel from './rotation-panel/rotation-panel.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { API } from '@/constants/index'

export default {
  components: {
    Preview3D,
    RotationPanel
  },
  data() {
    return {
      modelId: '',
      modelName: '',
      modelUrl: '',
      modelType: '',
      snapshotImageUrl: '',
      loading: false,
      pollTimer: null,
      pollCount: 0,
      maxPollCount: 60,
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
      addSupports: false,
      modelInfo: {},
      showPreview: false,
      // 模型选中状态
      isModelSelected: true,
      // 是否正在生成中（混元3D）
      isGenerating: false,
      selectedModel: null,
      // 边界检测状态
      isOutOfBounds: false,
      boundaryMessage: '',
      // 旋转面板
      showRotationPanel: false,
      currentRotation: { x: 0, y: 0, z: 0 }
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
      if (this.isModelSelected && this.dimensions && this.dimensions.x && this.dimensions.y && this.dimensions.z) {
        const factor = this.scalePercent / 100
        const x = (this.dimensions.x * factor).toFixed(1)
        const y = (this.dimensions.y * factor).toFixed(1)
        const z = (this.dimensions.z * factor).toFixed(1)
        return `${this.texts.size}: ${x}mm(X)×${y}mm(Y)×${z}mm(Z)`
      }
      return `${this.texts.size}: 0mm(X)×0mm(Y)×0mm(Z)`
    }
  },
  onLoad(options) {
    this.languageStore.loadLanguage()
    this.modelId = options.id || ''
    
    if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
      uni.showToast({ title: this.texts.paramError || '参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }

    this.modelName = options.name ? decodeURIComponent(options.name) : ''
    this.modelUrl = this.normalizeUrl(decodeURIComponent(options.url || ''))
    this.modelType = options.modelType || this.getModelTypeFromUrl(this.modelUrl)
    this.snapshotImageUrl = options.imageUrl ? decodeURIComponent(options.imageUrl) : ''
    
    if (options.dimensions) {
      try {
        const parsedDimensions = JSON.parse(decodeURIComponent(options.dimensions))
        const dimensions = this.parseDimensions(parsedDimensions)
        if (dimensions) {
          this.dimensions = dimensions
          console.log('使用从 modelDetail 传递的尺寸:', this.dimensions)
        }
      } catch (e) {
        console.error('解析尺寸参数失败:', e)
      }
    }
    
    console.log('解析后的页面参数:', { id: this.modelId, name: this.modelName, url: this.modelUrl, modelType: this.modelType, dimensions: this.dimensions, hasUrl: !!this.modelUrl, urlLength: this.modelUrl?.length })
    
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
			  // 延迟显示Preview3D，确保容器有尺寸
			  setTimeout(() => {
			    this.showPreview = true
			  }, 1000)
			} else if (this.modelId) {
			  // 判断是否为任务ID（32位十六进制字符串）
			  if (/^[a-f0-9]{32}$/.test(this.modelId)) {
			    this.pollTaskStatus()
			  } else {
			    this.loadModelDetail()
			  }
			}
  },
  methods: {
    normalizeUrl(url) {
      if (!url) return ''
      let normalized = url.replace(/[`'"\s]/g, '').trim()
      if (normalized && !normalized.startsWith('http')) {
        normalized = 'http://' + normalized
      }
      return normalized
    },

    fixImageUrl(url) {
      if (!url) return ''
      return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
    },

    parseDimensions(data) {
      if (!data) return null
      if (data.x && data.y && data.z) {
        return {
          x: Math.round(data.x * 10) / 10,
          y: Math.round(data.y * 10) / 10,
          z: Math.round(data.z * 10) / 10
        }
      }
      if (data.modelParam) {
        try {
          const modelParam = typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
          const sizeStr = modelParam.size || modelParam.modelSize || modelParam.dimensions || ''
          if (sizeStr) {
            const sizeMatch = sizeStr.match(/([\d.]+)mm[^\d]+([\d.]+)mm[^\d]+([\d.]+)mm/)
            if (sizeMatch) {
              return {
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
      return null
    },

    isTaskCompleted(status) {
      return status === 'completed' || status === 'success'
    },

    isTaskFailed(status) {
      return status === 'failed' || status === 'error'
    },

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
        const res = await getModelDetail(this.modelId)
        if (res && res.data) {
          const data = res.data
          this.modelInfo = data
          this.modelName = data.name || this.modelName
          
          this.modelUrl = this.fixImageUrl(data.downloadUrl || data.modelFile || data.modelUrl || '')
          this.modelType = this.getModelTypeFromUrl(this.modelUrl)
          
          if (!this.dimensions.x) {
            const dimensions = this.parseDimensions(data)
            if (dimensions) {
              this.dimensions = dimensions
            }
          }
          
          setTimeout(() => {
            this.showPreview = true
          }, 1000)
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

    async pollTaskStatus() {
      this.loading = true
      this.isGenerating = true
      this.pollCount = 0
      
      const poll = async () => {
        try {
          this.pollCount++
          console.log(`轮询任务状态 (${this.pollCount}/${this.maxPollCount}):`, this.modelId)
          
          const res = await getTaskStatus(this.modelId)
          console.log('任务状态响应:', res)
          
          if (res && res.data) {
            const status = res.data.Status
            const progress = res.data.progress || 0
            console.log('任务状态:', status, '进度:', progress + '%')
            
            if (this.isTaskCompleted(status)) {
              console.log('任务完成')
              this.isGenerating = false
              let modelUrl = res.data.modelUrl
              if (!modelUrl && res.data.ResultFile3Ds && res.data.ResultFile3Ds.length > 0) {
                modelUrl = res.data.ResultFile3Ds[0].Url
              }
              if (modelUrl) {
                this.modelUrl = modelUrl
                this.modelType = this.getModelTypeFromUrl(modelUrl)
                this.stopPoll()
                
                setTimeout(() => {
                  this.showPreview = true
                },1000)
                return
              }
            } else if (this.isTaskFailed(status)) {
              this.isGenerating = false
              console.error('任务失败')
              this.stopPoll()
              uni.showToast({ title: this.texts.modelGenerateFailed || '模型生成失败', icon: 'none' })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
              return
            }
          }
          
          if (this.pollCount >= this.maxPollCount) {
            console.error('轮询超时')
            this.stopPoll()
            uni.showToast({ title: this.texts.generateTimeout || '生成超时，请稍后查看', icon: 'none' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
            return
          }
          
          this.pollTimer = setTimeout(poll, 2000)
        } catch (error) {
          console.error('轮询任务状态失败:', error)
          if (this.pollCount >= this.maxPollCount) {
            this.stopPoll()
            uni.showToast({ title: this.texts.queryFailed || '查询失败', icon: 'none' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            this.pollTimer = setTimeout(poll, 2000)
          }
        }
      }
      
      poll()
    },
    
    stopPoll() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
      this.pollCount = 0
    },
    
    async handleCancelGenerate() {
      try {
        uni.showLoading({ title: this.texts.cancelling || '正在取消...' })
        const res = await cancelTask(this.modelId)
        uni.hideLoading()
        
        if (res.code === 1 || res.code === 0) {
          this.stopPoll()
          this.isGenerating = false
          this.loading = false
          uni.showToast({ title: this.texts.generateCancelled || '已取消生成', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.msg || this.texts.cancelFailed || '取消失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: this.texts.cancelFailed || '取消失败', icon: 'none' })
      }
    },
    
    handleBack() {
      uni.navigateBack()
    },
    onModelLoaded() {
      this.loading = false
      console.log('=== 模型加载完成 ===')
      
      // 初始状态设置为绿色（选中）
      this.$nextTick(() => {
        setTimeout(() => {
          this.setModelColor(0x00ff00)
        }, 100)
      })
      
      // 如果没有涂鸦截图，截取3D预览图
      if (!this.snapshotImageUrl) {
        setTimeout(() => {
          this.capturePreviewImage()
        }, 500)
      }
    },
    
    capturePreviewImage() {
      // #ifdef H5
      try {
        const canvas = document.querySelector('canvas')
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png')
          console.log('截取3D预览图成功，长度:', dataUrl.length)
          // 上传到服务器获取URL
          this.uploadPreviewImage(dataUrl)
        }
      } catch (err) {
        console.error('截取3D预览图失败:', err)
      }
      // #endif
    },
    
    async uploadPreviewImage(dataUrl: string) {
      // #ifdef H5
      try {
        // 去掉base64前缀
        const base64 = dataUrl.split(',')[1]
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        
        const formData = new FormData()
        formData.append('file', blob, 'preview.png')
        formData.append('type', 'model')
        formData.append('id', this.modelId)
        
        const baseUrl = API.BASE_URL.endsWith('/') ? API.BASE_URL.slice(0, -1) : API.BASE_URL
        const res = await fetch(baseUrl + '/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
          },
          body: formData
        })
        const data = await res.json()
        console.log('预览图上传响应:', data)
        if (data.code === 1 && data.data?.url) {
          this.snapshotImageUrl = data.data.url
          console.log('预览图上传成功:', this.snapshotImageUrl)
        }
      } catch (err) {
        console.error('预览图上传失败:', err)
      }
      // #endif
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

      // 自动缩放：如果任一维度超过100mm，自动缩小到99mm
      const maxDim = Math.max(this.dimensions.x, this.dimensions.y, this.dimensions.z)
      if (maxDim > 100) {
        const targetScale = 99 / maxDim
        this.scalePercent = Math.floor(targetScale * 100)
        this.modelScale = targetScale
        // 延迟执行缩放，确保模型已完全加载
        this.$nextTick(() => {
          setTimeout(() => {
            this.applyModelScale()
          }, 500)
        })
        uni.showToast({ title: '模型已自动缩放至99mm', icon: 'none' })
      }
    },
    
    // 模型点击事件
    onModelClick(event) {
      console.log('模型被点击:', event)
      
      if (event.isSame === false) {
        // 点击了不同模型：renderjs 已经处理了颜色和包围框
        // 这里只需保持 isModelSelected = true
        this.isModelSelected = true
        this.selectedModel = this.modelInfo
        this.isOutOfBounds = false
        return
      }
      
      // 点击同一个模型：切换选中/取消选中
      this.isModelSelected = !this.isModelSelected
      if (this.isModelSelected) {
        this.selectedModel = this.modelInfo
        if (this.isOutOfBounds) {
          this.setModelColor(0xff0000)
        } else {
          this.setModelColor(0x00ff00)
        }
        this.$nextTick(() => {
          if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
            this.$refs.preview3d.$refs.stageApp.call({
              key: 'updateBoundingBox',
              args: [],
              isReturn: false
            })
          }
        })
      } else {
        this.selectedModel = null
        if (this.isOutOfBounds) {
          this.setModelColor(0xff0000)
        } else {
          this.setModelColor(0x808080)
        }
        this.$nextTick(() => {
          if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
            this.$refs.preview3d.$refs.stageApp.call({
              key: 'updateBoundingBox',
              args: [],
              isReturn: false
            })
          }
        })
      }
    },
    
    // 边界检测事件
    onBoundaryCheck(data) {
      console.log('边界检测:', data)
      this.isOutOfBounds = data.isOutOfBounds
      
      if (data.isOutOfBounds) {
        this.boundaryMessage = '模型边缘超出边界，请调整'
      } else {
        this.boundaryMessage = ''
      }
    },
    
    // 缩放更新事件
    onScaleUpdate(data) {
      console.log('缩放更新:', data)
      if (data.scalePercent) {
        this.scalePercent = data.scalePercent
        this.modelScale = data.scalePercent / 100
      }
    },
    
    // 设置模型颜色
    async setModelColor(color) {
      console.log('设置模型颜色:', color)
      
      // #ifdef APP
      // APP端通过call方法调用renderjs中的方法
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        const stageApp = this.$refs.preview3d.$refs.stageApp
        try {
          await stageApp.call({
            key: 'setModelColor',
            args: [color],
            isReturn: false
          })
        } catch (err) {
          console.error('调用setModelColor失败:', err)
        }
      }
      // #endif
      
      // #ifndef APP
      // H5和小程序端直接操作
      if (this.$refs.preview3d) {
        const preview3d = this.$refs.preview3d
        // 尝试获取group
        if (preview3d.group) {
          this._doSetColor(preview3d.group, color)
        }
        // 尝试获取scene
        if (preview3d.scene) {
          this._doSetColor(preview3d.scene, color)
        }
      }
      // #endif
    },
    
    // 实际设置颜色的辅助方法
    _doSetColor(target, color) {
      if (!target) return
      let found = false
      target.traverse((child) => {
        if (child.isMesh && child.material) {
          found = true
          console.log('找到mesh:', child.name || 'unnamed')
          // 确保材质可以修改颜色
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.color) {
                mat.color.setHex(color)
                mat.needsUpdate = true
              }
            })
          } else {
            if (child.material.color) {
              child.material.color.setHex(color)
              child.material.needsUpdate = true
            }
          }
        }
      })
      return found
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
    onSupportChange(e) {
      this.addSupports = e.detail.value
    },
    // 应用模型缩放
    applyModelScale() {
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'scaleModelInPlace',
          args: [this.modelScale],
          isReturn: false
        })
      }
      // #endif
      
      // #ifndef APP
      if (this.$refs.preview3d && typeof this.$refs.preview3d.centerAndScale === 'function') {
        this.$refs.preview3d.centerAndScale(this.modelScale)
      }
      // #endif
    },
    
    // 重置模型位置和缩放
    handleReset() {
      console.log('=== 重置按钮被点击 ===')
      
      // 重置数据
      this.scalePercent = 100
      this.modelScale = 1
      
      // 重置旋转面板
      this.currentRotation = { x: 0, y: 0, z: 0 }
      this.showRotationPanel = false
      if (this.$refs.rotationPanel && typeof this.$refs.rotationPanel.setRotation === 'function') {
        this.$refs.rotationPanel.setRotation(0, 0, 0)
      }
      
      if (this.$refs.preview3d) {
        // 调用组件的重置方法
        if (typeof this.$refs.preview3d.resetModel === 'function') {
          try {
            this.$refs.preview3d.resetModel()
            // 重置后恢复绿色（选中状态）
            this.$nextTick(() => {
              setTimeout(() => {
                this.setModelColor(0x00ff00)
              }, 100)
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
    
    // 居中
    handleCenter() {
      console.log('居中按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'centerModel',
          args: [],
          isReturn: false
        })
        uni.showToast({
          title: this.texts.modelCentered || '模型已居中',
          icon: 'success',
          duration: 1000
        })
      }
      // #endif
    },
    
    // 旋转
    handleRotate() {
      console.log('旋转按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      // 打开旋转面板
      this.showRotationPanel = true
    },
    
    // 旋转面板：旋转变化中（实时预览）
    onRotationChanging(data) {
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'setModelRotation',
          args: [data.x, data.y, data.z],
          isReturn: false
        })
      }
      // #endif
    },
    
    // 旋转面板：旋转确认
    onRotationChange(data) {
      this.currentRotation = { x: data.x, y: data.y, z: data.z }
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'setModelRotation',
          args: [data.x, data.y, data.z],
          isReturn: false
        })
      }
      // #endif
    },
    
    // 旋转面板：重置旋转
    onRotationReset() {
      this.currentRotation = { x: 0, y: 0, z: 0 }
      // 重置旋转面板滑尺
      if (this.$refs.rotationPanel && typeof this.$refs.rotationPanel.setRotation === 'function') {
        this.$refs.rotationPanel.setRotation(0, 0, 0)
      }
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'setModelRotation',
          args: [0, 0, 0],
          isReturn: false
        })
      }
      // #endif
    },
    
    // 复制
    handleCopy() {
      console.log('复制按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      // #ifdef APP
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'copyModel',
          args: [],
          isReturn: false
        })
        uni.showToast({
          title: this.texts.copySuccess || '复制成功',
          icon: 'success',
          duration: 1000
        })
      }
      // #endif
    },
    
    // 适配
    handleFit() {
      console.log('适配按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      // #ifdef APP
      // 原功能：自动适配模型
      // if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
      //   this.$refs.preview3d.$refs.stageApp.call({
      //     key: 'fitModel',
      //     args: [],
      //     isReturn: false
      //   })
      //   uni.showToast({
      //     title: '模型已自动适配',
      //     icon: 'success',
      //     duration: 1000
      //   })
      // }
      
      // 新功能：和center一样，居中模型
      if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
        this.$refs.preview3d.$refs.stageApp.call({
          key: 'centerModel',
          args: [],
          isReturn: false
        })
        uni.showToast({
          title: this.texts.modelFitted || '模型已适配',
          icon: 'success',
          duration: 1000
        })
      }
      // #endif
    },
    
    // 删除
    handleDelete() {
      console.log('删除按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      uni.showModal({
        title: this.texts.confirmDelete || '确认删除',
        content: this.texts.confirmDeleteModelContent || '确定要删除当前模型吗？',
        success: (res) => {
          if (res.confirm) {
            // #ifdef APP
            if (this.$refs.preview3d && this.$refs.preview3d.$refs.stageApp) {
              this.$refs.preview3d.$refs.stageApp.call({
                key: 'deleteModel',
                args: [],
                isReturn: false
              })
            }
            // #endif
            // 重置选中状态
            this.isModelSelected = false
            this.selectedModel = null
            this.isOutOfBounds = false
            uni.showToast({
              title: this.texts.deleteSuccess || '删除成功',
              icon: 'success',
              duration: 1000
            })
          }
        }
      })
    },
    async handlePrint() {
      // 检查是否超出边界
      if (this.isOutOfBounds) {
        uni.showToast({
          title: this.boundaryMessage || '模型边缘超出边界，请调整',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      
      try {
        uni.showLoading({
          title: this.texts.gettingDeviceInfo || '获取设备信息...'
        })
        
        const deviceRes = await getDefaultDevice()
        console.log('默认设备响应:', deviceRes)
        console.log('默认设备数据:', deviceRes.data)
        
        const deviceId = deviceRes.data?.deviceId || deviceRes.data?.data?.deviceId
        console.log('解析后的设备ID:', deviceId)
        
        if (!deviceId) {
          uni.hideLoading()
          uni.showToast({
            title: this.texts.addDeviceFirst || '请先添加并连接打印机',
            icon: 'none'
          })
          return
        }
        
        uni.hideLoading()
        
        // 跳转到切片处理页面，使用涂鸦截图或模型预览图
        let imageUrl = this.snapshotImageUrl
        
        // 如果没有涂鸦截图，使用模型详情中的previewUrl
        if (!imageUrl && this.modelInfo && this.modelInfo.previewUrl) {
          imageUrl = this.modelInfo.previewUrl
        }
        
        // 如果都没有，使用modelUrl（虽然可能是STL）
        if (!imageUrl) {
          imageUrl = this.modelUrl
        }
        
        // 构建尺寸参数
        const dimensionsParam = this.dimensions && this.dimensions.x ? encodeURIComponent(JSON.stringify(this.dimensions)) : ''
        
        uni.navigateTo({
          url: `/pages/explore/sliceProcessing/sliceProcessing?modelId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(imageUrl)}&deviceId=${deviceId}&modelUrl=${encodeURIComponent(this.modelUrl || '')}&dimensions=${dimensionsParam}&scalePercent=${this.scalePercent}&addSupports=${this.addSupports}`
        })
      } catch (error) {
        uni.hideLoading()
        console.error('获取设备信息失败:', error)
        uni.showToast({
          title: error.message || '获取设备信息失败，请检查打印机连接',
          icon: 'none'
        })
      }
    }
  },
  beforeUnmount() {
    this.stopPoll()
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
	/* APP 端：画布区域不参与页面滚动，触摸交给 3D 跟手拖动/旋转/缩放 */
	touch-action: none;
	-webkit-user-select: none;
	user-select: none;
}

.left-toolbar {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 100;
}

.toolbar-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(51, 51, 51, 0.9);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.toolbar-btn:active {
  opacity: 0.8;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}



.toolbar-text {
  font-size: 20rpx;
  color: #fff;
}

.selection-indicator {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(42, 127, 255, 0.9);
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  z-index: 100;
}

.selection-text {
  font-size: 24rpx;
  color: #fff;
}

.setting-item.disabled {
  opacity: 0.5;
  pointer-events: none;
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

.cancel-btn {
	margin-top: 30rpx;
	padding: 16rpx 40rpx;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 8rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.cancel-btn-text {
	font-size: 28rpx;
	color: #fff;
}

.fixed-top {
	flex-shrink: 0;
}

.dimensions-bar {
	background-color: #2a2a2a;
	padding: 16rpx 24rpx;
	border-top: 1rpx solid #333;
	flex-shrink: 0;
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
	flex-shrink: 0;
}

.setting-item {
	margin-bottom: 32rpx;
}

.support-item {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.support-item .setting-label {
	margin-bottom: 0;
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

.boundary-warning {
	background-color: rgba(255, 59, 48, 0.1);
	border: 1rpx solid rgba(255, 59, 48, 0.3);
	border-radius: 8rpx;
	padding: 16rpx 24rpx;
	margin-bottom: 16rpx;
}

.warning-text {
	font-size: 24rpx;
	color: #ff3b30;
	text-align: center;
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

.next-btn.disabled {
	background-color: #666;
	opacity: 0.5;
}

.next-btn-text {
	color: #ffffff;
	font-weight: 600;
}

.next-btn:active {
	opacity: 0.8;
}

.next-btn.disabled:active {
	opacity: 0.5;
}
</style>

