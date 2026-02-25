<template>
  <view class="page-container">
    <view class="draw-container">
      <web-view 
        :src="doodle3dUrl" 
        @load="handleLoad" 
        @error="handleError"
      ></web-view>
    </view>
  </view>
</template>

<script>
import { useLanguageStore } from '@/stores'

export default {
  data() {
    return {
      doodle3dUrl: 'https://doodle3d.com'
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleLoad(e) {
      console.log('Doodle3D 加载成功', e)
    },
    
    handleError(e) {
      console.error('Doodle3D 加载失败', e)
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.draw-container {
  flex: 1;
  width: 100%;
  height: 100%;
}
</style>