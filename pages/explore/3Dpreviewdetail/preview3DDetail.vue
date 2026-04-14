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
            <text class="cancel-btn-text">{{ texts.cancelGenerate || '取消生成' }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="dimensions-bar">
      <text class="dimensions-text">{{ dimensionsText }}</text>
    </view>
    <view class="settings-section">
      <view class="setting-item" :class="{ disabled: !isModelSelected }">
        <text class="setting-label">{{ texts.scale }} {{ scalePercent }}%</text>
        <slider
          :value="scalePercent"
          :min="10"
          :max="200"
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
      <view class="setting-item support-item" :class="{ disabled: !isModelSelected }">
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
      <button class="next-btn" :class="{ disabled: isOutOfBounds }" @tap="handlePrint">
        <text class="next-btn-text">{{ texts.startPrint }}</text>
      </button>

      <!-- 底部空白区域 -->
      <view :style="{ height: safeAreaBottom + 40 + 'px' }"></view>
    </view>
  </view>
</template>

<script lang="ts">
import { sendPrintCommand } from '@/api/iot.ts'
import { getModelDetail } from '@/api/models.ts'
import { getDefaultDevice } from '@/api/devices.ts'
import { getTaskStatus, cancelTask } from '@/api/hunyuan3d.ts'
import { uploadModelFile } from '@/api/upload.ts'
import Preview3D from '@/components/cc-threeJs/preview3D.vue'
import RotationPanel from './rotation-panel/rotation-panel.vue'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'
import { API } from '@/constants/index'

type LanguageStore = ReturnType<typeof useLanguageStore>
type UserStore = ReturnType<typeof useUserStore>

interface UniSwitchChangeEvent {
  detail: { value: boolean }
}

interface Dimensions {
  x: number
  y: number
  z: number
}

interface ModelInfo {
  id?: string | number
  name?: string
  downloadUrl?: string
  modelFile?: string
  modelUrl?: string
  previewUrl?: string
  modelParam?: string | Record<string, unknown>
}

interface Rotation {
  x: number
  y: number
  z: number
}

interface TaskResult {
  Url?: string
  url?: string
}

interface TaskData {
  Status?: string
  progress?: number
  ResultFile3Ds?: TaskResult[]
  modelUrl?: string
}

interface TaskResponse {
  code?: number
  msg?: string
  data?: TaskData
}

interface PageOptions {
  id?: string
  name?: string
  modelUrl?: string
  url?: string
  modelType?: string
  modelImage?: string
  imageUrl?: string
  dimensions?: string
}

interface ModelDetailResponse {
  code: number
  data?: {
    modelId?: string | number
    name?: string
    downloadUrl?: string
    modelFile?: string
    modelUrl?: string
    previewUrl?: string
    modelParam?: string | Record<string, unknown>
  }
}

interface DefaultDeviceResponse {
  code: number
  data?: {
    deviceId?: string
    deviceName?: string
    data?: {
      deviceId?: string
      deviceName?: string
    }
  }
}

interface ThreeJSObject {
  traverse: (callback: (child: ThreeJSChild) => void) => void
}

interface ThreeJSChild {
  isMesh?: boolean
  material?: ThreeJSMaterial | ThreeJSMaterial[]
  name?: string
}

interface ThreeJSMaterial {
  color?: { setHex: (color: number) => void }
  needsUpdate?: boolean
}

interface UploadResponse {
  code: number
  data?: {
    fileUrl?: string
    url?: string
    path?: string
    files?: Array<{ fileUrl: string }>
  }
}

export default {
  components: {
    Preview3D,
    RotationPanel
  },
  data() {
    return {
      modelId: '' as string,
      modelName: '' as string,
      modelUrl: '' as string,
      modelType: '' as string,
      snapshotImageUrl: '' as string,
      loading: false as boolean,
      pollTimer: null as ReturnType<typeof setTimeout> | null,
      pollCount: 0 as number,
      maxPollCount: 120 as number,
      statusBarHeight: 0 as number,
      topBarHeightPx: 0 as number,
      safeAreaBottom: 0 as number,
      dimensions: {
        x: 0,
        y: 0,
        z: 0
      } as Dimensions,
      originalDimensions: {
        x: 0,
        y: 0,
        z: 0
      } as Dimensions,
      modelScale: 1 as number,
      scalePercent: 100 as number,
      addSupports: false as boolean,
      modelInfo: {} as ModelInfo,
      showPreview: false as boolean,
      isModelSelected: true as boolean,
      isGenerating: false as boolean,
      selectedModel: null as ModelInfo | null,
      isOutOfBounds: false as boolean,
      boundaryMessage: '' as string,
      showRotationPanel: false as boolean,
      currentRotation: { x: 0, y: 0, z: 0 } as Rotation
    }
  },
  computed: {
    languageStore(): LanguageStore {
      return useLanguageStore()
    },
    userStore(): UserStore {
      return useUserStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.explore
    },
    topBarStyle(): Record<string, string> {
      const heightPx = (this.topBarHeightPx || 0) + (this.statusBarHeight || 0)
      return {
        paddingTop: `${this.statusBarHeight || 0}px`,
        height: `${heightPx}px`
      }
    },
    dimensionsText(): string {
      if (
        this.isModelSelected &&
        this.dimensions &&
        this.dimensions.x &&
        this.dimensions.y &&
        this.dimensions.z
      ) {
        const factor = this.scalePercent / 100
        const x = (this.dimensions.x * factor).toFixed(1)
        const y = (this.dimensions.y * factor).toFixed(1)
        const z = (this.dimensions.z * factor).toFixed(1)
        return `${this.texts.size}: ${x}mm(X)×${y}mm(Y)×${z}mm(Z)`
      }
      return `${this.texts.size}: 0mm(X)×0mm(Y)×0mm(Z)`
    }
  },
  onLoad(options: PageOptions): void {
    this.languageStore.loadLanguage()
    this.modelId = options.id || ''

    if (!this.modelId || String(this.modelId) === 'NaN' || String(this.modelId) === 'undefined') {
      uni.showToast({ title: this.texts.paramError || '参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }

    this.modelName = options.name ? decodeURIComponent(options.name) : ''
    this.modelUrl = this.normalizeUrl(decodeURIComponent(options.modelUrl || options.url || ''))
    this.modelType = options.modelType || this.getModelTypeFromUrl(this.modelUrl)
    this.snapshotImageUrl = options.modelImage
      ? decodeURIComponent(options.modelImage)
      : options.imageUrl
        ? decodeURIComponent(options.imageUrl)
        : ''

    if (options.dimensions) {
      try {
        const parsedDimensions = JSON.parse(decodeURIComponent(options.dimensions))
        const dimensions = this.parseDimensions(parsedDimensions)
        if (dimensions) {
          this.dimensions = dimensions
          this.originalDimensions = { ...dimensions }
          console.log('使用从 modelDetail 传递的尺寸:', this.dimensions)
        }
      } catch (e) {
        console.error('解析尺寸参数失败:', e)
      }
    }

    console.log('解析后的页面参数:', {
      id: this.modelId,
      name: this.modelName,
      url: this.modelUrl,
      modelType: this.modelType,
      dimensions: this.dimensions,
      hasUrl: !!this.modelUrl,
      urlLength: this.modelUrl?.length
    })

    const ext = this.modelUrl?.split('.').pop()?.toLowerCase() || ''
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
      setTimeout(() => {
        this.showPreview = true
      }, 1000)
    } else if (this.modelId) {
      this.checkTaskStatusOnce()
    }
  },
  methods: {
    normalizeUrl(url: string): string {
      if (!url) return ''
      let normalized = url.replace(/[`'"\s]/g, '').trim()
      if (normalized && !normalized.startsWith('http')) {
        normalized = 'https://' + normalized
      }
      return normalized
    },
    base64ToArrayBuffer(base64: string): ArrayBuffer {
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes.buffer
    },

    fixImageUrl(url: string): string {
      if (!url) return ''
      return url
        .replace('localhost:9000', '47.102.212.37:9000')
        .replace('api/uploads/image', '9000/image')
    },

    parseDimensions(data: { x?: number; y?: number; z?: number; modelParam?: string | Record<string, unknown> }): Dimensions | null {
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
          const modelParam =
            typeof data.modelParam === 'string' ? JSON.parse(data.modelParam) : data.modelParam
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

    isTaskCompleted(status: string | undefined): boolean {
      const s = status?.toLowerCase()
      return s === 'completed' || s === 'success' || s === 'done'
    },

    isTaskFailed(status: string | undefined): boolean {
      const s = status?.toLowerCase()
      return s === 'failed' || s === 'error'
    },

    async checkTaskStatusOnce(): Promise<void> {
      try {
        this.loading = true
        const res: TaskResponse = await getTaskStatus(this.modelId) as TaskResponse
        if (res && res.data) {
          const status = res.data.Status
          if (this.isTaskCompleted(status) && res.data.ResultFile3Ds && res.data.ResultFile3Ds.length > 0) {
            let modelUrl = (res.data.ResultFile3Ds[0].Url || res.data.ResultFile3Ds[0].url || '')
              .trim()
              .replace(/[`\s]/g, '')
            if (modelUrl) {
              this.modelUrl = modelUrl
              this.modelType = this.getModelTypeFromUrl(modelUrl)
              this.isGenerating = false
              setTimeout(() => {
                this.showPreview = true
              }, 1000)
              return
            }
          }
        }
        this.pollTaskStatus()
      } catch (error) {
        console.error('查询任务状态失败:', error)
        this.pollTaskStatus()
      }
    },

    initStatusBarHeight(): void {
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
    async loadModelDetail(): Promise<void> {
      try {
        this.loading = true
        const res: ModelDetailResponse = await getModelDetail(this.modelId)
        if (res && res.data) {
          const data = res.data
          this.modelInfo = data
          this.modelName = data.name || this.modelName

          this.modelUrl = this.fixImageUrl(
            data.downloadUrl || data.modelFile || data.modelUrl || ''
          )
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
      } catch (error: unknown) {
        console.error(
          '获取模型详情失败:',
          error instanceof Error ? error.message : error ? JSON.stringify(error) : '未知错误'
        )
        const errorMsg = error instanceof Error ? error.message : ''
        if (errorMsg.includes(this.texts.modelNotExist)) {
          uni.showToast({ title: this.texts.modelNotExist, icon: 'none' })
        } else {
          uni.showToast({ title: this.texts.loadModelInfoFailed, icon: 'none' })
        }
      } finally {
        this.loading = false
      }
    },

    async pollTaskStatus(): Promise<void> {
      this.loading = true
      this.isGenerating = true
      this.pollCount = 0

      const poll = async (): Promise<void> => {
        try {
          this.pollCount++
          console.log(`轮询任务状态 (${this.pollCount}/${this.maxPollCount}):`, this.modelId)

          const res: TaskResponse = await getTaskStatus(this.modelId) as TaskResponse
          console.log('任务状态响应:', res)

          if (res && res.data) {
            const status = res.data.Status
            const progress = res.data.progress || 0
            console.log('任务状态:', status, '进度:', progress + '%')

            if (this.isTaskCompleted(status)) {
              console.log('任务完成')
              this.isGenerating = false
              let modelUrl = null
              if (res.data.ResultFile3Ds && res.data.ResultFile3Ds.length > 0) {
                modelUrl = (res.data.ResultFile3Ds[0].Url || res.data.ResultFile3Ds[0].url || '')
                  .trim()
                  .replace(/[`\s]/g, '')
              }
              if (!modelUrl) {
                modelUrl = res.data.modelUrl
              }
              if (modelUrl) {
                this.modelUrl = modelUrl
                this.modelType = this.getModelTypeFromUrl(modelUrl)
                this.stopPoll()

                setTimeout(() => {
                  this.showPreview = true
                }, 1000)
                return
              }
            } else if (this.isTaskFailed(status)) {
              this.isGenerating = false
              console.error('任务失败')
              this.stopPoll()
              uni.showToast({
                title: this.texts.modelGenerateFailed || '模型生成失败',
                icon: 'none'
              })
              return
            }
          }

          if (this.pollCount >= this.maxPollCount) {
            console.error('轮询超时')
            this.stopPoll()
            uni.showToast({
              title: this.texts.generateTimeout || '查询次数已达上限，模型仍在生成中',
              icon: 'none'
            })
            return
          }

          this.pollTimer = setTimeout(poll, 60000)
        } catch (error) {
          console.error('轮询任务状态失败:', error)
          if (this.pollCount >= this.maxPollCount) {
            this.stopPoll()
            uni.showToast({ title: this.texts.queryFailed || '查询失败', icon: 'none' })
          } else {
            this.pollTimer = setTimeout(poll, 60000)
          }
        }
      }

      poll()
    },

    stopPoll(): void {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
      this.pollCount = 0
    },

    async handleCancelGenerate(): Promise<void> {
      try {
        uni.showLoading({ title: this.texts.cancelling || '正在取消...' })
        const res = await cancelTask(this.modelId) as TaskResponse
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

    handleBack(): void {
      uni.navigateBack()
    },
    onModelLoaded(): void {
      this.loading = false
      console.log('=== 模型加载完成 ===')

      this.$nextTick(() => {
        setTimeout(() => {
          this.setModelColor(0x00ff00)
        }, 100)
      })
    },

    capturePreviewImage(): void {
      // #ifdef H5
      try {
        const canvas = document.querySelector('canvas')
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png')
          console.log('截取3D预览图成功，长度:', dataUrl.length)
          this.uploadPreviewImage(dataUrl)
        }
      } catch (err) {
        console.error('截取3D预览图失败:', err)
      }
      // #endif
    },

    async uploadPreviewImage(dataUrl: string): Promise<void> {
      // #ifdef H5
      try {
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
            Authorization: this.userStore.token
              ? `Bearer ${this.userStore.token}`
              : ''
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
    onModelLoadError(error: Error | string | Record<string, unknown>): void {
      this.loading = false
      console.error(
        '模型加载失败:',
        error instanceof Error ? error.message : error ? JSON.stringify(error) : '未知错误'
      )
      uni.showToast({ title: this.texts.modelLoadFailed, icon: 'none' })
    },
    onModelDimensions(dimensions: Dimensions): void {
      if (!dimensions || typeof dimensions.x === 'undefined' || dimensions.x === 0) {
        return
      }

      const actualDimensions = {
        x: Math.round(dimensions.x * 10) / 10,
        y: Math.round(dimensions.y * 10) / 10,
        z: Math.round(dimensions.z * 10) / 10
      }

      if (this.originalDimensions.x > 0) {
        const originalMax = Math.max(this.originalDimensions.x, this.originalDimensions.y, this.originalDimensions.z)
        const actualMax = Math.max(actualDimensions.x, actualDimensions.y, actualDimensions.z)
        if (originalMax > 0 && actualMax > 0) {
          const targetScale = originalMax / actualMax
          this.scalePercent = Math.round(targetScale * 100)
          this.modelScale = targetScale
        }
        this.dimensions = { ...this.originalDimensions }
      } else {
        this.dimensions = actualDimensions
      }

      const maxDim = Math.max(this.dimensions.x * this.modelScale, this.dimensions.y * this.modelScale, this.dimensions.z * this.modelScale)
      if (maxDim > 100) {
        this.isOutOfBounds = true
        this.boundaryMessage = this.texts.modelTooLarge || '模型尺寸超过100mm，禁止打印'
      } else {
        this.isOutOfBounds = false
        this.boundaryMessage = ''
      }
    },

    onModelClick(event: { isSame?: boolean }): void {
      console.log('模型被点击:', event)

      if (event.isSame === false) {
        this.isModelSelected = true
        this.selectedModel = this.modelInfo
        this.isOutOfBounds = false
        return
      }

      this.isModelSelected = !this.isModelSelected
      if (this.isModelSelected) {
        this.selectedModel = this.modelInfo
        if (this.isOutOfBounds) {
          this.setModelColor(0xff0000)
        } else {
          this.setModelColor(0x00ff00)
        }
        this.$nextTick(() => {
          if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
            (this.$refs.preview3d as any).$refs.stageApp.call({
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
          if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
            (this.$refs.preview3d as any).$refs.stageApp.call({
              key: 'updateBoundingBox',
              args: [],
              isReturn: false
            })
          }
        })
      }
    },

    onBoundaryCheck(data: { isOutOfBounds: boolean }): void {
      console.log('边界检测:', data)
      this.isOutOfBounds = data.isOutOfBounds

      if (data.isOutOfBounds) {
        this.boundaryMessage = this.texts.modelOutOfBounds || '模型边缘超出边界，请调整'
      } else {
        this.boundaryMessage = ''
      }
    },

    onScaleUpdate(data: { scalePercent?: number }): void {
      console.log('缩放更新:', data)
      if (data.scalePercent) {
        this.scalePercent = data.scalePercent
        this.modelScale = data.scalePercent / 100
      }
    },

    async setModelColor(color: number): Promise<void> {
      console.log('设置模型颜色:', color)

      // #ifdef APP
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        const stageApp = (this.$refs.preview3d as any).$refs.stageApp
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
      if (this.$refs.preview3d) {
        const preview3d = this.$refs.preview3d as any
        if (preview3d.group) {
          this._doSetColor(preview3d.group, color)
        }
        if (preview3d.scene) {
          this._doSetColor(preview3d.scene, color)
        }
      }
      // #endif
    },

    _doSetColor(target: ThreeJSObject, color: number): boolean {
      if (!target) return false
      let found = false
      target.traverse((child: ThreeJSChild) => {
        if (child.isMesh && child.material) {
          found = true
          console.log('找到mesh:', child.name || 'unnamed')
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: ThreeJSMaterial) => {
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
    getModelTypeFromUrl(url: string): string {
      if (!url) return ''
      const ext = url.split('.').pop()?.toLowerCase() || ''
      const typeMap: Record<string, string> = {
        glb: 'glb',
        gltf: 'gltf',
        obj: 'obj',
        stl: 'stl'
      }
      return typeMap[ext] || ''
    },
    onScaleChange(e: { detail: { value: number } }): void {
      this.scalePercent = e.detail.value
      this.modelScale = this.scalePercent / 100
      this.applyModelScale()
    },
    onScaleChanging(e: { detail: { value: number } }): void {
      this.scalePercent = e.detail.value
      this.modelScale = this.scalePercent / 100
      this.applyModelScale()
    },
    onSupportChange(e: Event & { detail?: { value: boolean } }): void {
      this.addSupports = e.detail?.value ?? false
    },
    applyModelScale(): void {
      // #ifdef APP
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
          key: 'scaleModelInPlace',
          args: [this.modelScale],
          isReturn: false
        })
      }
      // #endif

      // #ifndef APP
      if (this.$refs.preview3d && typeof (this.$refs.preview3d as any).centerAndScale === 'function') {
        (this.$refs.preview3d as any).centerAndScale(this.modelScale)
      }
      // #endif
    },

    handleReset(): void {
      console.log('=== 重置按钮被点击 ===')

      this.scalePercent = 100
      this.modelScale = 1

      this.currentRotation = { x: 0, y: 0, z: 0 }
      this.showRotationPanel = false
      if (this.$refs.rotationPanel && typeof (this.$refs.rotationPanel as any).setRotation === 'function') {
        (this.$refs.rotationPanel as any).setRotation(0, 0, 0)
      }

      if (this.$refs.preview3d) {
        if (typeof (this.$refs.preview3d as any).resetModel === 'function') {
          try {
            (this.$refs.preview3d as any).resetModel()
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

    safeApplyScale(): void {
      try {
        if (this.$refs.preview3d && (this.$refs.preview3d as any).centerAndScale) {
          (this.$refs.preview3d as any).centerAndScale(this.modelScale)
        }
      } catch (error) {
        console.warn('缩放应用失败:', error)
      }
    },

    handleCenter(): void {
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
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
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

    handleRotate(): void {
      console.log('旋转按钮被点击')
      if (!this.isModelSelected) {
        uni.showToast({
          title: this.texts.pleaseSelectModel || '请先选中模型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      this.showRotationPanel = true
    },

    onRotationChanging(data: Rotation): void {
      // #ifdef APP
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
          key: 'setModelRotation',
          args: [data.x, data.y, data.z],
          isReturn: false
        })
      }
      // #endif
    },

    onRotationChange(data: Rotation): void {
      this.currentRotation = { x: data.x, y: data.y, z: data.z }
      // #ifdef APP
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
          key: 'setModelRotation',
          args: [data.x, data.y, data.z],
          isReturn: false
        })
      }
      // #endif
    },

    onRotationReset(): void {
      this.currentRotation = { x: 0, y: 0, z: 0 }
      if (this.$refs.rotationPanel && typeof (this.$refs.rotationPanel as any).setRotation === 'function') {
        (this.$refs.rotationPanel as any).setRotation(0, 0, 0)
      }
      // #ifdef APP
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
          key: 'setModelRotation',
          args: [0, 0, 0],
          isReturn: false
        })
      }
      // #endif
    },

    handleCopy(): void {
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
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
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

    handleFit(): void {
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
      if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
        (this.$refs.preview3d as any).$refs.stageApp.call({
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

    handleDelete(): void {
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
        success: (res: { confirm: boolean }) => {
          if (res.confirm) {
            // #ifdef APP
            if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
              (this.$refs.preview3d as any).$refs.stageApp.call({
                key: 'deleteModel',
                args: [],
                isReturn: false
              })
            }
            // #endif
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
    async handlePrint(): Promise<void> {
      if (this.isOutOfBounds) {
        uni.showToast({
          title: this.boundaryMessage || '模型尺寸超过100mm，禁止打印',
          icon: 'none',
          duration: 2000
        })
        return
      }

      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }

      try {
        uni.showLoading({ title: this.texts.exportingModel || '导出模型中...' })

        let modifiedModelUrl = this.modelUrl

        // #ifdef APP-PLUS
        if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
          console.log('开始调用 exportModifiedSTL')
          const filePath = await (this.$refs.preview3d as any).$refs.stageApp.call({
            key: 'exportModifiedSTL',
            args: [],
            isReturn: true
          })
          console.log('exportModifiedSTL 返回文件路径:', filePath)

          if (filePath) {
            try {
              console.log('开始上传文件:', filePath)
              const uploadRes: UploadResponse = await uploadModelFile(filePath)
              console.log('上传响应:', uploadRes)
              if (uploadRes.code === 1 && uploadRes.data) {
                modifiedModelUrl =
                  uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path || ''
                console.log('修改后的模型上传成功:', modifiedModelUrl)
              }
            } catch (err) {
              console.error('上传失败:', err)
            }
          } else {
            console.log('filePath 为空，跳过导出')
          }
        }
        // #endif

        // #ifdef H5
        if (this.$refs.preview3d && (this.$refs.preview3d as any).$refs.stageApp) {
          const stlBase64 = await (this.$refs.preview3d as any).$refs.stageApp.call({
            key: 'exportModifiedSTL',
            args: [],
            isReturn: true
          })

          if (stlBase64) {
            const binaryString = atob(stlBase64)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            const blob = new Blob([bytes], { type: 'application/octet-stream' })
            const formData = new FormData()
            formData.append('file', blob, `modified_${Date.now()}.stl`)

            const baseUrl = API.BASE_URL.endsWith('/') ? API.BASE_URL.slice(0, -1) : API.BASE_URL
            const token = this.userStore.token

            try {
              const res = await fetch(baseUrl + '/upload/model', {
                method: 'POST',
                headers: {
                  Authorization: token ? `Bearer ${token}` : ''
                },
                body: formData
              })
              const data = await res.json()
              if (data.code === 1 && data.data) {
                modifiedModelUrl = data.data.url || data.data.fileUrl || data.data.path
                console.log('修改后的模型上传成功:', modifiedModelUrl)
              }
            } catch (err) {
              console.error('上传修改后的模型失败:', err)
            }
          }
        }
        // #endif

        uni.showLoading({ title: this.texts.gettingDeviceInfo || '获取设备信息...' })

        const deviceRes: DefaultDeviceResponse = await getDefaultDevice()
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

        let imageUrl = this.snapshotImageUrl
        if (!imageUrl && this.modelInfo && this.modelInfo.previewUrl) {
          imageUrl = this.modelInfo.previewUrl
        }
        if (!imageUrl) {
          imageUrl = this.modelUrl
        }

        const dimensionsParam =
          this.dimensions && this.dimensions.x
            ? encodeURIComponent(JSON.stringify(this.dimensions))
            : ''

        uni.navigateTo({
          url: `/pages/explore/sliceProcessing/sliceProcessing?modelId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(imageUrl)}&deviceId=${deviceId}&modelUrl=${encodeURIComponent(modifiedModelUrl || '')}&dimensions=${dimensionsParam}&scalePercent=${this.scalePercent}&addSupports=${this.addSupports}`
        })
      } catch (error: unknown) {
        uni.hideLoading()
        console.error('获取设备信息失败:', error)
        const errorMsg = error instanceof Error ? error.message : ''
        uni.showToast({
          title:
            errorMsg || this.texts.getDeviceInfoFailed || '获取设备信息失败，请检查打印机连接',
          icon: 'none'
        })
      }
    }
  },
  beforeUnmount(): void {
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
  background-color: rgba(26, 26, 26, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(8rpx);
}

.loading-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.loading-text::before {
  content: '';
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-top-color: #2a7fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.cancel-btn {
  padding: 20rpx 48rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(238, 90, 90, 0.35);
  transition: all 0.3s ease;
}

.cancel-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(238, 90, 90, 0.25);
}

.cancel-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
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
