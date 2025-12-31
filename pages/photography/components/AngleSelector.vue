<template>
  <view class="angle-selector">
    <view class="selector-title">
      <text class="title-text">选择拍摄角度</text>
      <text class="progress-text">{{ capturedCount }}/{{ angles.length }}</text>
    </view>
    
    <scroll-view scroll-x class="angle-list" :show-scrollbar="false">
      <view class="angle-items">
        <view 
          v-for="angle in angles" 
          :key="angle.key"
          class="angle-item"
          :class="{ 
            active: currentAngle === angle.key,
            captured: capturedPhotos[angle.key]
          }"
          @click="$emit('angle-change', angle.key)"
        >
          <text class="angle-icon">{{ angle.icon }}</text>
          <text class="angle-name">{{ angle.name }}</text>
          <view v-if="capturedPhotos[angle.key]" class="capture-status">
            <text class="status-icon">✓</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'AngleSelector',
  props: {
    angles: {
      type: Array,
      required: true
    },
    currentAngle: {
      type: String,
      required: true
    },
    capturedPhotos: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    capturedCount() {
      return Object.keys(this.capturedPhotos).length
    }
  }
}
</script>

<style scoped>
.angle-selector {
  padding: 30rpx 40rpx;
  background: white;
}
.selector-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}
.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.progress-text {
  font-size: 28rpx;
  color: #666;
}
.angle-list {
  white-space: nowrap;
}
.angle-items {
  display: inline-flex;
  gap: 20rpx;
}
.angle-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  min-width: 120rpx;
  position: relative;
  transition: all 0.3s ease;
}
.angle-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.05);
}
.angle-item.captured {
  background: #e8f5e8;
}
.angle-item.captured.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.angle-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}
.angle-item.active .angle-icon,
.angle-item.active .angle-name {
  color: white;
}
.angle-name {
  font-size: 24rpx;
  color: #666;
}
.capture-status {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}
</style>