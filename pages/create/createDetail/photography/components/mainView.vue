<template>
  <view class="main-view-container">
    <view class="main-view-header">
      <text class="main-view-title">主视图</text>
    </view>
    
    <view class="upload-frame" @click="!uploadedImage ? handleUpload() : handleImageClick()">
      <view v-if="!uploadedImage" class="upload-content">
        <uni-icons type="plusempty" size="60" color="#ccc"></uni-icons>
        <text class="upload-hint">点击上传主视图</text>
      </view>
      <view v-else class="image-preview">
        <image :src="uploadedImage" class="preview-image" mode="aspectFit" />
        <view class="image-overlay">
          <text class="change-image-text">点击更换图片</text>
        </view>
      </view>
    </view>
    
    <view class="generate-section">
      <button 
        class="generate-3d-btn" 
        :class="{ 'btn-disabled': !uploadedImage || isGenerating }" 
        :disabled="!uploadedImage || isGenerating"
        @click="handleGenerate3D"
      >
        <text>{{ isGenerating ? '生成中...' : (uploadedImage ? '生成3D模型' : '请先上传图片') }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import { imageToModel } from '@/api/hunyuan3d.js'

export default {
  name: 'MainView',
  data() {
    return {
      uploadedImage: null,
      isGenerating: false
    }
  },
  methods: {
    handleUpload() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths[0]
          this.uploadedImage = tempFilePaths
          this.$emit('upload-success', tempFilePaths)
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      })
    },
    
    handleImageClick() {
      uni.showActionSheet({
        itemList: ['查看大图', '更换图片'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.previewImage({
              urls: [this.uploadedImage],
              current: this.uploadedImage
            })
          } else if (res.tapIndex === 1) {
            this.handleUpload()
          }
        }
      })
    },
    
    async handleGenerate3D() {
      if (!this.uploadedImage) {
        uni.showToast({
          title: '请先上传图片',
          icon: 'none'
        })
        return
      }
      
      this.isGenerating = true
      
      try {
        uni.showLoading({
          title: '生成3D模型中...'
        })
        
        const res = await imageToModel(this.uploadedImage, '')
        
        uni.hideLoading()
        
        if (res.data && res.data.taskId) {
          uni.showToast({
            title: '3D模型生成中',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${res.data.taskId}&name=生成的3D模型&url=${encodeURIComponent(this.uploadedImage)}`
            })
          }, 1500)
        } else {
          uni.showToast({
            title: '生成失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '生成3D模型失败',
          icon: 'none'
        })
      } finally {
        this.isGenerating = false
      }
    }
  }
}
</script>

<style scoped>
.main-view-container {
  padding: 40rpx 32rpx;
}

.main-view-header {
  margin-bottom: 30rpx;
}

.main-view-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.upload-frame {
  background: #f8f9fa;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-frame:active {
  background: #f0f0f0;
  border-color: #1296db;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.upload-hint {
  font-size: 24rpx;
  color: #999;
}

.generate-section {
  margin-top: 40rpx;
}

.generate-3d-btn {
  width: 100%;
  height: 88rpx;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-disabled {
  background: #cccccc;
  color: #999999;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-image-text {
  color: white;
  font-size: 28rpx;
}
</style>