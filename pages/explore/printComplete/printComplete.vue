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
            <uni-icons type="clock" size="20" color="#666"></uni-icons>
          </view>
          <text class="info-label">{{ texts.printTimeLabel }}</text>
          <text class="info-value">{{ printData.printTime }}</text>
        </view>
        <view class="info-row">
          <view class="info-icon-wrapper">
            <uni-icons type="circle-filled" size="20" color="#666"></uni-icons>
          </view>
          <text class="info-label">{{ texts.material }}</text>
          <text class="info-value">{{ printData.material }}</text>
        </view>
        <view class="info-row">
          <view class="info-icon-wrapper">
            <uni-icons type="compose" size="20" color="#666"></uni-icons>
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
          <view class="user-info">
            <text class="user-name">{{ userData.nickname }}</text>
            <text class="user-id">{{ userData.username }}</text>
          </view>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-btn" @click="handleShare">
        <text class="share-btn-text">{{ texts.shareReport }}</text>
      </view>

      <!-- 返回首页 -->
      <text class="back-home" @click="handleBackHome">{{ texts.returnHome }}</text>

      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { useLanguageStore } from '@/stores'
import { getCurrentUserInfo } from '@/api/users.js'
import { get } from '@/api/request.js'
import { getPrintRecords } from '@/api/operationRecords.js'

export default {
  components: { CustomNavbar },
  data() {
    return {
      recordId: '',
      printData: {
        modelName: '',
        modelImage: '/static/images/logo.png',
        printTime: '',
        material: '',
        size: ''
      },
      userData: {
        avatar: '/static/images/Default avatar.png',
        nickname: '',
        username: ''
      }
    }
  },
  computed: {
    languageStore() { return useLanguageStore() },
    texts() { return this.languageStore.texts.explore }
  },
  onLoad(options) {
    this.recordId = options.recordId || ''
    this.languageStore.loadLanguage()
    
    // 如果有recordId，从后端加载数据
    if (this.recordId) {
      this.loadPrintRecord()
    } else {
      // 兼容旧的URL参数方式
      this.loadFromParams(options)
    }
    
    // 加载用户信息
    this.loadUserInfo()
  },
  methods: {
    // 从后端加载打印记录
    async loadPrintRecord() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getPrintRecords(1, 20)
        uni.hideLoading()
        
        if (res.code === 1 && res.data?.records) {
          // 查找对应的打印记录
          const record = res.data.records.find(r => r.id === this.recordId)
          if (record) {
            this.printData = {
              modelName: record.modelName || record.name || '未命名模型',
              modelImage: record.modelImage || record.previewUrl || record.image || '/static/images/logo.png',
              printTime: this.formatPrintTime(record.printTime || record.duration),
              material: this.formatMaterial(record.material || record.weight),
              size: this.formatSize(record.size || record.dimensions)
            }
          }
        }
      } catch (error) {
        uni.hideLoading()
        console.error('加载打印记录失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    
    // 从URL参数加载（兼容旧方式）
    loadFromParams(options) {
      try {
        this.printData = {
          modelName: options.modelName ? decodeURIComponent(options.modelName) : '',
          modelImage: options.modelImage ? decodeURIComponent(options.modelImage) : '/static/images/logo.png',
          printTime: options.printTime ? decodeURIComponent(options.printTime) : '',
          material: options.material ? decodeURIComponent(options.material) : '',
          size: options.size ? decodeURIComponent(options.size) : ''
        }
        
        if (options.userAvatar || options.userName || options.userId) {
          this.userData = {
            avatar: options.userAvatar ? decodeURIComponent(options.userAvatar) : '/static/images/Default avatar.png',
            nickname: options.userName ? decodeURIComponent(options.userName) : '',
            username: options.userId ? decodeURIComponent(options.userId) : ''
          }
        }
      } catch (e) {
        console.error('解析参数失败:', e)
      }
    },
    
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        if (res.code === 1 && res.data) {
          this.userData = {
            avatar: res.data.avatar || res.data.avatarUrl || '/static/images/Default avatar.png',
            nickname: 'Mixware3D',  // 固定显示品牌名称
            username: res.data.nickname || res.data.username || res.data.name || res.data.email || '用户'  // 显示真实用户名
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    // 格式化打印时间
    formatPrintTime(time) {
      if (!time) return '未知'
      if (typeof time === 'string' && time.includes('分')) return time
      if (typeof time === 'number') {
        const minutes = Math.floor(time / 60)
        return `${minutes}分钟`
      }
      return time
    },
    
    // 格式化材料
    formatMaterial(material) {
      if (!material) return '未知'
      if (typeof material === 'string' && material.includes('g')) return material
      if (typeof material === 'number') return `${material}g`
      return material
    },
    
    // 格式化尺寸
    formatSize(size) {
      if (!size) return '未知'
      if (typeof size === 'string') return size
      if (typeof size === 'object' && size.x && size.y && size.z) {
        return `${size.x}mm(X)*${size.y}mm(Y)*${size.z}mm(Z)`
      }
      return '未知'
    },
    
    handleBack() { 
      uni.navigateBack() 
    },
    
    handleImageError() { 
      this.printData.modelImage = '/static/images/logo.png' 
    },
    
    handleAvatarError() {
      this.userData.avatar = '/static/images/Default avatar.png'
    },
    
    handleBackHome() {
      uni.switchTab({ url: '/pages/explore/explore/explore' })
    },
    
    handleShare() {
      // 跳转到创建帖子页面，传递打印完成的数据
      const modelInfo = {
        id: this.recordId || 'unknown',
        name: this.printData.modelName,
        image: this.printData.modelImage
      }
      
      uni.navigateTo({
        url: `/pages/explore/createPost/createPost?modelId=${encodeURIComponent(modelInfo.id)}&modelName=${encodeURIComponent(modelInfo.name)}&modelImage=${encodeURIComponent(modelInfo.image)}&printTime=${encodeURIComponent(this.printData.printTime)}&material=${encodeURIComponent(this.printData.material)}&size=${encodeURIComponent(this.printData.size)}`
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
  background: linear-gradient(180deg, #E3F2FD 0%, #F0F4F8 50%, #FFF9F5 100%);
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
  margin: 40rpx 32rpx 32rpx;
  display: block;
  line-height: 1.3;
}

.model-image-section {
  width: calc(100% - 64rpx);
  height: 420rpx;
  border-radius: 32rpx;
  overflow: hidden;
  margin: 0 32rpx 32rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
}

.model-image {
  width: 100%;
  height: 100%;
}

.info-card {
  background: rgba(255,255,255,0.98);
  border-radius: 32rpx;
  padding: 40rpx;
  margin: 0 32rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
}

.info-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
}

.info-row:last-of-type {
  border-bottom: none;
  margin-bottom: 32rpx;
}

.info-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  width: 140rpx;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #1a1a2e;
  font-weight: 600;
  flex: 1;
}

/* 用户信息区域 */
.user-section {
  display: flex;
  align-items: center;
  padding-top: 32rpx;
  border-top: 2rpx solid rgba(0,0,0,0.05);
}

.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  margin-right: 24rpx;
  background: #f0f0f0;
  border: 3rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: #888;
  font-weight: 500;
}

.share-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #2a7fff 0%, #1e5dd8 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 32rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(42,127,255,0.3);
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
