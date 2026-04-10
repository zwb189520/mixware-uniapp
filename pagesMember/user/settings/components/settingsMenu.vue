<template>
  <view class="settings-menu">
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleMenuClick(item)"
      >
        <text class="menu-text">{{ item.title }}</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>

      <view class="menu-item" @click="handleLanguageClick">
        <text class="menu-text">{{ texts.language }}</text>
        <view class="language-right">
          <text class="language-value">{{ languageLabel }}</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>
    </view>

    <view v-if="isLoggedIn" class="logout-section">
      <view class="logout-button" @click="handleLogout">
        <text class="logout-text">{{ texts.logout }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'
import { logout } from '@/api/users.ts'

export default {
  name: 'SettingsMenu',
  data() {
    return {
      isLoggedIn: false,
      menuItems: [
        { id: 1, title: '个人资料' },
        { id: 2, title: '账户与安全' }
      ]
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    languageLabel() {
      return this.languageStore.language === 'en' ? 'English' : '中文'
    },
    texts() {
      return this.languageStore.texts.settings
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
    this.updateMenuItems()
    this.checkLoginStatus()
    uni.$on('userLogout', () => {
      this.isLoggedIn = false
    })
    uni.$on('userLogin', () => {
      this.isLoggedIn = true
    })
  },

  onShow() {
    this.checkLoginStatus()
  },

  beforeDestroy() {
    uni.$off('userLogout')
    uni.$off('userLogin')
  },
  watch: {
    'languageStore.language'() {
      this.updateMenuItems()
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = uni.getStorageSync('isLoggedIn') || false
    },
    updateMenuItems() {
      this.menuItems = [
        { id: 1, title: this.texts.profile },
        { id: 2, title: this.texts.account }
      ]
    },
    handleLanguageClick() {
      const options = ['中文', 'English']
      uni.showActionSheet({
        itemList: options,
        success: res => {
          if (typeof res.tapIndex !== 'number') return
          const lang = res.tapIndex === 1 ? 'en' : 'zh'
          this.languageStore.setLanguage(lang)
          const toastText = lang === 'en' ? this.texts.switchLanguageEn : this.texts.switchLanguage
          uni.showToast({ title: toastText, icon: 'none' })
          this.$emit('language-change', lang)
        }
      })
    },
    handleMenuClick(item) {
      if (item.id === 1) {
        const isLoggedIn = uni.getStorageSync('isLoggedIn') || false
        if (!isLoggedIn) {
          uni.navigateTo({
            url: '/pagesMember/auth/login/login'
          })
        } else {
          uni.navigateTo({
            url: '/pagesMember/user/profileEdit/profileEdit'
          })
        }
      } else if (item.id === 2) {
        const isLoggedIn = uni.getStorageSync('isLoggedIn') || false
        if (!isLoggedIn) {
          uni.navigateTo({
            url: '/pagesMember/auth/login/login'
          })
        } else {
          uni.navigateTo({
            url: '/pagesMember/user/accountSecurity/accountSecurity'
          })
        }
      }
      console.log('点击菜单:', item.title)
    },
    handleLogout() {
      uni.showModal({
        title: this.texts.logoutTitle,
        content: this.texts.logoutContent,
        success: async res => {
          if (res.confirm) {
            try {
              await logout()
            } catch (error) {
              console.error('后端注销失败:', error)
            }

            uni.removeStorageSync('isLoggedIn')
            uni.removeStorageSync('token')
            uni.removeStorageSync('userId')
            uni.removeStorageSync('userInfo')

            console.log('Settings - 退出登录，清除用户信息')

            uni.showToast({
              title: this.texts.logoutSuccess,
              icon: 'success'
            })

            uni.$emit('userLogout')

            setTimeout(() => {
              uni.switchTab({
                url: '/pages/profile/profile'
              })
            }, 1000)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.settings-menu {
  padding: 20rpx 30rpx;
}

.menu-section {
  background-color: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #fff9f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.language-right {
  display: flex;
  align-items: center;
  gap: 0;
}

.language-value {
  font-size: 28rpx;
  color: #999;
  margin-right: 0;
}

.logout-section {
  padding: 0 30rpx;
}

.logout-button {
  height: 88rpx;
  background-color: #fff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #ff5a00;
}

.logout-text {
  font-size: 28rpx;
  color: #ff5a00;
}
</style>
