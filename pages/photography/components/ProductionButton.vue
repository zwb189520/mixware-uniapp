<template>
  <view class="production-button-container">
    <view 
      class="production-button"
      :class="{ disabled: !canProduce, active: canProduce }"
      @click="canProduce && $emit('produce')"
    >
      <text class="button-icon">🏗️</text>
      <text class="button-text">{{ buttonText }}</text>
      <text class="button-progress" v-if="!canProduce">{{ minPhotos }}张起</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductionButton',
  props: {
    canProduce: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonText() {
      return this.canProduce ? '生成3D模型' : '请先拍摄照片'
    },
    minPhotos() {
      return 3
    }
  }
}
</script>

<style scoped>
.production-button-container {
  padding: 40rpx;
  background: white;
}
.production-button {
  background: #e0e0e0;
  border-radius: 50rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.production-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
}
.production-button.active:active {
  transform: scale(0.98);
  box-shadow: 0 5rpx 20rpx rgba(102, 126, 234, 0.2);
}
.button-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}
.button-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #999;
}
.production-button.active .button-text {
  color: white;
}
.button-progress {
  font-size: 24rpx;
  color: #999;
  margin-left: 15rpx;
}
.production-button.active .button-progress {
  color: rgba(255, 255, 255, 0.8);
}
</style>