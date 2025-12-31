<template>
  <view class="uni-popup-wrapper">
    <view 
      v-if="show" 
      class="uni-popup-mask"
      @tap="handleMaskClick"
    ></view>
    <view 
      v-if="show" 
      class="uni-popup-content"
      :class="[`uni-popup-${type}`]"
    >
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'uniPopup',
  props: {
    type: {
      type: String,
      default: 'center'
    },
    show: {
      type: Boolean,
      default: false
    },
    maskClick: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    open() {
      this.$emit('update:show', true)
    },
    
    close() {
      this.$emit('update:show', false)
    },
    
    handleMaskClick() {
      if (this.maskClick) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.uni-popup-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.uni-popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.uni-popup-content {
  position: absolute;
  background: #fff;
  border-radius: 24rpx;
}

.uni-popup-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80%;
  max-height: 80%;
}

.uni-popup-bottom {
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24rpx 24rpx 0 0;
}

.uni-popup-top {
  left: 0;
  right: 0;
  top: 0;
  border-radius: 0 0 24rpx 24rpx;
}
</style>