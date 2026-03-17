<template>
  <view class="maintenance-section">
    <view class="section-title">
      <text>保养信息</text>
    </view>
    <view class="maintenance-items">
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">耗材寿命</text>
          <text class="item-value">{{ filamentLife }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: filamentLife + '%' }"></view>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">喷嘴寿命</text>
          <text class="item-value">{{ nozzleLife }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: nozzleLife + '%' }"></view>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">上次清洁</text>
          <text class="item-value">{{ lastCleanDate }}</text>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">累计打印时长</text>
          <text class="item-value">{{ totalPrintTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
export default {
  name: 'MaintenanceSection',
  props: {
    deviceInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filamentLife: 100,
      nozzleLife: 100,
      lastCleanDate: '-',
      totalPrintTime: '-'
    }
  },
  watch: {
    deviceInfo: {
      handler(newVal) {
        if (newVal) {
          // 处理打印总时长 (秒转小时)
          if (newVal.printStatsTotalDuration !== undefined) {
            const hours = (newVal.printStatsTotalDuration / 3600).toFixed(1)
            this.totalPrintTime = hours + '小时'
          }
          
          // 上次清洁时间可以用状态更新时间暂代，或者保持现有占位
          if (newVal.statusUpdateTime) {
            this.lastCleanDate = newVal.statusUpdateTime.split(' ')[0]
          }

          // 耗材和喷嘴寿命接口暂未提供，暂时设为100或保持现状
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.maintenance-section {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
}

.maintenance-items {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.maintenance-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.item-value {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
</style>



