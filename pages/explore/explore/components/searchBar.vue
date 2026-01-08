<template>
  <view class="search-bar" @click="handleClick">
    <view class="search-left" @click.stop="handleScan">
      <uni-icons type="scan" size="30"></uni-icons>
    </view>
    <view class="divider"></view>
    <input 
      class="search-input" 
      :placeholder="placeholder" 
      readonly
      :value="keyword"
      @click.stop="handleClick"
    />
    <uni-icons type="search" size="30" @click.stop="handleClick"></uni-icons>
  </view>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: '搜索模型'
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick() {
      this.$emit('search-click')
    },
    handleScan() {
      this.$emit('scan-click')
    }
  }
}
</script>

<style scoped>
.search-bar {
  margin-top: 20rpx;
  margin-bottom: 10rpx;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 20rpx 25rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.1);
}
.search-left {
  display: flex;
  align-items: center;
  margin-left: 30rpx;
}
.divider {
  width: 2rpx;
  height: 30rpx;
  background: #e0e0e0;
  margin-left: 30rpx;
  margin-right: 30rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
</style>