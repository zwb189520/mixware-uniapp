<template>
  <view class="page-container">
    <view class="nav-fixed">
      <safe-area />
      <custom-navbar :title="texts.createPost" @back="handleBack" />
    </view>
    
    <scroll-view scroll-y class="content-scroll">
      <view class="create-post-container">
        <!-- 关联模型信息 -->
        <view class="model-info" v-if="modelInfo">
          <view class="model-header">
            <image class="model-image" :src="modelInfo.image" mode="aspectFit" />
            <view class="model-details">
              <text class="model-name">{{ modelInfo.name }}</text>
              <text class="model-id">{{ texts.modelIdLabel }}: {{ modelInfo.id }}</text>
            </view>
          </view>
        </view>
        
        <!-- 帖子标题 -->
        <view class="form-item">
          <text class="label">{{ texts.title }}</text>
          <input 
            class="input" 
            type="text" 
            v-model="postForm.title" 
            :placeholder="texts.postTitlePlaceholder" 
            maxlength="50"
          />
        </view>
        
        <!-- 帖子内容 -->
        <view class="form-item">
          <text class="label">{{ texts.content }}</text>
          <textarea 
            class="textarea" 
            v-model="postForm.content" 
            :placeholder="texts.postContentPlaceholder" 
            maxlength="2000"
            auto-height
          ></textarea>
        </view>
        
        <!-- 图片上传 -->
        <view class="form-item">
          <text class="label">{{ texts.images }}</text>
          <view class="image-uploader">
            <view 
              class="image-item" 
              v-for="(image, index) in postForm.imageUrls" 
              :key="index"
            >
              <image class="uploaded-image" :src="image" mode="aspectFill" />
              <view class="delete-image" @click="deleteImage(index)">
                <image class="delete-icon" src="/static/images/icon/close.png" mode="aspectFit" />
              </view>
            </view>
            <view class="add-image" @click="chooseImage">
              <image class="add-icon" src="/static/images/icon/add.png" mode="aspectFit" />
              <text class="add-text">{{ texts.addImages }}</text>
            </view>
          </view>
          <text class="hint-text">{{ texts.maxImagesHint }}</text>
        </view>
        
        <!-- 话题标签 -->
        <view class="form-item">
          <text class="label">{{ texts.topics }}</text>
          <view class="topics-container">
            <view 
              class="topic-item" 
              v-for="topic in selectedTopics" 
              :key="topic"
              @click="removeTopic(topic)"
            >
              <text class="topic-text">{{ topic }}</text>
              <image class="topic-close" src="/static/images/icon/close.png" mode="aspectFit" />
            </view>
            <view class="topic-input-wrapper">
              <view class="add-topic-trigger" @click="showTopicInput = true" v-if="!showTopicInput && selectedTopics.length < 5">
                <uni-icons type="plus" size="20" color="#999"></uni-icons>
                <text class="add-topic-text">{{ texts.addTopicPlaceholder }}</text>
              </view>
              <block v-else-if="showTopicInput">
                <input 
                  class="topic-input" 
                  type="text" 
                  v-model="newTopic" 
                  :placeholder="texts.addTopicPlaceholder" 
                  :focus="showTopicInput"
                  @confirm="addTopic"
                  @input="handleTopicInput"
                  maxlength="20"
                />
                <view class="topic-add-btn" @mousedown.prevent="addTopic" @tap.stop="addTopic">
                  <text class="confirm-text">确定</text>
                </view>
              </block>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 发布按钮 -->
    <view class="publish-container">
      <button 
        class="publish-btn" 
        :disabled="!canPublish" 
        @click="handlePublish"
      >
        {{ texts.publish }}
      </button>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores'
import { createPost } from '@/api/community'
import { uploadFile } from '@/api/request'

