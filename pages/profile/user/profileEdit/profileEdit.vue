<template>
  <view class="profile-edit-page">
    <safe-area />
    <view class="navbar">
      <uni-icons type="left" size="20" color="#333" @click="handleBack"></uni-icons>
      <text class="navbar-title">个人资料</text>
      <text class="navbar-save" @click="handleSave">保存</text>
    </view>
    
    <view class="profile-form">
      <view class="form-item" @click="handleAvatarEdit">
        <text class="form-label">头像</text>
        <view class="form-value">
          <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-preview" mode="aspectFill" />
          <uni-icons v-else type="person" size="40" color="#999"></uni-icons>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="form-item" @click="handleNicknameEdit">
        <text class="form-label">昵称</text>
        <view class="form-value">
          <text class="form-text">{{ userInfo.nickname || '未设置' }}</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="form-item" @click="handleRegionEdit">
        <text class="form-label">地区</text>
        <view class="form-value">
          <text class="form-text">{{ userInfo.region || '请选择' }}</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="form-item" @click="handleGenderEdit">
        <text class="form-label">性别</text>
        <view class="form-value">
          <text class="form-text">{{ userInfo.gender || '请选择' }}</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import { updateUserInfo } from '@/api/users.js'
import { BASE_URL } from '@/api/config.js'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  name: 'ProfileEdit',
  components: {
    SafeArea
  },
  data() {
    return {
      userInfo: {
        id: '',
        nickname: '',
        avatar: '',
        region: '',
        gender: ''
      },
      tempAvatar: ''
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    handleSave() {
      uni.showLoading({
        title: '保存中...'
      })
      
      const saveUserInfo = (avatarUrl) => {
        const updateData = {
          username: this.userInfo.nickname,
          avatarUrl: avatarUrl || this.userInfo.avatar
        }
        
        updateUserInfo(updateData).then(() => {
          uni.hideLoading()
          
          this.userInfo.avatar = avatarUrl || this.userInfo.avatar
          uni.setStorageSync('userInfo', this.userInfo)
          
          console.log('ProfileEdit - 保存用户信息:', this.userInfo)
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          uni.$emit('profileUpdate', this.userInfo)
          
          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        }).catch((error) => {
          uni.hideLoading()
          
          uni.showToast({
            title: error.message || '保存失败',
            icon: 'none'
          })
        })
      }
      
      if (this.tempAvatar) {
        const token = uni.getStorageSync('token') || ''
        uni.uploadFile({
          url: `${BASE_URL}/api/upload/image`,
          filePath: this.tempAvatar,
          name: 'file',
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: (uploadRes) => {
            if (uploadRes.statusCode === 200) {
              try {
                const uploadData = JSON.parse(uploadRes.data)
                if (uploadData.code === 0 || uploadData.code === 1) {
                  const avatarUrl = uploadData.data.fileUrl
                  saveUserInfo(avatarUrl)
                } else {
                  uni.hideLoading()
                  uni.showToast({
                    title: uploadData.msg || '上传头像失败',
                    icon: 'none'
                  })
                }
              } catch (e) {
                uni.hideLoading()
                uni.showToast({
                  title: '上传头像失败',
                  icon: 'none'
                })
              }
            } else {
              uni.hideLoading()
              uni.showToast({
                title: '上传头像失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            uni.hideLoading()
            uni.showToast({
              title: '上传头像失败',
              icon: 'none'
            })
          }
        })
      } else {
        saveUserInfo(null)
      }
    },
    
    handleAvatarEdit() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.tempAvatar = res.tempFilePaths[0]
          this.userInfo.avatar = this.tempAvatar
        }
      })
    },
    
    handleNicknameEdit() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入昵称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.nickname = res.content
          }
        }
      })
    },
    
    handleRegionEdit() {
      uni.showActionSheet({
        itemList: ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '其他'],
        success: (res) => {
          const regions = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '其他']
          this.userInfo.region = regions[res.tapIndex]
        }
      })
    },
    
    handleGenderEdit() {
      uni.showActionSheet({
        itemList: ['男', '女', '保密'],
        success: (res) => {
          const genders = ['男', '女', '保密']
          this.userInfo.gender = genders[res.tapIndex]
        }
      })
    },
    
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.userInfo = { ...this.userInfo, ...userInfo }
    }
  },
  
  mounted() {
    this.loadUserInfo()
  }
}
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.safe-area-top {
  background: #fff;
}

.navbar {
  height: 88rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 2rpx solid #eee;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.navbar-save {
  font-size: 28rpx;
  color: #007aff;
}

.profile-form {
  background-color: #fff;
  margin-top: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
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