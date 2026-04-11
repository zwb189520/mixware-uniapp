<template>
  <view class="model-tasks-page">
    <safe-area />
    <custom-navbar :title="texts.title || '模型任务'" @back="handleBack" />
    <view class="tasks-container">
      <view v-if="taskList.length > 0" class="tasks-list">
        <view
          v-for="(task, index) in taskList"
          :key="index"
          class="task-item"
          @click="handleTaskClick(task)"
        >
          <view class="task-card">
            <image
              class="task-image"
              :src="task.previewUrl || '/static/images/empty-box.png'"
              mode="aspectFill"
              lazy-load
            />
            <view class="task-info">
              <view class="task-header">
                <view class="task-status" :class="getStatusClass(task.status)">
                  {{ getStatusText(task.status) }}
                </view>
              </view>
              <text class="task-scale" v-if="task.scaleFactor"
                >{{ texts.scaleFactor || '缩放' }}: {{ task.scaleFactor }}x</text
              >
              <text class="task-time">{{ formatTime(task.createdAt) }}</text>
              <text v-if="task.errorMsg" class="task-error">{{ task.errorMsg }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else-if="!loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-box.png" mode="aspectFit" />
        <text class="empty-text">{{ texts.noTasks || '暂无模型任务' }}</text>
        <text class="empty-hint">{{ texts.goCreate || '快去创建模型吧' }}</text>
      </view>
      <view v-if="loading" class="loading-state">
        <text class="loading-text">{{ texts.loading || '加载中...' }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { getModelTasks } from '@/api/modelTasks.ts'
import { useLanguageStore } from '@/stores/index.ts'

interface TaskItem {
  taskId: number | string
  previewUrl: string
  status: string
  scaleFactor: number
  createdAt: string
  errorMsg: string
  sourceModelUrl: string
}

export default {
  name: 'ModelTasks',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      taskList: [] as TaskItem[],
      loading: false as boolean,
      current: 1 as number,
      size: 20 as number,
      total: 0 as number
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    texts(): any {
      return this.languageStore?.texts?.modelTasks || {}
    }
  },
  onShow(): void {
    this.languageStore.loadLanguage()
    this.loadTasks()
  },
  onReachBottom(): void {
    if (this.taskList.length < this.total) {
      this.current++
      this.loadTasks()
    }
  },
  methods: {
    async loadTasks(): Promise<void> {
      if (this.loading) return
      this.loading = true
      try {
        const userInfo: any = uni.getStorageSync('userInfo')
        console.log('用户信息:', userInfo)
        console.log('userId:', userInfo?.userId)
        const res: any = await getModelTasks({
          current: this.current,
          size: this.size
        })
        console.log('模型任务接口响应:', res)
        if ((res.code === 0 || res.code === 1) && res.data) {
          const records = res.data.records || []
          console.log('任务记录:', records)
          console.log('记录数:', records.length)
          if (this.current === 1) {
            this.taskList = records
          } else {
            this.taskList = [...this.taskList, ...records]
          }
          this.total = res.data.total || 0
          console.log('总任务数:', this.total)
        } else {
          console.log('接口返回异常:', res)
        }
      } catch (error: any) {
        console.error('加载模型任务失败:', error)
        uni.showToast({
          title: error.message || this.texts.loadFailed || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    handleBack(): void {
      uni.navigateBack()
    },
    handleTaskClick(task: TaskItem): void {
      console.log('点击任务:', task)
      console.log('sourceModelUrl:', task.sourceModelUrl)
      const cleanUrl = (url: string): string => url?.replace(/[`\s]/g, '').trim() || ''
      const modelUrl = cleanUrl(task.sourceModelUrl)
      console.log('清理后modelUrl:', modelUrl)
      const url = modelUrl
        ? `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${task.taskId}&modelUrl=${encodeURIComponent(modelUrl)}&name=${encodeURIComponent('生成的3D模型')}`
        : `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${task.taskId}&name=${encodeURIComponent('生成的3D模型')}`
      console.log('跳转URL:', url)
      uni.navigateTo({ url })
    },
    getStatusClass(status: string): string {
      const s = status?.toLowerCase()
      const statusMap: Record<string, string> = {
        pending: 'status-pending',
        processing: 'status-processing',
        completed: 'status-completed',
        failed: 'status-failed'
      }
      return statusMap[s] || 'status-default'
    },
    getStatusText(status: string): string {
      const s = status?.toLowerCase()
      const statusTextMap: Record<string, string> = {
        pending: this.texts.statusPending || '待处理',
        processing: this.texts.statusProcessing || '处理中',
        completed: this.texts.statusCompleted || '已完成',
        failed: this.texts.statusFailed || '失败'
      }
      return statusTextMap[s] || status
    },
    formatTime(time: string): string {
      if (!time) return ''
      return time.replace('T', ' ').split('.')[0]
    }
  }
}
</script>

<style scoped>
.model-tasks-page {
  min-height: 100vh;
  background-color: #fff9f5;
}

.tasks-container {
  padding: 20rpx;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.task-item {
  width: 100%;
}

.task-card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  padding: 20rpx;
}

.task-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-id {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.task-status {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-completed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-failed {
  background-color: #ffebee;
  color: #f44336;
}

.status-default {
  background-color: #f5f5f5;
  color: #999;
}

.task-scale {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.task-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
}

.task-error {
  font-size: 22rpx;
  color: #f44336;
  margin-top: 10rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-hint {
  font-size: 28rpx;
  color: #ff6b35;
  margin-top: 20rpx;
  font-weight: bold;
}

.loading-state {
  text-align: center;
  padding: 40rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}
</style>
