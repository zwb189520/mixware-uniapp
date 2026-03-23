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
import { sendPrintCommand } from '@/api/iot.ts'
import { getDefaultDevice, getDeviceList } from '@/api/devices.ts'

export default {
  data() {
    return {
      modelId: '',
      modelName: '',
      modelImage: '',
      modelImages: [], // 添加模型图片数组
      modelUrl: '', // 模型文件URL
      progress: 0,
      isProcessing: false,
      steps: [],
      currentStatus: '',
      timer: null,
      taskId: '',
      gcodeUrl: '',
      modelDimensions: '', // 模型尺寸
      printTime: '', // 打印时间
      materialWeight: '', // 材料重量
      originalDimensions: null, // 从preview3DDetail传入的原始尺寸
      realTaskCompleted: false, // 真实任务是否完成
      fakeProgressCompleted: false, // 假进度是否完成
      scalePercent: 100 // 缩放比例
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
    console.log('sliceProcessing onLoad options:', options)
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
    console.log('初始modelImage:', this.modelImage)
    
    // 接收从preview3DDetail传入的尺寸
    try {
      if (options.dimensions) {
        this.originalDimensions = JSON.parse(decodeURIComponent(options.dimensions))
        console.log('接收到的原始尺寸:', this.originalDimensions)
      }
    } catch (e) {
      console.log('解析尺寸参数失败:', e)
    }
    
    // 接收缩放比例和设备ID
    this.scalePercent = parseFloat(options.scalePercent) || 100
    this.deviceId = options.deviceId || ''
    
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
      console.log('自定义模型，直接使用modelUrl:', this.modelUrl)
      if (this.modelUrl) {
        this.startSliceTask()
      } else {
        uni.showToast({ title: '模型文件不存在', icon: 'none' })
      }
      return
    }
    
    // 加载模型详情获取图片和模型URL，完成后开始切片
    await this.loadModelImages()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
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
      
      // 初始化当前状态文本
      this.currentStatus = this.texts.analysisComplete || '分析完成，请等待模型处理'
    },
    async startSliceTask() {
      if (!this.modelUrl) {
        uni.showToast({ title: '模型文件不存在', icon: 'none' })
        return
      }
      
      // 提交真实的切片任务到后端
      try {
        const scaleFactor = this.scalePercent / 100
        const submitRes = await scaleAndSliceModel({
          modelIdOrUrl: this.modelUrl,
          scaleFactor: scaleFactor,
          deviceId: this.deviceId
        })
        
        if (submitRes.code === 1 || submitRes.code === 0) {
          const taskId = submitRes.data?.taskId
          if (taskId) {
            this.taskId = taskId
            // 轮询真实任务状态
            this.pollRealTaskStatus(taskId)
          }
        }
      } catch (err) {
        console.error('提交切片任务失败:', err)
      }
      
      // 模拟切片进度
      this.steps[0].completed = true
      this.steps[0].active = false
      this.steps[1].active = true
      this.progress = 0
      
      // 模拟步骤进度
      this.timer = setInterval(() => {
        if (this.progress >= 100) {
          clearInterval(this.timer)
          this.fakeProgressCompleted = true
          this.steps[4].active = false
          this.checkBothCompleted()
          return
        }
        
        this.progress += 1
        
        if (this.progress >= 40 && !this.steps[1].completed) {
          this.steps[1].completed = true
          this.steps[1].active = false
          this.steps[2].active = true
        }
        if (this.progress >= 60 && !this.steps[2].completed) {
          this.steps[2].completed = true
          this.steps[2].active = false
          this.steps[3].active = true
        }
        if (this.progress >= 80 && !this.steps[3].completed) {
          this.steps[3].completed = true
          this.steps[3].active = false
          this.steps[4].active = true
        }
      }, 100)
    },
    
    async pollRealTaskStatus(taskId) {
      const pollTimer = setInterval(async () => {
        try {
          const res = await getScaleAndSliceStatus(taskId)
          console.log('缩放切片状态返回:', JSON.stringify(res))
          if (res.code === 1 || res.code === 0) {
            const data = res.data
            if (data?.status === 'COMPLETED') {
              clearInterval(pollTimer)
              this.realTaskCompleted = true
              this.gcodeUrl = data?.gcodeUrl || ''
              // 打印所有可能的字段名
              console.log('缩放切片完成数据:', JSON.stringify(data))
              console.log('dimensions:', data?.dimensions)
              console.log('modelDimensions:', data?.modelDimensions)
              console.log('size:', data?.size)
              console.log('printTime:', data?.printTime)
              console.log('estimatedTime:', data?.estimatedTime)
              console.log('materialWeight:', data?.materialWeight)
              console.log('weight:', data?.weight)
              this.modelDimensions = data?.dimensions || data?.modelDimensions || data?.size || ''
              this.printTime = data?.printTime || data?.estimatedTime || ''
              this.materialWeight = data?.materialWeight || data?.weight || ''
              this.checkBothCompleted()
            } else if (data?.status === 'FAILED') {
              clearInterval(pollTimer)
              uni.showToast({ title: data?.errorMessage || '缩放切片失败', icon: 'none' })
            }
          }
        } catch (error) {
          console.error('轮询真实任务状态失败:', error)
        }
      }, 2000)
    },
    
    checkBothCompleted() {
      if (this.realTaskCompleted && this.fakeProgressCompleted) {
        this.sendPrintCommandAfterSlice()
      }
    },
    
    async pollSliceStatus(taskId) {
      this.timer = setInterval(async () => {
        try {
          const res = await getScaleAndSliceStatus(taskId)
          if (res.code !== 1 && res.code !== 0) {
            console.error('查询切片状态失败:', res.msg)
            return
          }
          
          const data = res.data
          const status = data?.status
          const progress = data?.progress || 0
          
          // 根据状态更新步骤
          if (status === 'RUNNING' || status === 'PENDING') {
            this.progress = 20 + progress * 0.7 // 20-90%
            if (progress > 25 && !this.steps[1].completed) {
              this.steps[1].completed = true
              this.steps[1].active = false
              this.steps[2].active = true
            }
            if (progress > 50 && !this.steps[2].completed) {
              this.steps[2].completed = true
              this.steps[2].active = false
              this.steps[3].active = true
            }
            if (progress > 75 && !this.steps[3].completed) {
              this.steps[3].completed = true
              this.steps[3].active = false
              this.steps[4].active = true
            }
          } else if (status === 'COMPLETED') {
            // 切片完成
            console.log('切片完成，准备发送打印命令')
            clearInterval(this.timer)
            this.progress = 100
            this.steps[1].completed = true
            this.steps[2].completed = true
            this.steps[3].completed = true
            this.steps[4].completed = true
            this.steps[4].active = false
            
            // 保存gcodeUrl
            this.gcodeUrl = data?.gcodeUrl
            
            // 切片完成，发送打印命令
            try {
              await this.sendPrintCommandAfterSlice()
            } catch (err) {
              console.error('sendPrintCommandAfterSlice 执行失败:', err)
            }
          } else if (status === 'FAILED') {
            clearInterval(this.timer)
            uni.showToast({ title: data?.errorMessage || '切片失败', icon: 'none' })
          }
        } catch (error) {
          console.error('轮询切片状态失败:', error)
        }
      }, 2000) // 每2秒查询一次
    },
    handleBack() {
      uni.navigateBack()
    },
    handleImageError() {
      console.log('图片加载失败，当前modelImage:', this.modelImage)
      this.modelImage = ''
      console.log('设置为空图片')
    },
    
    async loadModelImages() {
      try {
        console.log('加载模型图片，modelId:', this.modelId)
        const res = await getModelDetail(this.modelId)
        console.log('getModelDetail响应:', res)
        
        // 检查响应状态
        if (!res || (res.code !== 0 && res.code !== 1)) {
          throw new Error(res?.msg || '获取详情失败')
        }
        
        const data = res.data || {}
        console.log('模型详情数据:', data)
        
        // 使用与modelDetail.vue完全相同的fixImageUrl函数
        const fixImageUrl = (url) => {
          if (!url) return ''
          return url.replace('localhost:9000', '47.102.212.37:9000').replace('api/uploads/image', '9000/image')
        }
        
        // 将previewUrl放入images数组中，与modelDetail.vue保持一致
        const images = data.previewUrl ? [fixImageUrl(data.previewUrl)] : []
        
        if (images.length > 0) {
          this.modelImage = images[0]
          console.log('设置的新modelImage:', this.modelImage)
        } else {
          console.log('模型没有有效的图片数据，使用默认图片')
          this.modelImage = '/static/images/logo.png' // 使用默认图片
        }
        
        // 获取模型文件URL
        this.modelUrl = data.downloadUrl || data.modelFile || data.modelUrl || ''
        console.log('设置的modelUrl:', this.modelUrl)
        
        // 获取到模型URL后开始切片任务
        if (this.modelUrl) {
          this.startSliceTask()
        } else {
          uni.showToast({ title: '模型文件不存在', icon: 'none' })
        }
      } catch (error) {
        console.error('加载模型图片失败:', error)
        uni.showToast({ title: '加载模型信息失败', icon: 'none' })
      }
    },
    async sendPrintCommandAfterSlice() {
      console.log('开始发送打印命令')
      try {
        uni.showLoading({ title: '正在发送打印指令...' })
        
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
          uni.showToast({ title: '请先添加设备', icon: 'none' })
          return
        }
        
        // 发送打印命令
        const res = await sendPrintCommand(deviceId, this.modelId, 'P', this.gcodeUrl)
        console.log('sendPrintCommand 响应:', res)
        uni.hideLoading()
        
        if (res.code === 1 || res.code === 0) {
          uni.showToast({ title: '打印指令已发送', icon: 'success' })
          // 使用原始尺寸（从preview3DDetail传入）
          const dimensionsStr = this.originalDimensions ? 
            `${this.originalDimensions.x.toFixed(1)}mm(X)*${this.originalDimensions.y.toFixed(1)}mm(Y)*${this.originalDimensions.z.toFixed(1)}mm(Z)` : 
            (this.modelDimensions || '')
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/explore/printDetail/printDetail?workId=${this.modelId}&modelName=${encodeURIComponent(this.modelName)}&modelImage=${encodeURIComponent(this.modelImage)}&autoStart=true&deviceId=${deviceId}&gcodeUrl=${encodeURIComponent(this.gcodeUrl || '')}&dimensions=${encodeURIComponent(dimensionsStr)}&printTime=${encodeURIComponent(this.printTime || '')}&materialWeight=${encodeURIComponent(this.materialWeight || '')}`
            })
          }, 1500)
        } else {
          uni.showToast({ title: res.msg || '发送失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('发送打印命令失败:', error)
        uni.showToast({ title: '发送打印指令失败', icon: 'none' })
      }
    },
    
    goToPrintRecords() {
      uni.navigateTo({
        url: '/pagesMember/printRecords/printRecords'
      })
    },
    handleCancel() {
      uni.showModal({
        title: this.texts.confirmCancel || '确认取消',
        content: this.texts.cancelContent || '取消后将停止模型处理，是否确认？',
        success: (res) => {
          if (res.confirm) {
            if (this.timer) {
              clearInterval(this.timer)
            }
            uni.navigateBack()
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

