<template>
  <view class="page-container">
    <safe-area />
    <custom-navbar :title="texts.printComplete" @back="handleBack" />

    <scroll-view scroll-y class="content-scroll">
      <!-- 模型名称 -->
      <text class="model-name">{{ printData.modelName || texts.modelName }}</text>

      <!-- 模型图片 -->
      <view class="model-image-section">
        <image
          class="model-image"
          :src="printData.modelImage"
          mode="aspectFill"
          @error="handleImageError"
        />
      </view>

      <!-- 打印信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <view class="info-icon-wrapper">
            <image src="/static/images/print/time.png" mode="aspectFit" class="info-icon"></image>
          </view>
          <text class="info-label">{{ texts.printTimeLabel }}</text>
          <text class="info-value">{{ printData.printTime }}</text>
        </view>
        <view class="info-row">
          <view class="info-icon-wrapper">
            <image
              src="/static/images/print/material.png"
              mode="aspectFit"
              class="info-icon"
            ></image>
          </view>
          <text class="info-label">{{ texts.material }}</text>
          <text class="info-value">{{ printData.material }}</text>
        </view>
        <view class="info-row">
          <view class="info-icon-wrapper">
            <image src="/static/images/print/size.png" mode="aspectFit" class="info-icon"></image>
          </view>
          <text class="info-label">{{ texts.sizeLabel }}</text>
          <text class="info-value">{{ printData.size }}</text>
        </view>

        <!-- 用户信息（集成到卡片内） -->
        <view class="user-section">
          <image
            class="user-avatar"
            :src="userData.avatar"
            mode="aspectFill"
            @error="handleAvatarError"
          />
          <text class="user-name">{{ userData.username }}</text>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-btn" @click="handleShare">
        <text class="share-btn-text">{{ texts.share }}</text>
      </view>

      <!-- 返回首页 -->
      <text class="back-home" @click="handleBackHome">{{ texts.returnHome }}</text>

      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'
import { get } from '@/api/request.ts'
import { getPrintRecords } from '@/api/operationRecords.ts'
import { getUserInfo } from '@/api/users.ts'

interface PrintData {
  modelName: string
  modelImage: string
  printTime: string
  material: string
  size: string
}

interface UserData {
  avatar: string
  nickname: string
  username: string
}

