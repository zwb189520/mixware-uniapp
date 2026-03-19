<template>
  <view class="search-bar" @click="handleClick">
    <view class="search-input" :class="{'placeholder-text': !keyword}">{{ keyword || texts.searchModel }}</view>
    <uni-icons type="search" size="30"></uni-icons>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.explore
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleClick() {
      console.log('SearchBar clicked')
      this.$emit('search-click')
    }
  }
}
</script>

<style scoped>
.search-bar {
  margin: 20rpx 20rpx 10rpx;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 8rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.1);
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding-left: 20rpx;
}

.placeholder-text {
  color: #999;
}
</style>

