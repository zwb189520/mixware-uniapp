<template>
  <view class="main-view-container">
    <view class="main-view-header">
      <text class="main-view-title">主视图</text>
    </view>
    
    <view class="upload-frame" @click="handleUpload">
      <view class="upload-content">
        <uni-icons type="plusempty" size="60" color="#ccc"></uni-icons>
        <text class="upload-hint">点击上传主视图</text>
      </view>
    </view>
    
    <view class="generate-section">
      <button class="generate-3d-btn" @click="handleGenerate3D">
        <text>生成3D模型</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MainView',
  methods: {
    handleUpload() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths[0]
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
    
    handleGenerate3D() {
      uni.navigateTo({
        url: '/pages/3Dpreviewdetail/3Dpreviewdetail'
      })
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
</style>