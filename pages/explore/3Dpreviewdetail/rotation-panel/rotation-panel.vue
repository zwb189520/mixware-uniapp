<template>
  <view class="rotation-panel" v-if="visible">
    <view class="panel-header">
      <text class="reset-btn" @tap="handleReset">{{ texts.reset || '重置' }}</text>
      <text class="panel-title">{{ texts.rotate || '旋转' }}</text>
      <text class="close-btn" @tap="handleClose">×</text>
    </view>

    <view class="rotation-item">
      <view class="axis-label">X</view>
      <view class="rotation-control">
        <text class="angle-text">{{ rotationX }}°</text>
        <view
          class="ruler-container"
          @touchstart="e => onRulerTouchStart('x', e)"
          @touchmove="e => onRulerTouchMove('x', e)"
          @touchend="onRulerTouchEnd"
        >
          <view class="ruler-wrapper" :style="{ transform: `translateX(${-rulerOffsetX}px)` }">
            <view class="ruler-line">
              <view
                v-for="i in 361"
                :key="i"
                class="ruler-tick"
                :class="{
                  major: (i - 181) % 10 === 0,
                  minor: (i - 181) % 5 === 0 && (i - 181) % 10 !== 0
                }"
              >
                <text v-if="(i - 181) % 10 === 0" class="tick-label">{{ i - 181 }}</text>
              </view>
            </view>
          </view>
          <view class="ruler-center"></view>
        </view>
      </view>
    </view>

    <view class="rotation-item">
      <view class="axis-label">Y</view>
      <view class="rotation-control">
        <text class="angle-text">{{ rotationY }}°</text>
        <view
          class="ruler-container"
          @touchstart="e => onRulerTouchStart('y', e)"
          @touchmove="e => onRulerTouchMove('y', e)"
          @touchend="onRulerTouchEnd"
        >
          <view class="ruler-wrapper" :style="{ transform: `translateX(${-rulerOffsetY}px)` }">
            <view class="ruler-line">
              <view
                v-for="i in 361"
                :key="i"
                class="ruler-tick"
                :class="{
                  major: (i - 181) % 10 === 0,
                  minor: (i - 181) % 5 === 0 && (i - 181) % 10 !== 0
                }"
              >
                <text v-if="(i - 181) % 10 === 0" class="tick-label">{{ i - 181 }}</text>
              </view>
            </view>
          </view>
          <view class="ruler-center"></view>
        </view>
      </view>
    </view>

    <view class="rotation-item">
      <view class="axis-label">Z</view>
      <view class="rotation-control">
        <text class="angle-text">{{ rotationZ }}°</text>
        <view
          class="ruler-container"
          @touchstart="e => onRulerTouchStart('z', e)"
          @touchmove="e => onRulerTouchMove('z', e)"
          @touchend="onRulerTouchEnd"
        >
          <view class="ruler-wrapper" :style="{ transform: `translateX(${-rulerOffsetZ}px)` }">
            <view class="ruler-line">
              <view
                v-for="i in 361"
                :key="i"
                class="ruler-tick"
                :class="{
                  major: (i - 181) % 10 === 0,
                  minor: (i - 181) % 5 === 0 && (i - 181) % 10 !== 0
                }"
              >
                <text v-if="(i - 181) % 10 === 0" class="tick-label">{{ i - 181 }}</text>
              </view>
            </view>
          </view>
          <view class="ruler-center"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'

interface RotationData {
  axis: string
  value: number
  x: number
  y: number
  z: number
}

export default {
  name: 'RotationPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    texts(): any {
      return this.languageStore?.texts?.explore || {}
    }
  },
  data() {
    return {
      rotationX: 0 as number,
      rotationY: 0 as number,
      rotationZ: 0 as number,
      rulerOffsetX: 180 as number,
      rulerOffsetY: 180 as number,
      rulerOffsetZ: 180 as number,
      touchStartX: 0 as number,
      touchStartOffset: 0 as number,
      currentAxis: '' as string
    }
  },
  watch: {
    visible(val: boolean): void {
      if (val) {
        this.$emit('open')
      }
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  methods: {
    onRulerTouchStart(axis: string, e: TouchEvent): void {
      this.currentAxis = axis
      this.touchStartX = e.touches[0].clientX
      this.touchStartOffset = (this as any)[`rulerOffset${axis.toUpperCase()}`]
    },
    onRulerTouchMove(axis: string, e: TouchEvent): void {
      const deltaX = this.touchStartX - e.touches[0].clientX
      let newOffset = this.touchStartOffset + deltaX
      newOffset = Math.max(0, Math.min(360, newOffset))
      ;(this as any)[`rulerOffset${axis.toUpperCase()}`] = newOffset
      const value = Math.round(newOffset - 180)
      ;(this as any)[`rotation${axis.toUpperCase()}`] = value
      this.$emit('rotationChanging', {
        axis,
        value,
        x: this.rotationX,
        y: this.rotationY,
        z: this.rotationZ
      } as RotationData)
    },
    onRulerTouchEnd(): void {
      this.$emit('rotationChange', {
        axis: this.currentAxis,
        value: (this as any)[`rotation${this.currentAxis.toUpperCase()}`],
        x: this.rotationX,
        y: this.rotationY,
        z: this.rotationZ
      } as RotationData)
    },
    handleReset(): void {
      this.rotationX = 0
      this.rotationY = 0
      this.rotationZ = 0
      this.rulerOffsetX = 180
      this.rulerOffsetY = 180
      this.rulerOffsetZ = 180
      this.$emit('reset')
    },
    handleClose(): void {
      this.$emit('close')
    },
    getRotation(): { x: number; y: number; z: number } {
      return {
        x: this.rotationX,
        y: this.rotationY,
        z: this.rotationZ
      }
    },
    setRotation(x: number, y: number, z: number): void {
      this.rotationX = x
      this.rotationY = y
      this.rotationZ = z
      this.rulerOffsetX = x + 180
      this.rulerOffsetY = y + 180
      this.rulerOffsetZ = z + 180
    }
  }
}
</script>

<style scoped>
.rotation-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2a2a2a;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  z-index: 1000;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.reset-btn {
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 20rpx;
}

.panel-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
}

.close-btn {
  color: #fff;
  font-size: 40rpx;
  padding: 10rpx 20rpx;
  line-height: 1;
}

.rotation-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.rotation-item:last-child {
  margin-bottom: 0;
}

.axis-label {
  width: 40rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
}

.rotation-control {
  flex: 1;
  margin-left: 20rpx;
}

.angle-text {
  display: block;
  color: #fff;
  font-size: 28rpx;
  text-align: center;
  margin-bottom: 10rpx;
}

.ruler-container {
  position: relative;
  height: 80rpx;
  overflow: hidden;
  background-color: #333;
  border-radius: 8rpx;
}

.ruler-wrapper {
  position: absolute;
  left: 50%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 20rpx;
}

.ruler-line {
  display: flex;
  align-items: flex-end;
  height: 40rpx;
}

.ruler-tick {
  width: 2rpx;
  height: 10rpx;
  background-color: #666;
  margin: 0 3rpx;
  position: relative;
}

.ruler-tick.minor {
  height: 16rpx;
  background-color: #888;
}

.ruler-tick.major {
  height: 24rpx;
  background-color: #fff;
}

.tick-label {
  position: absolute;
  bottom: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18rpx;
  color: #aaa;
  white-space: nowrap;
}

.ruler-center {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background-color: #2a7fff;
  transform: translateX(-50%);
  z-index: 10;
}
</style>
