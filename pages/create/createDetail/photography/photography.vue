<template>
  <view class="page">
    <safe-area />
    <PhotographyNavbar
      @back-click="handleBack"
      @more-click="handleMore"
    />
    <main-view @upload-success="handleUploadSuccess" />
  </view>
</template>

<script>
import PhotographyNavbar from './components/PhotographyNavbar.vue'
import MainView from './components/MainView.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export default {
  components: {
    PhotographyNavbar,
    MainView,
    SafeArea
  },
  data() {
    return {}
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleMore() {
      uni.showActionSheet({
        itemList: ['分享', '举报', '帮助'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              uni.showShareMenu()
              break
            case 1:
              uni.showToast({ title: '举报成功', icon: 'success' })
              break
            case 2:
              uni.showToast({ title: '帮助功能开发中', icon: 'none' })
              break
          }
        }
      })
    },
    handleUploadSuccess(imagePath) {
      console.log('主视图上传成功:', imagePath)
    }
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  background: #ffffff;
}

.safe-area-top {
  background: #fff;
}
</style>