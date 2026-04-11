<template>
  <view class="calibration-section">
    <view class="section-title">
      <text>{{ texts.calibrationTitle || '校准功能' }}</text>
    </view>
    <view class="calibration-options">
      <view
        v-for="option in calibrationOptions"
        :key="option.id"
        class="calibration-item"
        @click="handleCalibration(option.id)"
      >
        <view class="calibration-icon">
          <uni-icons :type="option.icon" size="32" color="#666"></uni-icons>
        </view>
        <view class="calibration-info">
          <text class="calibration-name">{{ option.name }}</text>
          <text class="calibration-desc">{{ option.desc }}</text>
        </view>
        <view class="calibration-arrow">
          <uni-icons type="right" size="20" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'

interface CalibrationOption {
  id: string
  name: string
  desc: string
  icon: string
}

export default {
  name: 'CalibrationSection',
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    texts(): any {
      return this.languageStore.texts.printerMoreIntro || {}
    },
    calibrationOptions(): CalibrationOption[] {
      return [
        {
          id: 'auto_level',
          name: this.texts.autoLevel || '自动调平',
          desc: this.texts.autoLevelDesc || '自动检测并调整打印平台',
          icon: 'loop'
        },
        {
          id: 'z_offset',
          name: this.texts.zOffset || 'Z轴偏移',
          desc: this.texts.zOffsetDesc || '调整喷嘴与打印平台距离',
          icon: 'up'
        },
        {
          id: 'extruder',
          name: this.texts.extruderCalibration || '挤出机校准',
          desc: this.texts.extruderCalibrationDesc || '校准挤出机步进电机',
          icon: 'gear'
        }
      ]
    }
  },
  methods: {
    handleCalibration(type: string): void {
      uni.showToast({
        title: this.texts.startCalibration || '开始校准',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.calibration-section {
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

.calibration-options {
  display: flex;
  flex-direction: column;
}

.calibration-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 107, 53, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.calibration-item:active {
  transform: translateX(8rpx);
}

.calibration-item:last-child {
  border-bottom: none;
}

.calibration-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff9f5 0%, #ffe8dc 100%);
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.calibration-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calibration-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.calibration-desc {
  font-size: 24rpx;
  color: #999;
}

.calibration-arrow {
  margin-left: 10rpx;
}
</style>
