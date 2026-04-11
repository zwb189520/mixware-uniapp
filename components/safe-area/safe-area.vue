<template>
  <view class="safe-area-top" :style="{ height: statusBarHeight + 'px' }"></view>
</template>

<script lang="ts">
export default {
  name: 'SafeArea',
  data() {
    return {
      statusBarHeight: 0 as number
    }
  },
  mounted(): void {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
  }
}
</script>

<style scoped>
.safe-area-top {
  background: #fff;
}
</style>
