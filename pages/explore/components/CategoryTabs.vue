<template>
  <view class="category-tabs">
    <view 
      class="tab-item" 
      :class="{active: currentTab === tab.value}" 
      v-for="tab in tabs" 
      :key="tab.value"
      @click="handleTabClick(tab.value)"
    >
      <text class="tab-text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CategoryTabs',
  props: {
    tabs: {
      type: Array,
      required: true,
      default: () => [
        { label: '每日推荐', value: 'daily' },
        { label: '热门创作', value: 'hot' },
        { label: '其他类目', value: 'category' }
      ]
    },
    currentTab: {
      type: String,
      default: 'daily'
    }
  },
  methods: {
    handleTabClick(tabValue) {
      if (tabValue !== this.currentTab) {
        this.$emit('tab-change', tabValue)
      }
    }
  }
}
</script>

<style scoped>
.category-tabs {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  padding: 10rpx 0 20rpx;
  white-space: nowrap;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  margin: 0 10rpx;
  position: relative;
  transition: all .3s ease;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #07C160;
  border-radius: 2rpx;
  transition: all .3s ease;
}
.tab-text {
  font-size: 30rpx;
  color: #999;
  transition: all .3s ease;
}
.tab-item.active .tab-text {
  color: #333;
  font-weight: 500;
  transform: scale(1.05);
}
</style>