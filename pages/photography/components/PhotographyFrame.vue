<template>
  <view class="frame-container">
    <!-- 拍照框 -->
    <view class="photo-frame">
      <view class="frame-overlay">
        <view class="frame-guide">
          <text class="frame-text">请将物品放在框内</text>
          <text class="angle-text">{{ currentAngleName }}</text>
        </view>
      </view>
      
      <!-- 拍照预览 -->
      <view class="photo-preview" v-if="currentPhoto">
        <image :src="currentPhoto" class="preview-image" mode="aspectFit" />
      </view>
      
      <!-- 拍照按钮 -->
      <view class="capture-button" @click="takePhoto">
        <view class="button-inner">
          <text class="button-icon">📷</text>
        </view>
      </view>
    </view>
    
    <!-- 拍照提示 -->
    <view class="photo-tips">
      <text class="tip-text">{{ getCurrentTip() }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PhotographyFrame',
  props: {
    angle: {
      type: String,
      required: true
    },
    capturedPhotos: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    currentAngleName() {
      const angleNames = {
        front: '正面',
        back: '背面',
        left: '左面',
        right: '右面',
        top: '顶面',
        bottom: '底面'
      }
      return angleNames[this.angle] || '正面'
    },
    currentPhoto() {
      return this.capturedPhotos[this.angle]
    }
  },
  methods: {
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          const photoPath = res.tempFilePaths[0]
          this.$emit('capture', photoPath)
        },
        fail: (err) => {
          uni.showToast({
            title: '拍照失败',
            icon: 'none'
          })
        }
      })
    },
    getCurrentTip() {
      const tips = {
        front: '正面拍摄：物品的正面朝向相机',
        back: '背面拍摄：物品的背面朝向相机',
        left: '左面拍摄：从左侧拍摄物品',
        right: '右面拍摄：从右侧拍摄物品',
        top: '顶面拍摄：从上方俯视拍摄',
        bottom: '底面拍摄：从下方仰视拍摄'
      }
      return tips[this.angle] || '请按提示拍摄'
    }
  }
}
</script>

<style scoped>
.frame-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40rpx;
}
.photo-frame {
  flex: 1;
  position: relative;
  background: #f8f8f8;
  border-radius: 20rpx;
  overflow: hidden;
}
.frame-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.frame-guide {
  text-align: center;
}
.frame-text {
  color: white;
  font-size: 32rpx;
  margin-bottom: 10rpx;
  display: block;
}
.angle-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  display: block;
}
.photo-preview {
  width: 100%;
  height: 100%;
}
.preview-image {
  width: 100%;
  height: 100%;
}
.capture-button {
  position: absolute;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
}
.button-inner {
  width: 120rpx;
  height: 120rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}
.button-icon {
  font-size: 60rpx;
}
.photo-tips {
  padding: 20rpx;
  text-align: center;
}
.tip-text {
  font-size: 28rpx;
  color: #666;
}
</style>