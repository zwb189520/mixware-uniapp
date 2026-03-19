<template>
  <view v-show="visible" class="modal-mask" @click="handleCancel">
    <view class="modal-content" @click.stop>
      <view class="modal-decoration">
        <view class="decoration-circle decoration-circle-1"></view>
        <view class="decoration-circle decoration-circle-2"></view>
      </view>
      
      <view class="modal-header">
        <view class="header-left">
          <text class="modal-icon">📝</text>
          <text class="modal-title">{{ displayTitle }}</text>
        </view>
        <view class="modal-close" @click="handleCancel">
          <text>×</text>
        </view>
      </view>
      
      <view class="modal-body">
        <view class="input-wrapper">
          <text class="input-icon">🔖</text>
          <input 
            class="input-field"
            v-model="inputValue"
            :placeholder="displayPlaceholder"
            :maxlength="maxLength"
            @confirm="handleConfirm"
          />
        </view>
        
        <view v-if="displayHint" class="input-hint">
          <view class="hint-icon">💡</view>
          <text class="hint-text">{{ displayHint }}</text>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="handleCancel">
          <text>{{ displayCancelText }}</text>
        </button>
        <button class="modal-btn confirm-btn" @click="handleConfirm">
          <text>{{ displayConfirmText }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: 'ManualInputModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: 50
    }
  },
  computed: {
    displayTitle() {
      return this.title || '输入'
    },
    displayPlaceholder() {
      return this.placeholder || '请输入内容'
    },
    displayHint() {
      return this.hint || ''
    },
    displayConfirmText() {
      return this.confirmText || '确认'
    },
    displayCancelText() {
      return this.cancelText || '取消'
    }
  },
  data() {
    return {
      inputValue: ''
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.inputValue = ''
      }
    }
  },
  methods: {
    handleConfirm() {
      if (!this.inputValue.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }
      this.$emit('confirm', this.inputValue.trim())
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #fff;
  border-radius: 32rpx;
  width: 85%;
  max-width: 640rpx;
  box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(100rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 90, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%);
}

.decoration-circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -150rpx;
  right: -100rpx;
}

.decoration-circle-2 {
  width: 200rpx;
  height: 200rpx;
  top: -50rpx;
  left: -80rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.modal-icon {
  font-size: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #000;
}

.modal-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-size: 40rpx;
  color: #999;
}

.modal-close:active {
  transform: scale(0.9);
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 32rpx;
  position: relative;
  z-index: 1;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  margin-bottom: 24rpx;
}

.input-wrapper:focus-within {
  border-color: #FF5A00;
  background: #fff;
}

.input-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  border: none;
  background: transparent;
  outline: none;
  line-height: 1.5;
  min-height: 40rpx;
}

.input-hint {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(255, 90, 0, 0.05) 0%, rgba(255, 140, 0, 0.05) 100%);
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 90, 0, 0.1);
}

.hint-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
  position: relative;
  z-index: 1;
}

.modal-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-btn:active {
  transform: scale(0.95);
}

.modal-btn.cancel-btn {
  background: #f5f5f7;
  color: #333;
}

.modal-btn.confirm-btn {
  background: linear-gradient(135deg, #FF5A00, #FF8C00);
  color: #fff;
}
</style>



