<template>
  <view class="category-tabs">
    <view 
      class="tab-item" 
      :class="{active: currentTab === tab.value}" 
      v-for="tab in tabs" 
      :key="tab.value"
      :id="'tab-' + tab.value"
      @click="handleTabClick(tab.value)"
    >
      <text class="tab-text">{{ tab.label }}</text>
    </view>
    <view class="tab-indicator" :style="indicatorStyle"></view>
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
  data() {
    return {
      indicatorStyle: {
        left: '0rpx',
        width: '40rpx'
      }
    }
  },
  mounted() {
    this.updateIndicator()
  },
  watch: {
    currentTab() {
      this.updateIndicator()
    }
  },
  methods: {
    handleTabClick(tabValue) {
      if (tabValue !== this.currentTab) {
        this.$emit('tab-change', tabValue)
      }
    },
    updateIndicator() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.category-tabs').boundingClientRect()
        query.select('#tab-' + this.currentTab).boundingClientRect()
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            const containerRect = res[0]
            const tabRect = res[1]
            const relativeLeft = tabRect.left - containerRect.left
            const indicatorWidth = 40
            this.indicatorStyle = {
              left: (relativeLeft + tabRect.width / 2 - indicatorWidth / 2) + 'px',
              width: indicatorWidth + 'px'
            }
          }
        })
      })
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
  position: relative;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  margin: 0 10rpx;
  position: relative;
}
.tab-indicator {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  height: 4rpx;
  background: #07C160;
  border-radius: 2rpx;
  transition: all 0.3s ease;
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