<template>
  <view class="profile-header">
    <view class="header-right">
      <uni-icons type="gear" size="24" @click="handleSettings"></uni-icons>
      <uni-icons type="notification" size="24" @click="handleNotification"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfileHeader',
  methods: {
    handleSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
      })
    },
    handleNotification() {
      uni.navigateTo({
        url: '/pages/message/message'
      })
    }
  }
}
</script>

<style scoped>
.profile-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 30rpx;
}

.header-right {
  display: flex;
  gap: 30rpx;
}
</style>
