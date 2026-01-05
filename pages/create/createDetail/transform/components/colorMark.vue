<template>
  <view class="color-mark">
    <view class="control-header">
      <text class="control-title">颜色标记</text>
      <button class="add-btn" @click="handleAddColor">添加标记</button>
    </view>
    
    <view class="color-list">
      <view 
        v-for="(mark, index) in colors" 
        :key="mark.id"
        class="color-item"
      >
        <view class="color-preview" :style="{ backgroundColor: mark.color }"></view>
        <view class="color-info">
          <text class="color-name">{{ mark.color }}</text>
          <text class="color-area">区域: {{ mark.area }}</text>
        </view>
        <button class="remove-btn" @click="handleRemoveColor(index)">删除</button>
      </view>
      
      <view v-if="colors.length === 0" class="empty-state">
        <text class="empty-text">暂无颜色标记，点击添加按钮开始标记</text>
      </view>
    </view>
    
    <!-- 颜色选择弹窗 -->
    <view v-if="showColorPopup" class="popup-overlay" @tap="closeColorPopup">
      <view class="color-picker-popup" @tap.stop>
        <view class="popup-header">
          <text class="popup-title">选择颜色</text>
        </view>
        
        <view class="color-grid">
          <view 
            v-for="color in availableColors" 
            :key="color.value"
            class="color-option"
            :style="{ backgroundColor: color.value }"
            @click="selectColor(color)"
          >
            <text class="color-option-text">{{ color.name }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeColorPopup">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ColorMark',
  props: {
    colors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showColorPopup: false,
      availableColors: [
        { name: '红色', value: '#ff4757' },
        { name: '蓝色', value: '#3742fa' },
        { name: '绿色', value: '#2ed573' },
        { name: '黄色', value: '#ffa502' },
        { name: '紫色', value: '#a55eea' },
        { name: '橙色', value: '#ff6348' },
        { name: '粉色', value: '#ff6b81' },
        { name: '青色', value: '#00cec9' }
      ]
    }
  },
  methods: {
    handleAddColor() {
      this.showColorPopup = true
    },

    closeColorPopup() {
      this.showColorPopup = false
    },

    selectColor(color) {
      this.$emit('color-add', {
        color: color.name,
        position: { x: 100, y: 100 },
        area: '未指定区域'
      })
      this.closeColorPopup()
    },

    handleRemoveColor(index) {
      this.$emit('color-remove', index)
    }
  }
}
</script>

<style scoped>
.color-mark {
  margin-bottom: 48rpx;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.control-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.add-btn {
  height: 56rpx;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 28rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
  cursor: pointer;
}

.color-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.color-item {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
}

.color-preview {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.color-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.color-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.color-area {
  font-size: 24rpx;
  color: #666;
}

.remove-btn {
  height: 48rpx;
  background: #ff6b81;
  color: #fff;
  border: none;
  border-radius: 24rpx;
  padding: 0 16rpx;
  font-size: 20rpx;
  cursor: pointer;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx dashed #ddd;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.color-picker-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.color-option {
  aspect-ratio: 1;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.color-option:hover {
  transform: scale(1.05);
}

.color-option-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.3);
}

.popup-actions {
  display: flex;
  gap: 16rpx;
}

.cancel-btn {
  flex: 1;
  height: 64rpx;
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e0e0e0;
  border-radius: 32rpx;
  cursor: pointer;
}
</style>