export default {
  components: { CustomNavbar },
  data() {
    return {
      recordId: '' as string,
      modelId: '' as string,
      printData: {
        modelName: '',
        modelImage: '/static/images/logo.png',
        printTime: '',
        material: '',
        size: ''
      } as PrintData,
      userData: {
        avatar: '/static/images/Default avatar.png',
        nickname: '',
        username: ''
      } as UserData
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    userStore(): any {
      return useUserStore()
    },
    texts(): any {
      return this.languageStore.texts.explore
    }
  },
  onLoad(options: any): void {
    this.recordId = options.recordId || ''
    this.modelId = options.modelId || ''

    console.log('printComplete onLoad options:', options)
    console.log('接收到的 modelId:', this.modelId)
    console.log('接收到的 recordId:', this.recordId)

    this.languageStore.loadLanguage()

    if (this.recordId) {
      this.loadPrintRecord()
    } else {
      this.loadFromParams(options)
    }

    this.loadUserInfo()
  },
  methods: {
    async loadPrintRecord(): Promise<void> {
      try {
        uni.showLoading({ title: this.texts.loading || '加载中...' })
        const res: any = await getPrintRecords(1, 20)
        uni.hideLoading()

        if (res.code === 1 && res.data?.records) {
          const record = res.data.records.find((r: any) => r.id === this.recordId)
          if (record) {
            this.printData = {
              modelName: record.modelName || record.name || '未命名模型',
              modelImage:
                record.modelImage || record.previewUrl || record.image || '/static/images/logo.png',
              printTime: this.formatPrintTime(record.printTime || record.duration),
              material: this.formatMaterial(record.material || record.weight),
              size: this.formatSize(record.size || record.dimensions)
            }
          }
        }
      } catch (error) {
        uni.hideLoading()
        console.error('加载打印记录失败:', error)
        uni.showToast({ title: this.texts.loadFailed || '加载失败', icon: 'none' })
      }
    },

    loadFromParams(options: any): void {
      try {
        this.printData = {
          modelName: options.modelName ? decodeURIComponent(options.modelName) : '',
          modelImage: options.modelImage
            ? decodeURIComponent(options.modelImage)
            : '/static/images/logo.png',
          printTime: options.printTime ? decodeURIComponent(options.printTime) : '',
          material: options.material ? decodeURIComponent(options.material) : '',
          size: options.size ? decodeURIComponent(options.size) : ''
        }

        if (options.userAvatar || options.userName || options.userId) {
          this.userData = {
            avatar: options.userAvatar
              ? decodeURIComponent(options.userAvatar)
              : '/static/images/Default avatar.png',
            nickname: options.userName ? decodeURIComponent(options.userName) : '',
            username: options.userId ? decodeURIComponent(options.userId) : ''
          }
        }
      } catch (e) {
        console.error('解析参数失败:', e)
      }
    },

    async loadUserInfo(): Promise<void> {
      try {
        const userId = this.userStore.userId

        if (!userId) {
          console.log('未找到用户ID，使用默认信息')
          this.userData = {
            avatar: '/static/images/Default avatar.png',
            nickname: 'Mixware3D',
            username: '用户'
          }
          return
        }

        const res: any = await getUserInfo(userId)

        if (res.code === 1 && res.data) {
          this.userData = {
            avatar: res.data.avatar || res.data.avatarUrl || '/static/images/Default avatar.png',
            nickname: 'Mixware3D',
            username:
              res.data.nickname || res.data.username || res.data.name || res.data.email || '用户'
          }
        } else {
          this.userData = {
            avatar: '/static/images/Default avatar.png',
            nickname: 'Mixware3D',
            username: '用户'
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.userData = {
          avatar: '/static/images/Default avatar.png',
          nickname: 'Mixware3D',
          username: '用户'
        }
      }
    },

    formatPrintTime(time: string | number): string {
      if (!time) return '未知'
      if (typeof time === 'string' && time.includes('分')) return time
      if (typeof time === 'number') {
        const minutes = Math.floor(time / 60)
        return `${minutes}分钟`
      }
      return String(time)
    },

    formatMaterial(material: string | number): string {
      if (!material) return '未知'
      if (typeof material === 'string' && material.includes('g')) return material
      if (typeof material === 'number') return `${material}g`
      return String(material)
    },

    formatSize(size: any): string {
      if (!size) return '未知'
      if (typeof size === 'string') return size
      if (typeof size === 'object' && size.x && size.y && size.z) {
        return `${size.x}mm(X)*${size.y}mm(Y)*${size.z}mm(Z)`
      }
      return '未知'
    },

    handleBack(): void {
      uni.navigateBack()
    },

    handleImageError(): void {
      this.printData.modelImage = '/static/images/logo.png'
    },

    handleAvatarError(): void {
      this.userData.avatar = '/static/images/Default avatar.png'
    },

    handleBackHome(): void {
      uni.switchTab({ url: '/pages/explore/explore/explore' })
    },

    handleShare(): void {
      const modelInfo = {
        id: this.modelId || this.recordId || 'unknown',
        name: this.printData.modelName,
        image: this.printData.modelImage
      }

      console.log('分享报告，modelId:', modelInfo.id)

      uni.navigateTo({
        url: `/pages/explore/createPost/createPost?modelId=${encodeURIComponent(modelInfo.id)}&modelName=${encodeURIComponent(modelInfo.name)}&modelImage=${encodeURIComponent(modelInfo.image)}&printTime=${encodeURIComponent(this.printData.printTime)}&material=${encodeURIComponent(this.printData.material)}&size=${encodeURIComponent(this.printData.size)}&from=printComplete`
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #e3f2fd 0%, #f0f4f8 50%, #fff9f5 100%);
}

.content-scroll {
  flex: 1;
  height: 0;
}

.bottom-safe {
  height: 40rpx;
}

.model-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  margin: 100rpx 32rpx 16rpx;
  display: block;
  line-height: 1.3;
}

.model-image-section {
  width: calc(100% - 64rpx);
  height: 420rpx;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  margin: 0 32rpx 0;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.model-image {
  width: 100%;
  height: 100%;
}

.info-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 0 0 32rpx 32rpx;
  padding: 4rpx 40rpx 32rpx;
  margin: 0 32rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}

.info-row {
  display: flex;
  align-items: center;
  padding: 2rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.info-row:last-of-type {
  border-bottom: none;
  margin-bottom: 12rpx;
}

.info-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}
.info-icon {
  width: 24rpx;
  height: 24rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  width: 140rpx;
  font-weight: 500;
}

.info-value {
  font-size: 24rpx;
  color: #1a1a2e;
  font-weight: 600;
  flex: 1;
}

/* 用户信息区域 */
.user-section {
  display: flex;
  align-items: center;
  padding-top: 32rpx;
  border-top: 2rpx solid rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #f0f0f0;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.share-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #ff5a00 0%, #ff8c00 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 32rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 90, 0, 0.3);
}

.share-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.share-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.back-home {
  font-size: 28rpx;
  color: #2a7fff;
  text-align: center;
  text-decoration: underline;
  display: block;
  font-weight: 600;
  margin-bottom: 40rpx;
}

.back-home:active {
  opacity: 0.7;
}
</style>