export default {
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      postForm: {
        title: '',
        content: '',
        imageUrls: [],
        topics: [],
        modelId: '',
        status: 'PUBLISHED'
      },
      modelInfo: null,
      newTopic: '',
      showTopicInput: false,
      selectedTopics: [],
      languageStore: useLanguageStore()
    }
  },
  computed: {
    texts() {
      return this.languageStore.texts.explore
    },
    canPublish() {
      return this.postForm.title.trim() && this.postForm.content.trim()
    }
  },
  onLoad(options) {
    this.languageStore.loadLanguage()
    
    // 接收模型信息
    if (options.modelId) {
      this.postForm.modelId = options.modelId
      this.modelInfo = {
        id: options.modelId,
        name: decodeURIComponent(options.modelName || ''),
        image: decodeURIComponent(options.modelImage || '')
      }
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    // 监听话题输入，支持空格和逗号自动添加
    handleTopicInput(e) {
      const val = e.detail.value
      if (val.endsWith(' ') || val.endsWith(',') || val.endsWith('，')) {
        this.addTopic()
      }
    },

    handleTopicBlur() {
      if (!this.newTopic.trim()) {
        this.showTopicInput = false
      }
    },
    
    // 选择图片
    chooseImage() {
      if (this.postForm.imageUrls.length >= 9) {
        uni.showToast({ title: '最多可上传9张图片', icon: 'none' })
        return
      }
      
      uni.chooseImage({
        count: 9 - this.postForm.imageUrls.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.postForm.imageUrls = [...this.postForm.imageUrls, ...res.tempFilePaths]
        }
      })
    },
    
    // 删除图片
    deleteImage(index) {
      this.postForm.imageUrls.splice(index, 1)
    },
    
    // 添加话题
    addTopic() {
      const topic = this.newTopic.trim().replace(/[,，]/g, '')
      if (topic && !this.selectedTopics.includes(topic)) {
        if (this.selectedTopics.length >= 5) {
          uni.showToast({
            title: this.texts.maxTopicsHint || '最多添加5个话题',
            icon: 'none'
          })
          return
        }
        this.selectedTopics.push(topic)
        this.postForm.topics = this.selectedTopics
      }
      this.newTopic = ''
      this.showTopicInput = false
    },
    
    // 移除话题
    removeTopic(topic) {
      const index = this.selectedTopics.indexOf(topic)
      if (index !== -1) {
        this.selectedTopics.splice(index, 1)
        this.postForm.topics = [...this.selectedTopics]
      }
    },
    
    // 发布帖子
    async handlePublish() {
      if (!this.canPublish) return
      
      uni.showLoading({ title: this.texts.publishing })
      
      try {
        // 先上传图片
        const uploadedImageUrls = []
        for (const imageUrl of this.postForm.imageUrls) {
          // 上传所有本地图片，包括blob和file://格式
          if (imageUrl.startsWith('blob:') || imageUrl.startsWith('file://')) {
            const uploadRes = await uploadFile('/upload/image', imageUrl)
            if (uploadRes.code === 1 && uploadRes.data) {
              let uploadedUrl = uploadRes.data.url || uploadRes.data.fileUrl
              if (!uploadedUrl && uploadRes.data.originalFileName) {
                uploadedUrl = `http://app.mixwarebot.cn:9000/image/${uploadRes.data.originalFileName}`
              }
              uploadedImageUrls.push(uploadedUrl)
            }
          } else {
            uploadedImageUrls.push(imageUrl)
          }
        }
        
        // 创建帖子数据
        let finalContent = this.postForm.content
        // 如果有话题，自动拼接到内容末尾，确保话题能显示（针对后端可能不存储 topics 的兜底）
        if (this.postForm.topics && this.postForm.topics.length > 0) {
          const topicString = this.postForm.topics.map(t => `#${t}#`).join(' ')
          if (!finalContent.includes(topicString)) {
            finalContent += '\n' + topicString
          }
        }

        const postData = {
          ...this.postForm,
          content: finalContent,
          imageUrls: uploadedImageUrls,
          topics: this.postForm.topics, // 保持数组
          tags: this.postForm.topics.join(',') // 同时也发送逗号分隔的字符串，增加兼容性
        }
        
        const res = await createPost(postData)
        if (res.code === 0 || res.code === 1) {
          uni.showToast({ title: this.texts.publishSuccess, icon: 'success' })
          
          setTimeout(() => {
            // 返回到模型详情页
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('发布帖子失败:', error)
        uni.showToast({ title: this.texts.publishFailed, icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.content-scroll {
  flex: 1;
  height: 0; /* 强制 flex 容器正确计算高度，防止被子元素撑开 */
  min-height: 0;
}

/* 确保导航栏不被挤压 */
.nav-fixed {
  flex-shrink: 0;
  width: 100%;
}

.create-post-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* 模型信息 */
.model-info {
  margin-bottom: 24rpx;
  padding: 16rpx;
  background: #f0f8ff;
  border-radius: 12rpx;
  border: 1rpx solid #e0f0ff;
}

.model-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.model-image {
  width: 80rpx;
  height: 80rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
}

.model-details {
  flex: 1;
}

.model-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 4rpx;
}

.model-id {
  font-size: 22rpx;
  color: #999;
  display: block;
}

/* 表单项 */
.form-item {
  margin-bottom: 32rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 72rpx;
  background: #f8f8f8;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  background: #f8f8f8;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

.topic-input {
  box-sizing: border-box;
}

/* 图片上传 */
.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f0f0f0;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.delete-image {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 20rpx;
  height: 20rpx;
  filter: invert(1);
}

.add-image {
  width: 180rpx;
  height: 180rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #fafafa;
  transition: all 0.3s;
}

.add-image:active {
  transform: scale(0.95);
  border-color: #667eea;
}

.add-icon {
  width: 48rpx;
  height: 48rpx;
  opacity: 0.6;
}

.add-text {
  font-size: 24rpx;
  color: #999;
}

.hint-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
  display: block;
}

/* 话题标签 */
.topics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.topic-item {
  display: inline-flex;
  align-items: center;
  height: 56rpx;
  padding: 0 10rpx 0 20rpx;
  background: #f0f8ff;
  border: 1rpx solid #e0f0ff;
  border-radius: 28rpx;
  box-sizing: border-box;
}

.topic-text {
  font-size: 24rpx;
  color: #667eea;
  line-height: 1;
}

.topic-close {
  width: 24rpx;
  height: 24rpx;
  margin-left: 4rpx;
  opacity: 0.6;
}

.topic-input-wrapper {
  flex: 1;
  min-width: 240rpx;
  position: relative;
  display: flex;
  align-items: center;
}

.add-topic-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 60rpx;
  padding: 0 24rpx;
  background: #f8f8f8;
  border: 1rpx dashed #ccc;
  border-radius: 30rpx;
}

.add-topic-text {
  font-size: 24rpx;
  color: #999;
}

.topic-input {
  flex: 1;
  height: 60rpx;
  background: #f8f8f8;
  border: 1rpx solid #e0e0e0;
  border-radius: 30rpx;
  padding: 0 100rpx 0 20rpx;
  font-size: 24rpx;
  color: #333;
}

.topic-add-btn {
  position: absolute;
  right: 6rpx;
  height: 50rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: #FF5A00;
  border-radius: 25rpx;
}

.topic-add-btn:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.confirm-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}

/* 发布按钮 */
.publish-container {
  flex-shrink: 0;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
}

.publish-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(255, 90, 0, 0.3);
  transition: all 0.3s;
}

.publish-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(255, 90, 0, 0.4);
}

.publish-btn:disabled {
  background: #e0e0e0;
  color: #999;
  box-shadow: none;
}
</style>