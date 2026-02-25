<template>
  <view class="my-works-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="works-container">
      <view v-if="worksList.length > 0" class="works-grid">
        <view 
          v-for="(work, index) in worksList" 
          :key="index"
          class="work-item"
          @click="handleWorkClick(work)"
        >
          <WorkCard :work="work" />
        </view>
      </view>
      <view v-else-if="!loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-box.png" mode="aspectFit" />
        <text class="empty-text">{{ texts.noWorks || '暂无作品' }}</text>
        <text class="empty-hint">快去打印吧</text>
      </view>
    </view>
    
    <!-- 自定义ActionSheet -->
    <CustomActionSheet
      :visible="showCustomActionSheet"
      :items="actionSheetItems"
      :cancelText="cancelText"
      @select="handleActionSheetSelect"
      @cancel="handleActionSheetCancel"
      @update:visible="showCustomActionSheet = $event"
    />
  </view>
</template>

<script>
import WorkCard from './components/WorkCard.vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import CustomActionSheet from './components/CustomActionSheet.vue'
import { getModelRecords, getPrintRecords } from '@/api/operationRecords.js'
import { deleteModel } from '@/api/models.js'
import { getPostList } from '@/api/community.js'
import { useLanguageStore } from '@/stores'

export default {
  name: 'MyWorks',
  components: {
    WorkCard,
    CustomNavbar,
    SafeArea,
    CustomActionSheet
  },
  data() {
    return {
      worksList: [],
      loading: false,
      selectedWork: null,
      showActionSheet: false,
      showCustomActionSheet: false,
      actionSheetItems: [],
      cancelText: '取消'
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.myWorks || {}
    }
  },
  onShow() {
    this.languageStore.loadLanguage()
    this.loadWorks()
  },
  
  watch: {
    'languageStore.language': {
      handler(newLang) {
        // 更新取消按钮文本
        this.cancelText = this.texts.cancel || '取消'
      },
      immediate: true
    },
    'languageStore.texts': {
      handler(newTexts) {
        // 更新取消按钮文本
        this.cancelText = this.texts.cancel || '取消'
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async loadWorks() {
      this.loading = true
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.userId) {
          const res = await getPostList({
            userId: userInfo.userId,
            current: 1,
            size: 50
          })
          
          if (res.code === 0 && res.data && res.data.records) {
            let apiPosts = res.data.records.map(post => ({
              id: post.postId,
              title: post.title,
              image: post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : 'https://picsum.photos/400/400?random=' + post.postId,
              printTime: '-',
              printDate: post.createdAt ? post.createdAt.split('T')[0] : '',
              type: 'model',
              status: 'completed',
              isPost: true
            }))

            // 检查是否有刚发布的帖子
            const newlyCreatedPost = uni.getStorageSync('newlyCreatedPost')
            const userInfo = uni.getStorageSync('userInfo')
            if (newlyCreatedPost && String(newlyCreatedPost.userId) === String(userInfo?.userId)) {
              if (!apiPosts.some(ap => String(ap.id) === String(newlyCreatedPost.id))) {
                apiPosts.unshift({
                  id: newlyCreatedPost.id,
                  title: newlyCreatedPost.title,
                  image: newlyCreatedPost.image,
                  printTime: '-',
                  printDate: newlyCreatedPost.createdAt ? newlyCreatedPost.createdAt.split('T')[0] : '',
                  type: 'model',
                  status: 'completed',
                  isPost: true
                })
              } else {
                uni.removeStorageSync('newlyCreatedPost')
              }
            }
            
            this.worksList = apiPosts
          }
        }
      } catch (error) {
        console.error('加载作品失败:', error)
        const loadFailedText = this.texts.loadFailed || '加载失败'
        uni.showToast({
          title: error.message || loadFailedText,
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    handleBack() {
      uni.navigateBack()
    },
    
    handleWorkClick(work) {
      if (work.isPost) {
        uni.navigateTo({
          url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?id=${work.id}`
        })
        return
      }
      this.selectedWork = work
      
      // 使用后备默认值
      const printPosterText = this.texts.printPoster || '打印海报'
      const deleteWorkText = this.texts.deleteWork || '删除作品'
      const cancelText = this.texts.cancel || '取消'
      
      this.actionSheetItems = [printPosterText, deleteWorkText]
      this.cancelText = cancelText
      this.showCustomActionSheet = true
    },
    
    handleActionSheetSelect(res) {
      if (res.tapIndex === 0) {
        this.handlePrintPoster(this.selectedWork)
      } else if (res.tapIndex === 1) {
        this.handleDeleteWork(this.selectedWork)
      }
      this.showCustomActionSheet = false
    },
    
    handleActionSheetCancel() {
      this.showCustomActionSheet = false
    },
    
    handleDeleteWork(work) {
      // 使用后备默认值
      const deleteConfirmText = this.texts.deleteConfirm || '确认删除'
      const deleteConfirmContentText = this.texts.deleteConfirmContent || '确定要删除这个作品吗？此操作不可恢复。'
      const confirmText = this.texts.confirm || '确认'
      const cancelText = this.texts.cancel || '取消'
      const deleteSuccessText = this.texts.deleteSuccess || '删除成功'
      const deleteFailedText = this.texts.deleteFailed || '删除失败'
      
      uni.showModal({
        title: deleteConfirmText,
        content: deleteConfirmContentText,
        confirmText: confirmText,
        cancelText: cancelText,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await deleteModel(work.id)
              if (response.code === 1) {
                uni.showToast({
                  title: deleteSuccessText,
                  icon: 'success'
                })
                // 从列表中移除删除的作品
                this.worksList = this.worksList.filter(item => item.id !== work.id)
              } else {
                uni.showToast({
                  title: response.msg || deleteFailedText,
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除作品失败:', error)
              uni.showToast({
                title: deleteFailedText,
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    handlePrintPoster(work) {
      const generatingPosterText = this.texts.generatingPoster || '正在生成海报...'
      const posterGeneratedText = this.texts.posterGenerated || '海报生成成功'
      
      uni.showToast({
        title: generatingPosterText,
        icon: 'loading'
      })
      
      setTimeout(() => {
        uni.showToast({
          title: posterGeneratedText,
          icon: 'success'
        })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.my-works-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.works-container {
  padding: 20rpx;
}

.works-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx;
}

.work-item {
  width: 50%;
  padding: 10rpx;
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-hint {
  font-size: 28rpx;
  color: #FF6B35;
  margin-top: 20rpx;
  font-weight: bold;
}
</style>
