<template>
  <scroll-view scroll-y class="page" :scroll-x="false" :show-scrollbar="false">
    <!-- 安全区域 -->
    <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
    
    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 功能按钮区域 -->
      <creation-tools />
    </view>
  </scroll-view>
</template>

<script>
import CreationTools from '@/pages/create/create/components/creationTools.vue'
import tabBarMixin from '@/mixins/tabBarMixin'

export default {
  mixins: [tabBarMixin],
  components: {
    CreationTools
  },
  data() {
    return {
      statusBarHeight: 0
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #FFF9F5;
}
.page::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
.content {
  padding: 40rpx;
  min-height: calc(100vh - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 100rpx;
  align-items: center;
}
</style>