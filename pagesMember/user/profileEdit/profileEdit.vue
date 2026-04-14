<template>
  <view class="profile-edit-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack">
      <template #right>
        <text class="navbar-save" @click="handleSave">{{ texts.save }}</text>
      </template>
    </custom-navbar>
    <view class="profile-form">
      <view class="form-item" @click="handleAvatarEdit">
        <text class="form-label">{{ texts.avatar }}</text>
        <view class="form-value">
          <image
            v-if="userInfo.avatar"
            :src="userInfo.avatar"
            class="avatar-preview"
            mode="aspectFill"
          />
          <uni-icons v-else type="person" size="40" color="#999"></uni-icons>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="form-item" @click="handleNicknameEdit">
        <text class="form-label">{{ texts.nickname }}</text>
        <view class="form-value">
          <text class="form-text">{{ userInfo.nickname || texts.notSet }}</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      <picker mode="date" :value="userInfo.birthday" @change="handleBirthdayChange">
        <view class="form-item">
          <text class="form-label">{{ texts.birthday }}</text>
          <view class="form-value">
            <text class="form-text">{{ userInfo.birthday || texts.notSet }}</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </picker>
    </view>
  </view>
</template>

<script lang="ts">
import { updateUserInfo } from '@/api/users.ts'
import { BASE_URL } from '@/api/request.ts'
import { API } from '@/constants/index.ts'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  birthday: string
}

export default {
  name: 'ProfileEdit',
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      userInfo: {
        id: '',
        nickname: '',
        avatar: '',
        birthday: ''
      } as UserInfo,
      tempAvatar: '' as string
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
      return this.languageStore.texts.profileEdit
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
    this.loadUserInfo()
  },
  watch: {
    'languageStore.language'(): void {
      this.$forceUpdate()
    }
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },

    handleSave(): void {
      uni.showLoading({
        title: this.texts.saving
      })

      const saveUserInfo = (avatarUrl: string | null): void => {
        const updateData = {
          username: this.userInfo.nickname,
          avatarUrl: avatarUrl || this.userInfo.avatar,
          birthday: this.userInfo.birthday
        }

        updateUserInfo(updateData)
          .then(() => {
            uni.hideLoading()

            this.userInfo.avatar = avatarUrl || this.userInfo.avatar
            uni.setStorageSync('userInfo', this.userInfo)

            uni.showToast({
              title: this.texts.saveSuccess,
              icon: 'success'
            })

            uni.$emit('profileUpdate', this.userInfo)

            setTimeout(() => {
              uni.navigateBack()
            }, 500)
          })
          .catch((error) => {
            uni.hideLoading()
            const err = error as Error
            uni.showToast({
              title: err?.message || this.texts.saveFailed,
              icon: 'none'
            })
          })
      }

      if (this.tempAvatar) {
        const token = this.userStore.token || ''
        uni.uploadFile({
          url: `${BASE_URL}/upload/image`,
          filePath: this.tempAvatar,
          name: 'file',
          header: {
            Authorization: token ? `Bearer ${token}` : ''
          },
          success: (uploadRes: UniApp.UploadFileSuccessCallbackResult) => {
            if (uploadRes.statusCode === 200) {
              try {
                const uploadData = JSON.parse(uploadRes.data)
                if (uploadData.code === 1 && uploadData.data) {
                  let avatarUrl = uploadData.data.url || uploadData.data.fileUrl
                  if (!avatarUrl && uploadData.data.originalFileName) {
                    avatarUrl = `${API.UPLOAD_IMAGE_URL}/${uploadData.data.originalFileName}`
                  }
                  if (avatarUrl) {
                    saveUserInfo(avatarUrl)
                  } else {
                    uni.hideLoading()
                    uni.showToast({
                      title: this.texts.uploadSuccessNoUrl,
                      icon: 'none'
                    })
                  }
                } else {
                  uni.hideLoading()
                  uni.showToast({
                    title: uploadData.msg || this.texts.uploadAvatarFailed,
                    icon: 'none'
                  })
                }
              } catch (e) {
                console.error('解析上传响应失败:', e)
                uni.hideLoading()
                uni.showToast({
                  title: this.texts.uploadAvatarFailed,
                  icon: 'none'
                })
              }
            } else {
              uni.hideLoading()
              uni.showToast({
                title: this.texts.uploadAvatarFailed,
                icon: 'none'
              })
            }
          },
          fail: () => {
            uni.hideLoading()
            uni.showToast({
              title: this.texts.uploadAvatarFailed,
              icon: 'none'
            })
          }
        })
      } else {
        saveUserInfo(null)
      }
    },

    handleAvatarEdit(): void {
      uni.showActionSheet({
        itemList: [this.texts.chooseFromAlbum, this.texts.takePhoto],
        success: (res: UniApp.ShowActionSheetRes) => {
          if (res.tapIndex === 0) {
            uni.chooseImage({
              count: 1,
              sourceType: ['album'],
              success: (chooseRes: UniApp.ChooseImageSuccessCallbackResult) => {
                this.tempAvatar = chooseRes.tempFilePaths[0]
                this.userInfo.avatar = this.tempAvatar
              }
            })
          } else if (res.tapIndex === 1) {
            uni.chooseImage({
              count: 1,
              sourceType: ['camera'],
              success: (chooseRes: UniApp.ChooseImageSuccessCallbackResult) => {
                this.tempAvatar = chooseRes.tempFilePaths[0]
                this.userInfo.avatar = this.tempAvatar
              }
            })
          }
        }
      })
    },

    handleNicknameEdit(): void {
      uni.showModal({
        title: this.texts.editNickname,
        editable: true,
        placeholderText: this.texts.enterNickname,
        success: (res: UniApp.ShowModalRes) => {
          if (res.confirm && res.content) {
            this.userInfo.nickname = res.content
          }
        }
      })
    },

    handleBirthdayChange(e: { detail: { value: string } }): void {
      this.userInfo.birthday = e.detail.value
    },

    loadUserInfo(): void {
      const storeUserInfo = this.userStore.userInfo || {}
      this.userInfo = {
        id: String(storeUserInfo.userId || storeUserInfo.id || ''),
        nickname: storeUserInfo.nickname || storeUserInfo.userName || '',
        avatar: storeUserInfo.avatar || '',
        birthday: storeUserInfo.birthday || ''
      }
    }
  }
}
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #fff9f5;
}

.safe-area-top {
  background: #fff;
}

.navbar-save {
  font-size: 28rpx;
  color: #ff5a00;
}

.profile-form {
  background-color: #fff;
  margin: 20rpx 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #fff9f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
}

.form-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20rpx;
}

.avatar-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.form-text {
  font-size: 28rpx;
  color: #666;
}
</style>
