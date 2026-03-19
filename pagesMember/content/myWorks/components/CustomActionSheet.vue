<template>
  <view v-show="visible" class="custom-action-mask" @click="handleCancel">
    <view class="custom-action-sheet" @click.stop>
      <view class="action-list">
        <view 
          v-for="(item, index) in items" 
          :key="index"
          class="action-item"
          @click="handleSelect(index)"
        >
          <text class="action-text">{{ item }}</text>
        </view>
      </view>
      <view class="action-cancel" @click="handleCancel">
        <text class="cancel-text">{{ cancelText }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: 'CustomActionSheet',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  methods: {
    handleSelect(index) {
      this.$emit('select', { tapIndex: index })
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
.custom-action-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
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

.custom-action-sheet {
  width: 100%;
  background-color: #FFF9F5;
  border-radius: 20rpx 20rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.action-list {
  background-color: white;
  border-radius: 20rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.action-item {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.action-item:active {
  background-color: #FFF9F5;
}

.action-item:last-child {
  border-bottom: none;
}

.action-text {
  font-size: 32rpx;
  color: #333;
}

.action-cancel {
  background-color: white;
  border-radius: 20rpx;
  margin: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  text-align: center;
}

.action-cancel:active {
  background-color: #FFF9F5;
}

.cancel-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}
</style>

