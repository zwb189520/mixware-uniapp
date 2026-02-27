<template>
  <view class="safe-area-top" :style="{height: statusBarHeight + 'px'}"></view>
</template>

<script>
export default {
  name: 'SafeArea',
  data() {
    return {
      statusBarHeight: 0
    }
  },
  mounted() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  }
}
</script>

<style scoped>
.safe-area-top {
  background: #fff;
}
</style>
