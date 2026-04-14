<template>
  <view class="my-works-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack" />
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">
        <text class="tab-text">{{ texts.myWorks || '我的作品' }}</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'likes' }" @click="switchTab('likes')">
        <text class="tab-text">{{ texts.myLikes || '我的点赞' }}</text>
      </view>
    </view>
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
        <text class="empty-text">{{
          activeTab === 'works' ? texts.noWorks || '暂无作品' : texts.noLikes || '暂无点赞'
        }}</text>
        <text class="empty-hint">{{
          activeTab === 'works' ? texts.emptyHint || '快去打印吧' : texts.goLike || '快去点赞吧'
        }}</text>
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

<script lang="ts">
import WorkCard from './components/WorkCard.vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import CustomActionSheet from './components/CustomActionSheet.vue'
import { getModelRecords, getPrintRecords } from '@/api/operationRecords.ts'
import { deleteModel } from '@/api/models.ts'
import { getPostList, getLikedPosts } from '@/api/community.ts'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface WorkItem {
  id: number | string
  title: string
  image: string
  printTime: string
  printDate: string
  type: string
  status: string
  isPost?: boolean
  isLiked?: boolean
}

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
      worksList: [] as WorkItem[],
      loading: false as boolean,
      selectedWork: null as WorkItem | null,
      showActionSheet: false as boolean,
      showCustomActionSheet: false as boolean,
      actionSheetItems: [] as string[],
      cancelText: '取消' as string,
      activeTab: 'works' as 'works' | 'likes'
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    userStore(): ReturnType<typeof useUserStore> {
      return useUserStore()
    },
    texts(): Record<string, string> {
      return this.languageStore?.texts?.myWorks || {}
    }
  },
  watch: {
    'languageStore.language': {
      handler(): void {
        this.cancelText = this.texts.cancel || '取消'
      },
      immediate: true
    },
    'languageStore.texts': {
      handler(): void {
        this.cancelText = this.texts.cancel || '取消'
      },
      immediate: true,
      deep: true
    }
  },
  onShow(): void {
    this.languageStore.loadLanguage()
    if (uni.getStorageSync('needRefreshWorks')) {
      uni.removeStorageSync('needRefreshWorks')
    }
    this.loadData()
    uni.$off('refreshLikedPosts')
    uni.$on('refreshLikedPosts', () => {
      if (this.activeTab === 'likes') {
        this.loadLikedPosts()
      }
    })
  },
  onHide(): void {
    uni.$off('refreshLikedPosts')
  },
  methods: {
    fixImageUrl(url: string): string {
      if (!url) return ''
      return url.replace('localhost:9000', '47.102.212.37:9000')
    },
    switchTab(tab: 'works' | 'likes'): void {
      if (this.activeTab === tab) return
      this.activeTab = tab
      this.loadData()
    },
    async loadData(): Promise<void> {
      console.log('【作品博物馆】loadData触发, activeTab:', this.activeTab)
      if (this.activeTab === 'works') {
        await this.loadWorks()
      } else {
        await this.loadLikedPosts()
      }
    },
    async loadLikedPosts(): Promise<void> {
      this.loading = true
      try {
        const res = await getLikedPosts({
          current: 1,
          size: 100
        })
        console.log('【作品博物馆】点赞列表API响应:', JSON.stringify(res))
        console.log('【作品博物馆】res.data:', res.data)
        console.log('【作品博物馆】res.data.records:', res.data?.records)
        console.log('【作品博物馆】res.data类型:', typeof res.data)
        const records = (res.data?.records || res.data || []) as unknown as Record<string, unknown>[]
        console.log('【作品博物馆】最终使用的records:', records)
        if ((res.code === 0 || res.code === 1) && records.length > 0) {
          this.worksList = records.map((post: Record<string, unknown>) => {
             console.log('【作品博物馆】每条post数据:', post)
             const imageUrl = Array.isArray(post.imageUrls) && post.imageUrls.length > 0 
               ? String(post.imageUrls[0]) 
               : ''
             return {
               id: String(post.postId || post.id || ''),
               title: String(post.title || post.name || ''),
               image: this.fixImageUrl(imageUrl) || `https://picsum.photos/400/400?random=${post.postId}`,
               printTime: '-',
               printDate: String(post.createdAt || post.createTime || '').split('T')[0] || '',
               type: 'model',
               status: 'completed',
               isPost: true,
               isLiked: true
             }
           })
          console.log('【作品博物馆】处理后的worksList:', this.worksList)
        } else {
          this.worksList = []
        }
      } catch (error) {
        console.error('【作品博物馆】加载点赞列表失败:', error)
        this.worksList = []
      } finally {
        this.loading = false
      }
    },

    async loadWorks(): Promise<void> {
      this.loading = true
      console.log('【作品博物馆】loadWorks开始')
      try {
        const userInfo = this.userStore.userInfo
        console.log('【作品博物馆】userInfo:', userInfo)
        if (userInfo && userInfo.userId) {
          const res = await getPostList({
            userId: userInfo.userId,
            current: 1,
            size: 100
          })
          console.log('【作品博物馆】getPostList API响应:', JSON.stringify(res))
          console.log('【作品博物馆】res.data:', res.data)
          const records = (res.data?.records || res.data || []) as unknown as Record<string, unknown>[]
          console.log('【作品博物馆】最终使用的records:', records)
          if ((res.code === 0 || res.code === 1) && records.length > 0) {
            let apiPosts: WorkItem[] = records.map((post: Record<string, unknown>) => {
              console.log('【作品博物馆】每条post数据:', post)
              const imageUrl = Array.isArray(post.imageUrls) && post.imageUrls.length > 0 
                ? String(post.imageUrls[0]) 
                : ''
              return {
                id: String(post.postId || post.id || ''),
                title: String(post.title || post.name || ''),
                image: this.fixImageUrl(imageUrl) || `https://picsum.photos/400/400?random=${post.postId}`,
                printTime: '-',
                printDate: String(post.createdAt || post.createTime || '').split('T')[0] || '',
                type: 'model',
                status: 'completed',
                isPost: true
              }
            })

            const newlyCreatedPost = uni.getStorageSync('newlyCreatedPost') as Record<string, unknown> | undefined
            if (newlyCreatedPost && String(newlyCreatedPost.userId) === String(userInfo?.userId)) {
              if (!apiPosts.some(ap => String(ap.id) === String(newlyCreatedPost.id))) {
                apiPosts.unshift({
                  id: String(newlyCreatedPost.id || ''),
                  title: String(newlyCreatedPost.title || ''),
                  image: this.fixImageUrl(String(newlyCreatedPost.image || '')),
                  printTime: '-',
                  printDate:
                    String(newlyCreatedPost.createdAt || '').split('T')[0] || '',
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
        const err = error as Error
        console.error('加载作品失败:', error)
        uni.showToast({
          title: err?.message || this.texts.loadFailed || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    handleBack(): void {
      uni.navigateBack()
    },

    handleWorkClick(work: WorkItem): void {
      if (work.isPost) {
        uni.navigateTo({
          url: `/pages/explore/showcaseWorksDetail/showcaseWorksDetail?postId=${work.id}&title=${encodeURIComponent(work.title || '')}&image=${encodeURIComponent(work.image || '')}`
        })
        return
      }
      this.selectedWork = work
      const printPosterText = this.texts.printPoster || '打印海报'
      const deleteWorkText = this.texts.deleteWork || '删除作品'
      const cancelText = this.texts.cancel || '取消'
      this.actionSheetItems = [printPosterText, deleteWorkText]
      this.cancelText = cancelText
      this.showCustomActionSheet = true
    },

    handleActionSheetSelect(res: { tapIndex: number }): void {
      if (res.tapIndex === 0) {
        this.handlePrintPoster(this.selectedWork as WorkItem)
      } else if (res.tapIndex === 1) {
        this.handleDeleteWork(this.selectedWork as WorkItem)
      }
      this.showCustomActionSheet = false
    },

    handleActionSheetCancel(): void {
      this.showCustomActionSheet = false
    },

    handleDeleteWork(work: WorkItem): void {
      const deleteConfirmText = this.texts.deleteConfirm || '确认删除'
      const deleteConfirmContentText =
        this.texts.deleteConfirmContent || '确定要删除这个作品吗？此操作不可恢复。'
      const confirmText = this.texts.confirm || '确认'
      const cancelText = this.texts.cancel || '取消'
      const deleteSuccessText = this.texts.deleteSuccess || '删除成功'
      const deleteFailedText = this.texts.deleteFailed || '删除失败'

      uni.showModal({
        title: deleteConfirmText,
        content: deleteConfirmContentText,
        confirmText: confirmText,
        cancelText: cancelText,
        success: async (res: UniApp.ShowModalRes) => {
          if (res.confirm) {
            try {
              const response = await deleteModel(work.id as number)
              if (response.code === 1) {
                uni.showToast({ title: deleteSuccessText, icon: 'success' })
                this.worksList = this.worksList.filter(item => item.id !== work.id)
              } else {
                uni.showToast({ title: response.msg || deleteFailedText, icon: 'none' })
              }
            } catch (error) {
              console.error('删除作品失败:', error)
              uni.showToast({ title: deleteFailedText, icon: 'none' })
            }
          }
        }
      })
    },

    handlePrintPoster(work: WorkItem): void {
      uni.showToast({ title: this.texts.generatingPoster || '正在生成海报...', icon: 'loading' })
      setTimeout(() => {
        uni.showToast({ title: this.texts.posterGenerated || '海报生成成功', icon: 'success' })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.my-works-page {
  min-height: 100vh;
  background-color: #fff9f5;
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
  color: #ff6b35;
  margin-top: 20rpx;
  font-weight: bold;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 88rpx;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #ff6b35;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #ff6b35;
  font-weight: bold;
}
</style>
