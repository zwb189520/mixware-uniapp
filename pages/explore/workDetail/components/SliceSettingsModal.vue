<template>
  <view v-if="visible" class="modal-overlay" @click="handleCancel">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ texts.sliceSettings }}</text>
        <view class="close-btn" @click="handleCancel">
          <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
        </view>
      </view>

      <view class="modal-body">
        <!-- 状态展示 -->
        <view v-if="isSlicing" class="slicing-status">
          <view class="loader-container">
            <view class="loader"></view>
          </view>
          <text class="status-text">{{ texts.slicing }}... {{ progress }}%</text>
          <progress :percent="progress" stroke-width="3" activeColor="#FF6B35" />
        </view>

        <!-- 参数设置表单 -->
        <view v-else class="settings-form">
          <view class="form-item">
            <text class="label">{{ texts.layerHeight }} (mm)</text>
            <slider 
              :value="form.layerHeight" 
              min="0.1" 
              max="0.4" 
              step="0.05" 
              show-value 
              activeColor="#FF6B35"
              @change="e => form.layerHeight = e.detail.value"
            />
          </view>

          <view class="form-item">
            <text class="label">{{ texts.infillDensity }} (%)</text>
            <slider 
              :value="form.infillDensity" 
              min="0" 
              max="100" 
              step="5" 
              show-value 
              activeColor="#FF6B35"
              @change="e => form.infillDensity = e.detail.value"
            />
          </view>

          <view class="form-item">
            <text class="label">{{ texts.printSpeed }} (mm/s)</text>
            <slider 
              :value="form.printSpeed" 
              min="20" 
              max="100" 
              step="10" 
              show-value 
              activeColor="#FF6B35"
              @change="e => form.printSpeed = e.detail.value"
            />
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <button 
          class="submit-btn" 
          :disabled="isSlicing"
          @click="handleSubmit"
        >
          <text v-if="!isSlicing">{{ texts.startSlice }}</text>
          <text v-else>{{ texts.slicing }}...</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'
import { submitSliceTask, getSliceStatus } from '@/api/sliceService.js'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
  name: 'SliceSettingsModal',
  components: {
    uniIcons
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modelUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isSlicing: false,
      progress: 0,
      pollTimer: null,
      form: {
        layerHeight: 0.2,
        infillDensity: 20,
        printSpeed: 50
      }
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
  methods: {
    handleCancel() {
      if (this.isSlicing) return
      this.$emit('cancel')
    },
    async handleSubmit() {
      if (!this.modelUrl) {
        uni.showToast({ title: '模型地址无效', icon: 'none' })
        return
      }

      this.isSlicing = true
      this.progress = 0
      
      try {
        const res = await submitSliceTask({
          modelFileUrl: this.modelUrl,
          layerHeight: this.form.layerHeight,
          infillDensity: this.form.infillDensity,
          printSpeed: this.form.printSpeed
        })

        if (res.code === 0 && res.data.taskId) {
          this.startPolling(res.data.taskId)
        } else {
          throw new Error(res.msg || '提交失败')
        }
      } catch (e) {
        this.isSlicing = false
        uni.showToast({ title: e.message || this.texts.sliceFailed, icon: 'none' })
      }
    },
    startPolling(taskId) {
      this.pollTimer = setInterval(async () => {
        try {
          const res = await getSliceStatus(taskId)
          if (res.code === 0 && res.data) {
            this.progress = res.data.progress || 0
            
            if (res.data.status === 'SUCCESS') {
              this.stopPolling()
              this.$emit('success', res.data.gcodeUrl)
            } else if (res.data.status === 'FAILED') {
              this.stopPolling()
              uni.showToast({ title: res.data.errorMessage || this.texts.sliceFailed, icon: 'none' })
            }
          }
        } catch (e) {
          this.stopPolling()
        }
      }, 2000)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
      this.isSlicing = false
    }
  },
  beforeUnmount() {
    this.stopPolling()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.close-btn {
  padding: 10rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.slicing-status {
  padding: 60rpx 0;
  text-align: center;
}

.loader-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.loader {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid #f3f3f3;
  border-top: 8rpx solid #FF6B35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-text {
  font-size: 30rpx;
  color: #FF6B35;
  margin: 30rpx 0;
  display: block;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
