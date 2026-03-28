<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.slicePreview" @back="handleBack" />
    
    <scroll-view scroll-y class="content-scroll">
      <!-- 模型图片 -->
      <view class="model-image-section">
        <image 
          class="model-image" 
          :src="modelImage" 
          mode="aspectFit"
          @error="handleImageError"
        />
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress.toFixed(1) }}%</text>
      </view>
      
      <!-- 处理步骤和状态 -->
      <view class="status-box">
        <view class="steps-section">
          <view 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 'completed': step.completed, 'active': step.active }"
          >
            <view class="step-icon">
              <text v-if="step.completed" class="check-icon">✓</text>
              <view v-else-if="step.active" class="loading-circle"></view>
              <view v-else class="circle"></view>
            </view>
            <text class="step-text">{{ step.text }}</text>
          </view>
        </view>
        

      </view>
      
      <!-- 提示信息 -->
      <view class="tips-section">
        <text class="tips-text">
          {{ texts.processingTips }}
          <text class="link-text" @click="goToPrintRecords">「{{ texts.myPrintRecords }}」</text>
          {{ texts.view }}
        </text>
      </view>
    </scroll-view>
    
    <!-- 底部按钮区域 -->
    <view class="bottom-section">
      <view class="print-hint">
        <text class="hint-text">{{ texts.autoPrintAfterProcess }}</text>
      </view>
      <view class="cancel-btn" @click="handleCancel">
        <text class="cancel-btn-text">{{ texts.cancelProcessing }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'
import { getModelDetail, scaleAndSliceModel, getScaleAndSliceStatus } from '@/api/models.ts'
import { sendPrintCommand, getDeviceStatus, connectSSE } from '@/api/iot.ts'
import { getDefaultDevice, getDeviceList } from '@/api/devices.ts'
import { createPrintTask } from '@/api/printTasks.ts'

export default {
  data() {
    return {
      modelId: '',
      modelName: '',
      modelImage: '',
      modelUrl: '',
      progress: 0,
      steps: [],

      taskId: '',
      gcodeUrl: '',
      modelDimensions: '', // 模型尺寸
      printTime: '', // 打印时间
      materialWeight: '', // 材料重量
      originalDimensions: null, // 从preview3DDetail传入的原始尺寸
      realTaskCompleted: false, // 真实任务是否完成

      scalePercent: 100, // 缩放比例
      addSupports: false, // 是否添加支撑结构
      taskFailed: false, // 任务是否失败
      eventSource: null, // SSE连接实例
      fakeTimer: null, // 假进度定时器
      pollTimer: null, // 轮询定时器
      isPaused: false // 是否暂停
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    }
  },
  async onLoad(options) {

    this.modelId = options.modelId || ''
    try {
      this.modelName = options.modelName ? decodeURIComponent(options.modelName) : ''
    } catch (e) {
      this.modelName = options.modelName || ''
    }
    try {
      this.modelImage = options.modelImage ? decodeURIComponent(options.modelImage) : ''
    } catch (e) {
      this.modelImage = options.modelImage || ''
    }
    this.scalePercent = parseFloat(options.scalePercent) || 100
    // 自定义模型没有预览图，使用默认图片（但如果传了有效图片则保留）
    if (!this.modelImage || this.modelImage.endsWith('.stl')) {
      this.modelImage = '/static/images/logo.png'
    }

    
    // 接收从preview3DDetail传入的尺寸
    if (options.dimensions) {
      try {
        this.originalDimensions = JSON.parse(decodeURIComponent(options.dimensions))
      } catch (e) {}
    }
    
    // 接收缩放比例、设备ID和支撑选项
    this.scalePercent = parseFloat(options.scalePercent) || 100
    this.deviceId = options.deviceId || ''
    this.addSupports = options.addSupports === 'true' || options.addSupports === true
    
    // 加载语言和初始化文本
    this.languageStore.loadLanguage()
    this.initializeTexts()
    
    // 如果是自定义涂鸦模型（custom_ 开头），直接使用传入的 modelUrl
    if (this.modelId.startsWith('custom_')) {
      try {
        this.modelUrl = options.modelUrl ? decodeURIComponent(options.modelUrl) : ''
      } catch (e) {
        this.modelUrl = ''
      }

      if (this.modelUrl) {
        this.startSliceTask()
      } else {
        uni.showToast({ title: this.texts.modelFileNotFound || '模型文件不存在', icon: 'none' })
      }
      return
    }
    
    // 加载模型详情获取图片和模型URL，完成后开始切片
    await this.loadModelImages()
  },
  onUnload() {
    this.clearAllTimers()
    if (this.eventSource) {
      this.eventSource.close()
    }
  },
  methods: {
    initializeTexts() {
      // 初始化步骤文本
      this.steps = [
        { text: this.texts.pendingTaskGenerated || '待打印任务已生成', completed: false, active: true },
        { text: this.texts.printTimeAnalyzed || '打印时间已分析完成', completed: false, active: false },
        { text: this.texts.modelConsumptionAnalyzed || '模型消耗克数已分析完成', completed: false, active: false },
        { text: this.texts.modelDimensionsAnalyzed || '模型尺寸已分析完成', completed: false, active: false },
        { text: this.texts.processingComplete || '模型处理完成，准备打印', completed: false, active: false }
      ]
      
    },
    async startSliceTask() {

      if (!this.modelUrl) {
        uni.showToast({ title: this.texts.modelFileNotFound || '模型文件不存在', icon: 'none' })
        return
      }
      
      // 提交真实的切片任务到后端
      try {
        const scaleFactor = this.scalePercent / 100

        const submitRes = await scaleAndSliceModel({
          modelIdOrUrl: this.modelId,
          scaleFactor: scaleFactor,
          deviceId: this.deviceId,
          addSupports: this.addSupports
        })

        
        console.log('scaleAndSlice返回:', JSON.stringify(submitRes))
        if (submitRes.code === 1 || submitRes.code === 0) {
          const taskId = submitRes.data?.taskId
          console.log('获取到taskId:', taskId)

          if (taskId) {
            this.taskId = taskId
            this.pollRealTaskStatus(taskId)
          } else {
            console.error('没有获取到taskId')
          }
        } else {
          console.error('scaleAndSlice返回错误:', submitRes.msg)
        }
      } catch (err) {
        console.error('提交切片任务失败:', err)
        return
      }
      
      // 初始化进度显示
      this.steps[0].completed = true
      this.steps[0].active = false
      this.steps[1].active = true
      this.progress = 0
    },
    
    clearAllTimers() {
      if (this.fakeTimer) {
        clearInterval(this.fakeTimer)
        this.fakeTimer = null
      }
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },
    async pollRealTaskStatus(taskId) {
      let fakeProgress = 0
      let realCompleted = false
      let realFailed = false
      let gcodeUrl = ''
      let dimensions = ''
      let printTime = ''
      let materialWeight = ''

      // 假进度定时器，每50ms增加0.2%，独立运行到99%
      this.fakeTimer = setInterval(() => {
        if (this.isPaused) return
        if (fakeProgress < 99 && !realFailed) {
          fakeProgress = Math.min(99, fakeProgress + 0.5)
          this.progress = Math.floor(fakeProgress)
          // 根据假进度更新步骤
          if (this.progress >= 30 && !this.steps[1].completed) {
            this.steps[1].completed = true
            this.steps[1].active = false
            this.steps[2].active = true
          }
          if (this.progress >= 55 && !this.steps[2].completed) {
            this.steps[2].completed = true
            this.steps[2].active = false
            this.steps[3].active = true
          }
          if (this.progress >= 80 && !this.steps[3].completed) {
            this.steps[3].completed = true
            this.steps[3].active = false
            this.steps[4].active = true
          }
        }
      }, 50)

      // 使用轮询查询真实任务状态
      const poll = async () => {
        if (this.isPaused) {
          this.pollTimer = setTimeout(poll, 500)
          return
        }
        try {
          const res = await getScaleAndSliceStatus(taskId)
          console.log('轮询状态:', JSON.stringify(res))

          if (res.code !== 1 && res.code !== 0) {
            this.pollTimer = setTimeout(poll, 2000)
            return
          }

          const data = res.data
          const status = data?.status

          if (status === 'COMPLETED') {
            realCompleted = true
            gcodeUrl = data?.gcodeUrl || ''
            dimensions = data?.dimensions || ''
            printTime = data?.printTime || ''
            materialWeight = data?.materialWeight || ''
            // 保存切片预计耗时和耗材
            this.printTimeHms = data?.printTimeHms || ''
            this.filamentLengthM = data?.filamentLengthM || 0
            checkComplete()
          } else if (status === 'FAILED') {
            realFailed = true
            clearInterval(this.fakeTimer)
            this.taskFailed = true
            this.progress = 0
            const errorMsg = data?.errorMessage || ''
            uni.showModal({
              title: this.texts.sliceFailed || '切片失败',
              content: errorMsg || this.texts.sliceFailedContent || '模型切片处理失败，请稍后重试或联系客服',
              showCancel: false,
              confirmText: this.texts.confirm || '确定'
            })
          } else {
            this.pollTimer = setTimeout(poll, 1500)
          }
        } catch (error) {
          console.error('轮询状态失败:', error)
          this.pollTimer = setTimeout(poll, 2000)
        }
      }

      // 检查是否完成（假进度和真进度都完成）
      const checkComplete = () => {
        if (realCompleted && fakeProgress >= 99) {
          clearInterval(this.fakeTimer)
          this.realTaskCompleted = true
          this.progress = 100
          this.steps[1].completed = true
          this.steps[2].completed = true
          this.steps[3].completed = true
          this.steps[4].completed = true
          this.steps[4].active = false
          this.gcodeUrl = gcodeUrl
          this.modelDimensions = dimensions
          this.printTime = printTime
          this.materialWeight = materialWeight
          this.checkBothCompleted()
        } else if (realCompleted) {
          // 真实完成但假进度还没到99%，继续等待假进度
          setTimeout(checkComplete, 200)
        }
      }

      poll()
    },

    checkBothCompleted() {
      if (this.taskFailed) return
      if (this.realTaskCompleted) {
        this.sendPrintCommandAfterSlice()
      }
    },

    handleBack() {
      uni.navigateBack()
    },
    handleImageError() {
      this.modelImage = ''
    },
    
    async loadModelImages() {
      try {
        const res = await getModelDetail(this.modelId)

        // 检查响应状态
        if (!res || (res.code !== 0 && res.code !== 1)) {
          throw new Error(res?.msg || '获取详情失败')
        }
        
        const data = res.data || {}

        // 使用与modelDetail.vue完全相同的fixImageUrl函数
        const fixImageUrl = (url) => {
          if (!url) return ''
          return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
        }
        
        // 将previewUrl放入images数组中，与modelDetail.vue保持一致
        const images = data.previewUrl ? [fixImageUrl(data.previewUrl)] : []
        
        if (images.length > 0) {
          this.modelImage = images[0]
        } else {
          this.modelImage = '/static/images/logo.png'
        }
        
        // 获取模型文件URL
        this.modelUrl = data.downloadUrl || data.modelFile || data.modelUrl || ''

        // 获取到模型URL后开始切片任务
        if (this.modelUrl) {
          this.startSliceTask()
        } else {
          uni.showToast({ title: this.texts.modelFileNotFound || '模型文件不存在', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: this.texts.loadModelInfoFailed || '加载模型信息失败', icon: 'none' })
      }
    },
    async sendPrintCommandAfterSlice() {
      try {
        uni.showLoading({ title: this.texts.sendingPrintCommand || '正在发送打印指令...' })
        
        // 获取设备ID
        let deviceId = ''
        const deviceRes = await getDefaultDevice()
        if (deviceRes.data?.deviceId) {
          deviceId = deviceRes.data.deviceId
        } else {
          const listRes = await getDeviceList()
          const devices = listRes.data?.records || listRes.data || []
          if (devices.length > 0) {
            deviceId = devices[0].deviceId
          }
        }
        
        if (!deviceId) {
          uni.hideLoading()
          uni.showToast({ title: this.texts.pleaseAddDevice || '请先添加设备', icon: 'none' })
          return
        }
        
        // 检查设备状态
        const statusRes = await getDeviceStatus(deviceId)
        const deviceStatus = statusRes.data?.status || statusRes.data
        if (deviceStatus === 'PRINTING' || deviceStatus === 'PAUSED') {
          uni.hideLoading()
          uni.showModal({
            title: this.texts.deviceBusy || '设备忙',
            content: this.texts.deviceBusyContent || '设备正在打印中，请先停止当前任务',
            showCancel: false,
            confirmText: this.texts.confirm || '确定'
          })
          return
        }
        if (deviceStatus === 'OFFLINE' || deviceStatus === 'offline') {
          uni.hideLoading()
          uni.showModal({
            title: this.texts.deviceOffline || '设备离线',
            content: this.texts.deviceOfflineContent || '设备当前离线，请检查设备连接状态',
            showCancel: false,
            confirmText: this.texts.confirm || '确定'
          })
          return
        }
        
        // 创建打印任务记录
        let printTaskId = ''
        try {
          const taskRes = await createPrintTask({
            modelId: parseInt(this.modelId) || 0,
            sourceModelUrl: this.modelUrl,
            previewUrl: this.modelImage,
            scaledModelUrl: this.modelUrl,
            sliceGcodeUrl: this.gcodeUrl,
            deviceId: deviceId
          })
          if (taskRes.code === 1 && taskRes.data) {
            printTaskId = taskRes.data.taskId || taskRes.data.id || ''
          }
        } catch (e) {
          console.error('创建打印任务记录失败:', e)
        }

        // 发送打印命令
        const res = await sendPrintCommand(deviceId, this.modelId, 'P', this.gcodeUrl, this.taskId)
        uni.hideLoading()

        if (res.code === 1 || res.code === 0) {
          uni.showToast({ title: this.texts.printCommandSent || '打印指令已发送', icon: 'success' })
          // 使用缩放后的尺寸
          let dimensionsStr = ''
          if (this.originalDimensions) {
            const scale = this.scalePercent / 100
            const x = (this.originalDimensions.x * scale).toFixed(1)
            const y = (this.originalDimensions.y * scale).toFixed(1)
            const z = (this.originalDimensions.z * scale).toFixed(1)
            dimensionsStr = `${x}mm(X)*${y}mm(Y)*${z}mm(Z)`
          } else {
            dimensionsStr = this.modelDimensions || ''
          }
          setTimeout(() => {
            const workId = printTaskId || this.modelId
            uni.redirectTo({
              url: `/pages/explore/printDetail/printDetail?workId=${workId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelImage)}&autoStart=true&deviceId=${deviceId}&gcodeUrl=${encodeURIComponent(this.gcodeUrl || '')}&dimensions=${encodeURIComponent(dimensionsStr)}&printTime=${encodeURIComponent(this.printTime || '')}&materialWeight=${encodeURIComponent(this.materialWeight || '')}&printTimeHms=${encodeURIComponent(this.printTimeHms || '')}&filamentLengthM=${encodeURIComponent(this.filamentLengthM || 0)}`
            })
          }, 1500)
        } else {
          uni.showToast({ title: res.msg || this.texts.sendFailed || '发送失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: this.texts.sendPrintCommandFailed || '发送打印指令失败', icon: 'none' })
      }
    },
    
    goToPrintRecords() {
      uni.navigateTo({
        url: '/pagesMember/printRecords/printRecords'
      })
    },
    handleCancel() {
      this.isPaused = true
      uni.showModal({
        title: this.texts.confirmCancel || '确认取消',
        content: this.texts.cancelContent || '取消后将不自动打印，模型处理将在后台继续，是否确认？',
        success: (res) => {
          if (res.confirm) {
            this.clearAllTimers()
            if (this.eventSource) {
              this.eventSource.close()
            }
            uni.navigateBack()
          } else {
            this.isPaused = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
}

.model-image-section {
  display: flex;
  justify-content: center;
  margin: 15rpx 30rpx 25rpx 30rpx;
}

.model-image {
  width: 600rpx;
  height: 600rpx;
  border-radius: 20rpx;
  background-color: #fff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.progress-section {
  display: flex;
  align-items: center;
  margin: 0 30rpx 25rpx 30rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background-color: #e0e0e0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a7fff, #4a9fff);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #2a7fff;
  font-weight: 500;
}

.status-box {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin: 0 20rpx 20rpx 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.steps-section {
  margin-bottom: 15rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
  width: 100%;
  justify-content: flex-start;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.circle {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%;
}

.check-icon {
  color: #2a7fff;
  font-size: 32rpx;
  font-weight: bold;
}

.loading-circle {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid #e0e0e0;
  border-top-color: #2a7fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.step-text {
  font-size: 30rpx;
  color: #666;
  transition: color 0.3s;
  font-weight: 400;
}

.step-item.completed .step-text {
  color: #333;
  font-weight: 400;
}

.step-item.active .step-text {
  color: #2a7fff;
  font-weight: 400;
  font-size: 32rpx;
}

.current-status {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.status-icon-wrapper {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.status-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 400;
}

.tips-section {
  text-align: center;
  padding: 15rpx 0;
}

.tips-text {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
}

.link-text {
  color: #2a7fff;
}

.bottom-section {
  background-color: #fff;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
  flex-shrink: 0;
}

.print-hint {
  text-align: center;
  margin-bottom: 20rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
}

.cancel-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
  border: none;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.cancel-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.cancel-btn:active {
  transform: scale(0.98);
  opacity: 0.85;
}
</style>

