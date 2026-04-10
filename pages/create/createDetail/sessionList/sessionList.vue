<template>
  <view class="session-list-page">
    <safe-area />
    <custom-navbar :title="texts.sessionList" @back="goBack">
      <template #right>
        <view class="new-btn" @click="createNewSession">
          <uni-icons type="plusempty" size="20" color="#007AFF"></uni-icons>
          <text class="new-text">{{ texts.newSession }}</text>
        </view>
      </template>
    </custom-navbar>

    <scroll-view class="session-list" scroll-y>
      <view v-if="loading && sessionList.length === 0" class="loading-state">
        <uni-load-more status="loading" :content-text="loadingText"></uni-load-more>
      </view>

      <view v-else-if="sessionList.length === 0" class="empty-state">
        <uni-icons type="chatbubble" size="64" color="#ccc"></uni-icons>
        <text class="empty-text">{{ texts.noSessions }}</text>
        <button class="create-btn" @click="createNewSession">{{ texts.createFirstSession }}</button>
      </view>

      <view v-else class="session-items">
        <view
          v-for="(session, index) in sessionList"
          :key="session.sessionId"
          class="session-item"
          :class="{ active: currentSessionIndex === index }"
          @click="selectSession(index)"
        >
          <view class="session-icon">
            <uni-icons
              type="chatbubble-filled"
              size="24"
              :color="currentSessionIndex === index ? '#007AFF' : '#666'"
            ></uni-icons>
          </view>
          <view class="session-info">
            <text class="session-title">{{
              session.title ? session.title : texts.unnamedSession
            }}</text>
            <text class="session-time">{{
              formatTime(session.updateTime || session.createTime)
            }}</text>
          </view>
          <view class="session-actions" @click.stop>
            <uni-icons
              type="more-filled"
              size="20"
              color="#999"
              @click="showActionMenu(index)"
            ></uni-icons>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useChatStore } from '@/stores/index.ts'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/index.ts'
import { getSessionList, createSession, setCurrentSession } from '@/api/session.ts'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    CustomNavbar,
    SafeArea
  },
  setup() {
    const chatStore = useChatStore()
    const languageStore = useLanguageStore()
    const { sessionList, currentSessionIndex } = storeToRefs(chatStore)

    return {
      chatStore,
      languageStore,
      sessionList,
      currentSessionIndex
    }
  },
  data() {
    return {
      loading: false,

      page: 1,
      size: 20,
      hasMore: true
    }
  },
  computed: {
    texts() {
      return (
        this.languageStore.texts.create?.sessionList || {
          title: '会话列表',
          newSession: '新建',
          noSessions: '暂无会话',
          createFirstSession: '创建第一个会话',
          unnamedSession: '未命名会话',
          deleteConfirm: '确定删除该会话吗？',
          deleteSuccess: '删除成功',
          deleteFailed: '删除失败',
          loadFailed: '加载失败',
          createSessionFailed: '创建会话失败',
          tip: '提示',
          deleteSession: '删除会话',
          justNow: '刚刚',
          minutesAgo: '分钟前',
          hoursAgo: '小时前',
          daysAgo: '天前'
        }
      )
    },
    loadingText() {
      return {
        contentdown: this.texts.contentdown || '上拉加载更多',
        contentrefresh: this.texts.contentrefresh || '加载中...',
        contentnomore: this.texts.contentnomore || '没有更多数据了'
      }
    }
  },
  onLoad() {
    this.loadSessionList()
  },
  methods: {
    async loadSessionList() {
      if (this.loading) return
      this.loading = true

      try {
        const res = await getSessionList(this.page, this.size)
        console.log('会话列表响应:', res)
        if (res.code === 1 || res.code === 0) {
          const data = res.data || {}
          const records = data.records || []
          console.log('会话记录:', records)

          if (this.page === 1) {
            this.chatStore.setSessionList(records)
          } else {
            records.forEach(session => {
              this.chatStore.sessionList.push(session)
            })
          }

          this.hasMore = records.length === this.size
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
        uni.showToast({
          title: this.texts.loadFailed,
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async createNewSession() {
      try {
        const res = await createSession()
        if (res.code === 1 || res.code === 0) {
          const session = res.data
          if (session && session.sessionId) {
            this.chatStore.addSession(session)

            await setCurrentSession(session.sessionId)

            uni.navigateTo({
              url: `/pages/create/createDetail/aiChat/aiChat?sessionId=${session.sessionId}`
            })
          }
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        uni.showToast({
          title: this.texts.createSessionFailed || '创建会话失败',
          icon: 'none'
        })
      }
    },

    async selectSession(index) {
      const session = this.sessionList[index]
      if (!session) return

      this.chatStore.selectSession(index)

      try {
        await setCurrentSession(session.sessionId)
      } catch (error) {
        console.error('设置当前会话失败:', error)
      }

      uni.navigateTo({
        url: `/pages/create/createDetail/aiChat/aiChat?sessionId=${session.sessionId}`
      })
    },

    showActionMenu(index) {
      const session = this.sessionList[index]
      uni.showActionSheet({
        itemList: [this.texts.deleteSession || '删除会话'],
        success: res => {
          if (res.tapIndex === 0) {
            this.deleteSession(index)
          }
        }
      })
    },

    async deleteSession(index) {
      const session = this.sessionList[index]

      uni.showModal({
        title: this.texts.tip || '提示',
        content: this.texts.deleteConfirm,
        success: async res => {
          if (res.confirm) {
            try {
              // 这里需要调用删除会话的API
              // await deleteSession(session.sessionId)

              this.chatStore.removeSession(index)
              uni.showToast({
                title: this.texts.deleteSuccess,
                icon: 'success'
              })
            } catch (error) {
              console.error('删除会话失败:', error)
              uni.showToast({
                title: this.texts.deleteFailed,
                icon: 'none'
              })
            }
          }
        }
      })
    },

    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) {
        return this.texts.justNow || '刚刚'
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + (this.texts.minutesAgo || '分钟前')
      } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + (this.texts.hoursAgo || '小时前')
      } else if (diff < 604800000) {
        return Math.floor(diff / 86400000) + (this.texts.daysAgo || '天前')
      } else {
        return date.toLocaleDateString()
      }
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.session-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.new-text {
  font-size: 28rpx;
  color: #007aff;
}

.session-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.create-btn {
  margin-top: 40rpx;
  padding: 20rpx 40rpx;
  background: #007aff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
}

.session-items {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #fff;
}

.session-item:last-child {
  border-bottom: none;
}

.session-item.active {
  background: #f0f8ff;
}

.session-icon {
  margin-right: 20rpx;
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.session-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.session-time {
  font-size: 24rpx;
  color: #999;
}

.session-actions {
  padding: 10rpx;
}
</style>
