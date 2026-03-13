<template>
  <view class="follow-page">
    <safe-area />
    <custom-navbar :title="pageTitle" @back="handleBack" />
    
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'following' }"
        @click="switchTab('following')"
      >
        <text class="tab-text">{{ texts.following }} {{ followingCount }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'followers' }"
        @click="switchTab('followers')"
      >
        <text class="tab-text">{{ texts.followers }} {{ followersCount }}</text>
      </view>
    </view>

    <scroll-view class="user-list" scroll-y>
      <view 
        v-for="user in currentList" 
        :key="user.userId" 
        class="user-item"
        @click="goToUserProfile(user.userId)"
      >
        <image class="user-avatar" :src="user.avatarUrl" mode="aspectFill" />
        <view class="user-info">
          <text class="user-name">{{ user.username }}</text>
          <text class="user-desc">{{ user.bio || texts.noDescription }}</text>
        </view>
        <view 
          class="follow-btn" 
          :class="{ followed: user.isFollowing }"
          @click.stop="handleFollowToggle(user)"
        >
          <text class="follow-text">{{ user.isFollowing ? texts.followed : texts.follow }}</text>
        </view>
      </view>
      
      <view v-if="currentList.length === 0" class="empty-state">
        <text class="empty-text">{{ activeTab === 'following' ? texts.noFollowing : texts.noFollowers }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { getFollowingList, getFollowersList, toggleFollow } from '@/api/community'
import { useLanguageStore } from '@/stores'

export default {
  components: {
    CustomNavbar
  },
  data() {
    return {
      userId: '',
      activeTab: 'following',
      followingList: [],
      followersList: [],
      followingCount: 0,
      followersCount: 0
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.followList
    },
    pageTitle() {
      return this.activeTab === 'following' ? this.texts.followingTitle : this.texts.followersTitle
    },
    currentList() {
      return this.activeTab === 'following' ? this.followingList : this.followersList
    }
  },
  onLoad(options) {
    this.userId = options.userId || uni.getStorageSync('userInfo')?.userId || ''
    this.activeTab = options.tab || 'following'
    this.languageStore.loadLanguage()
    
    if (this.userId) {
      this.loadFollowingList()
      this.loadFollowersList()
    }
  },
  methods: {
    async loadFollowingList() {
      try {
        const res = await getFollowingList(this.userId)
        if (res.code === 0) {
          this.followingList = res.data || []
          this.followingCount = this.followingList.length
        }
      } catch (e) {
        console.error('加载关注列表失败:', e)
      }
    },

    async loadFollowersList() {
      try {
        const res = await getFollowersList(this.userId)
        if (res.code === 0) {
          this.followersList = res.data || []
          this.followersCount = this.followersList.length
        }
      } catch (e) {
        console.error('加载粉丝列表失败:', e)
      }
    },

    switchTab(tab) {
      this.activeTab = tab
    },

    async handleFollowToggle(user) {
      try {
        // 防止关注自己
        const currentUserId = uni.getStorageSync('userInfo')?.userId || ''
        if (user.userId && currentUserId && String(user.userId) === String(currentUserId)) {
          uni.showToast({
            title: '不能关注自己',
            icon: 'none'
          })
          return
        }
        
        const res = await toggleFollow(user.userId)
        if (res.code === 0) {
          const isFollowing = res.data
          user.isFollowing = isFollowing
          
          // 如果当前是关注列表，取消关注后从列表中移除该用户
          if (this.activeTab === 'following' && !isFollowing) {
            const index = this.followingList.findIndex(u => u.userId === user.userId)
            if (index !== -1) {
              this.followingList.splice(index, 1)
              this.followingCount--
            }
          }
          
          // 如果当前是粉丝列表，更新关注状态即可
          if (this.activeTab === 'followers') {
            // 重新加载粉丝列表以确保数据一致性
            this.loadFollowersList()
          }
          
          // 重新加载关注列表和粉丝数，确保数据准确
          this.loadFollowingList()
          this.loadFollowersList()
          
          uni.showToast({
            title: isFollowing ? this.texts.followSuccess : this.texts.unfollowSuccess,
            icon: 'success'
          })
        }
      } catch (e) {
        console.error('关注操作失败:', e)
        uni.showToast({ title: this.texts.operationFailed, icon: 'none' })
      }
    },

    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/profile/profile?userId=${userId}`
      })
    },

    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.follow-page {
  min-height: 100vh;
  background: #FFF9F5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 32rpx 0;
  text-align: center;
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
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #FF5A00;
  font-weight: 600;
}

.user-list {
  flex: 1;
  padding: 24rpx 32rpx;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #f0f0f0;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
}

.follow-btn {
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FF5A00 0%, #FF8C00 100%);
}

.follow-btn.followed {
  background: #f0f0f0;
}

.follow-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.follow-btn.followed .follow-text {
  color: #666;
}

.empty-state {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>

