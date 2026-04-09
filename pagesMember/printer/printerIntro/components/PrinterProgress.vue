<template>
  <view class="progress-container">
    <!-- 进度卡片 -->
    <view class="progress-card">
      <view class="progress-header">
        <text class="progress-title">打印进度</text>
        <text class="progress-percent">{{ progress }}%</text>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-bar-wrap">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progress + '%' }">
            <view class="progress-shine"></view>
          </view>
        </view>
      </view>
      
      <!-- 统计信息 -->
      <view class="stats-grid">
        <view v-if="estimatedTime" class="stat-item">
          <view class="stat-icon">⏱️</view>
          <view class="stat-content">
            <text class="stat-label">已打印</text>
            <text class="stat-value">{{ estimatedTime }}</text>
          </view>
        </view>
        <view v-if="printTimeHms" class="stat-item">
          <view class="stat-icon">⏳</view>
          <view class="stat-content">
            <text class="stat-label">预计总耗时</text>
            <text class="stat-value">{{ printTimeHms }}</text>
          </view>
        </view>
        <view v-if="filamentLengthM > 0" class="stat-item">
          <view class="stat-icon">🧵</view>
          <view class="stat-content">
            <text class="stat-label">预计耗材</text>
            <text class="stat-value">{{ filamentLengthM.toFixed(2) }} 米</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'PrinterProgress',
  props: {
    progress: {
      type: Number,
      default: 0
    },
    estimatedTime: {
      type: String,
      default: ''
    },
    printTimeHms: {
      type: String,
      default: ''
    },
    filamentLengthM: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'StandingBy'
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    }
  }
}
</script>

<style scoped>
.progress-container {
  width: 100%;
  padding: 20rpx 32rpx;
}

.progress-card {
  background: linear-gradient(135deg, #FFF9F5 0%, #FFF 100%);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.08);
  border: 2rpx solid rgba(255, 107, 53, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.progress-title {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.progress-percent {
  font-size: 48rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-bar-wrap {
  margin-bottom: 32rpx;
}

.progress-track {
  height: 16rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 8rpx;
  position: relative;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.stat-item {
  flex: 1;
  min-width: 160rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 107, 53, 0.08);
}

.stat-icon {
  font-size: 36rpx;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.stat-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}
</style>


