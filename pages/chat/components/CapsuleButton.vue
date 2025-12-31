<template>
  <button 
    class="capsule-button"
    :class="{ disabled: disabled }"
    :disabled="disabled"
    @click="handleClick"
  >
    <text class="button-text">{{ text }}</text>
  </button>
</template>

<script>
export default {
  name: 'CapsuleButton',
  props: {
    text: {
      type: String,
      default: '浏览3D模型'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
.capsule-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  min-width: 280rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.capsule-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.capsule-button.disabled {
  background: #ccc;
  box-shadow: none;
  transform: none;
}

.button-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
}

.capsule-button.disabled .button-text {
  color: #999;
}
</style>