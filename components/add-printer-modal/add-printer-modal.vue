<template>
  <view v-if="visible" class="modal-overlay" @tap="handleCancel">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">添加打印机</text>
      </view>
      
      <view class="modal-body">
        <view class="printer-item" @tap="handleSelectPrinter(1)">
          <image class="printer-icon" src="/static/img/printer-icon.png" mode="aspectFit" />
          <view class="printer-info">
            <text class="printer-name">3D打印机</text>
            <text class="printer-model">Ender-3 V2</text>
          </view>
        </view>
        
        <view class="printer-item" @tap="handleSelectPrinter(2)">
          <image class="printer-icon" src="/static/img/printer-icon.png" mode="aspectFit" />
          <view class="printer-info">
            <text class="printer-name">3D打印机</text>
            <text class="printer-model">Ender-3 S1</text>
          </view>
        </view>
        
        <view class="printer-item" @tap="handleSelectPrinter(3)">
          <image class="printer-icon" src="/static/img/printer-icon.png" mode="aspectFit" />
          <view class="printer-info">
            <text class="printer-name">3D打印机</text>
            <text class="printer-model">CR-10</text>
          </view>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="btn-cancel" @tap="handleCancel">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AddPrinterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelectPrinter(printerId) {
      this.$emit('select-printer', printerId)
    },
    handleCancel() {
      this.$emit('cancel')
    }
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 40rpx;
}

.printer-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.printer-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 30rpx;
}

.printer-info {
  flex: 1;
}

.printer-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.printer-model {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.btn-cancel {
  width: 100%;
  padding: 16rpx 40rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  border: none;
  background-color: #007aff;
  color: white;
}
</style>
