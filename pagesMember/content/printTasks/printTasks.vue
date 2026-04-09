<template>
  <view class="print-tasks-page">
    <safe-area />
    <custom-navbar :title="texts.title || '打印任务'" @back="handleBack" />
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
              <text class="task-device" v-if="task.deviceId">{{ texts.device || '设备' }}: {{ task.deviceId }}</text>
              <text class="task-time">{{ formatTime(task.createdAt) }}</text>
              <text v-if="task.errorMsg" class="task-error">{{ task.errorMsg }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else-if="!loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-box.png" mode="aspectFit" />
        <text class="empty-text">{{ texts.noTasks || '暂无打印任务' }}</text>
        <text class="empty-hint">{{ texts.goPrint || '快去打印吧' }}</text>
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
import { getPrintTasks } from '@/api/printTasks.ts'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'PrintTasks',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      taskList: [],
      loading: false,
      current: 1,
      size: 20,
      total: 0
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.printTasks || {}
    }
  },
  onShow() {
    this.languageStore.loadLanguage()
    this.loadTasks()
  },
  onReachBottom() {
    if (this.taskList.length < this.total) {
      this.current++
      this.loadTasks()
    }
  },
  methods: {
    async loadTasks() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getPrintTasks({
          current: this.current,
          size: this.size
        })
        if (((res as any).code === 0 || (res as any).code === 1) && (res as any).data) {
          const records = (res as any).data.records || []
          if (this.current === 1) {
            this.taskList = records
          } else {
            this.taskList = [...this.taskList, ...records]
          }
          this.total = (res as any).data.total || 0
        }
      } catch (error) {
        console.error('加载打印任务失败:', error)
        uni.showToast({
          title: error.message || this.texts.loadFailed || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    handleBack() {
      uni.navigateBack()
    },
    handleTaskClick(task) {
      uni.navigateTo({
        url: `/pages/explore/printDetail/printDetail?workId=${task.taskId}&deviceId=${task.deviceId || ''}`
      })
    },
    getStatusClass(status) {
      const statusMap = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed',
        'failed': 'status-failed'
      }
      return statusMap[status] || 'status-default'
    },
    getStatusText(status) {
      const statusTextMap = {
        'pending': this.texts.statusPending || '待处理',
        'processing': this.texts.statusProcessing || '处理中',
        'completed': this.texts.statusCompleted || '已完成',
        'failed': this.texts.statusFailed || '失败'
      }
      return statusTextMap[status] || status
    },
    formatTime(time) {
      if (!time) return ''
      return time.replace('T', ' ').split('.')[0]
    }
  }
}
</script>

<style scoped>
.print-tasks-page {
  min-height: 100vh;
  background-color: #FFF9F5;
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
  background-color: #FFF3E0;
  color: #FF9800;
}

.status-processing {
  background-color: #E3F2FD;
  color: #2196F3;
}

.status-completed {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.status-failed {
  background-color: #FFEBEE;
  color: #F44336;
}

.status-default {
  background-color: #F5F5F5;
  color: #999;
}

.task-device {
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
  color: #F44336;
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
  color: #FF6B35;
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
