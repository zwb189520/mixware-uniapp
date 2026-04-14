<template>
  <view class="page">
    <safe-area />
    <custom-navbar :title="texts.photography" @back="handleBack" />

    <view class="main-view-container">
      <view class="main-view-header">
        <text class="main-view-title">{{ texts.mainView }}</text>
      </view>

      <view class="upload-frame" @click="!uploadedImage ? handleUpload() : handleImageClick()">
        <view v-if="!uploadedImage" class="upload-content">
          <uni-icons type="plusempty" size="60" color="#ccc"></uni-icons>
          <text class="upload-hint">{{ texts.clickUpload }}</text>
        </view>
        <view v-else class="image-preview">
          <image :src="uploadedImage" class="preview-image" mode="aspectFit" />
          <view class="image-overlay">
            <text class="change-image-text">{{ texts.clickChangeImage }}</text>
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
          <text>{{
            isGenerating
              ? texts.generating
              : uploadedImage
                ? texts.generate3DModel
                : texts.pleaseUpload
          }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { imageToModel } from '@/api/hunyuan3d.ts'
import { createModelTask, updateModelTask } from '@/api/modelTasks.ts'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      uploadedImage: null as string | null,
      isGenerating: false as boolean
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.create as unknown as Record<string, string>
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },
    handleMore(): void {
      uni.showActionSheet({
        itemList: [this.texts.share, this.texts.report, this.texts.help],
        success: (res: UniApp.ShowActionSheetRes) => {
          switch (res.tapIndex) {
            case 0:
              uni.showShareMenu()
              break
            case 1:
              uni.showToast({ title: this.texts.reportSuccess, icon: 'success' })
              break
            case 2:
              uni.showToast({ title: this.texts.helpInDev, icon: 'none' })
              break
          }
        }
      })
    },
    handleUpload(): void {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res: UniApp.ChooseImageSuccessCallbackResult) => {
          const tempFilePaths = res.tempFilePaths[0]
          this.uploadedImage = tempFilePaths
          uni.showToast({
            title: this.texts.uploadSuccess,
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: this.texts.uploadFailed,
            icon: 'none'
          })
        }
      })
    },

    handleImageClick(): void {
      uni.showActionSheet({
        itemList: [this.texts.viewLargeImage, this.texts.changeImage],
        success: (res: UniApp.ShowActionSheetRes) => {
          if (res.tapIndex === 0) {
            uni.previewImage({
              urls: [this.uploadedImage as string],
              current: this.uploadedImage as string
            })
          } else if (res.tapIndex === 1) {
            setTimeout(() => {
              this.handleUpload()
            }, 100)
          }
        }
      })
    },

    async handleGenerate3D(): Promise<void> {
      if (!this.uploadedImage) {
        uni.showToast({
          title: this.texts.pleaseUpload,
          icon: 'none'
        })
        return
      }

      this.isGenerating = true

      try {
        uni.showLoading({
          title: this.texts.generating3D
        })

        const res = await imageToModel(this.uploadedImage, '')
        console.log('完整响应数据:', res)

        uni.hideLoading()

        if ((res.code === 0 || res.code === 1) && res.data && (res.data.JobId || res.data.taskId)) {
          const jobId = res.data.JobId || res.data.taskId

          try {
            const taskRes = await createModelTask({
              sourceModelUrl: this.uploadedImage,
              previewUrl: this.uploadedImage,
              scaleFactor: 1
            })
            if (taskRes.code === 1 && taskRes.data?.taskId) {
              await updateModelTask({
                taskId: taskRes.data.taskId,
                jobId: jobId,
                sourceModelUrl: this.uploadedImage,
                previewUrl: this.uploadedImage,
                scaleFactor: 1
              })
            }
          } catch (e) {
            console.error('创建模型任务记录失败:', e)
          }

          uni.showToast({
            title: this.texts.modelGenerating,
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${jobId}&name=生成的3D模型`
            })
          }, 1500)
        } else {
          console.log('响应数据不符合预期:', res)
          uni.showToast({
            title: res.msg || this.texts.generateFailed,
            icon: 'none'
          })
        }
      } catch (error: unknown) {
        console.error('生成3D模型失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: (error as Error).message || this.texts.generate3DFailed,
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
.page {
  height: 100vh;
  background: #fff9f5;
}

.safe-area-top {
  background: #fff;
}

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
  background: #fff9f5;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-frame:active {
  background: #fff9f5;
  border-color: #ff5a00;
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
  background: #7ed321;
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
