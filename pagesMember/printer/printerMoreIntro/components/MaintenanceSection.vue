<template>
  <view class="maintenance-section">
    <view class="section-title">
      <text>{{ texts.maintenanceInfo || '保养信息' }}</text>
    </view>
    <view class="maintenance-items">
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">{{ texts.filamentLife || '耗材寿命' }}</text>
          <text class="item-value">{{ filamentLife }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: filamentLife + '%' }"></view>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">{{ texts.nozzleLife || '喷嘴寿命' }}</text>
          <text class="item-value">{{ nozzleLife }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: nozzleLife + '%' }"></view>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">{{ texts.lastClean || '上次清洁' }}</text>
          <text class="item-value">{{ lastCleanDate }}</text>
        </view>
      </view>
      <view class="maintenance-item">
        <view class="item-header">
          <text class="item-label">{{ texts.totalPrintTime || '累计打印时长' }}</text>
          <text class="item-value">{{ totalPrintTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'MaintenanceSection',
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.printer
    }
  },
  props: {
    deviceInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filamentLife: 100 as number,
      nozzleLife: 100 as number,
      lastCleanDate: '-' as string,
      totalPrintTime: '-' as string
    }
  },
  watch: {
    deviceInfo: {
      handler(newVal: Record<string, unknown> | null): void {
        if (newVal) {
          if (newVal.printStatsTotalDuration !== undefined && newVal.printStatsTotalDuration !== null) {
            const duration = Number(newVal.printStatsTotalDuration)
            const hours = (duration / 3600).toFixed(1)
            this.totalPrintTime = hours + (this.texts.hours || '小时')
          }

          if (newVal.statusUpdateTime && typeof newVal.statusUpdateTime === 'string') {
            this.lastCleanDate = newVal.statusUpdateTime.split(' ')[0]
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.maintenance-section {
  background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
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
  color: #ff6b35;
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
  background: linear-gradient(90deg, #ff6b35 0%, #ff8e53 100%);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
</style>
