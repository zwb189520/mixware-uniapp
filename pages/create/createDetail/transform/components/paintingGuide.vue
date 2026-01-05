<template>
  <view class="painting-guide">
    <view class="control-header">
      <text class="control-title">涂色指导</text>
      <button class="add-btn" @click="handleAddMark">添加指导</button>
    </view>
    
    <view class="mark-list">
      <view 
        v-for="(mark, index) in marks" 
        :key="mark.id"
        class="mark-item"
      >
        <view class="mark-indicator" :style="{ backgroundColor: mark.color }"></view>
        <view class="mark-info">
          <text class="mark-position">位置: {{ mark.position }}</text>
          <text class="mark-instructions">{{ mark.instructions }}</text>
        </view>
        <button class="remove-btn" @click="handleRemoveMark(index)">删除</button>
      </view>
      
      <view v-if="marks.length === 0" class="empty-state">
        <text class="empty-text">暂无涂色指导，点击添加按钮开始添加</text>
      </view>
    </view>
    
    <!-- 涂色指导弹窗 -->
    <view v-if="showMarkPopup" class="popup-overlay" @tap="closeMarkPopup">
      <view class="mark-picker-popup" @tap.stop>
        <view class="popup-header">
          <text class="popup-title">添加涂色指导</text>
        </view>
        
        <view class="form-container">
          <view class="form-item">
            <text class="form-label">指导颜色</text>
            <view class="color-select">
              <view 
                v-for="color in guideColors" 
                :key="color.value"
                class="color-option-small"
                :style="{ backgroundColor: color.value }"
                @click="selectedGuideColor = color.value"
              >
                <view v-if="selectedGuideColor === color.value" class="selected-indicator"></view>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">指导位置</text>
            <input 
              class="form-input" 
              v-model="formData.position" 
              placeholder="请输入指导位置（如：顶部、底部）"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">涂色说明</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.instructions" 
              placeholder="请输入涂色说明"
              maxlength="100"
            />
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeMarkPopup">取消</button>
          <button class="confirm-btn" @click="confirmAddMark">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PaintingGuide',
  props: {
    marks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showMarkPopup: false,
      selectedGuideColor: '#ff4757',
      formData: {
        position: '',
        instructions: ''
      },
      guideColors: [
        { name: '红色', value: '#ff4757' },
        { name: '蓝色', value: '#3742fa' },
        { name: '绿色', value: '#2ed573' },
        { name: '黄色', value: '#ffa502' },
        { name: '紫色', value: '#a55eea' },
        { name: '橙色', value: '#ff6348' }
      ]
    }
  },
  methods: {
    handleAddMark() {
      this.formData = {
        position: '',
        instructions: ''
      }
      this.selectedGuideColor = '#ff4757'
      this.showMarkPopup = true
    },

    closeMarkPopup() {
      this.showMarkPopup = false
    },

    confirmAddMark() {
      if (!this.formData.position || !this.formData.instructions) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      this.$emit('mark-add', {
        position: this.formData.position,
        instructions: this.formData.instructions,
        color: this.selectedGuideColor
      })
      this.closeMarkPopup()
    },

    handleRemoveMark(index) {
      this.$emit('mark-remove', index)
    }
  }
}
</script>

<style scoped>
.painting-guide {
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
  background: #2ed573;
  color: #fff;
  border: none;
  border-radius: 28rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
  cursor: pointer;
}

.mark-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.mark-item {
  display: flex;
  align-items: flex-start;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
}

.mark-indicator {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  margin-top: 4rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.mark-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mark-position {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.mark-instructions {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
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
  flex-shrink: 0;
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

.mark-picker-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
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

.form-container {
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.color-select {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.color-option-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
}

.color-option-small:hover {
  transform: scale(1.1);
}

.selected-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16rpx;
  height: 16rpx;
  background: #fff;
  border-radius: 50%;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fa;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #f8f9fa;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  resize: none;
}

.popup-actions {
  display: flex;
  gap: 16rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  cursor: pointer;
  border: none;
  font-size: 28rpx;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e0e0e0;
}

.confirm-btn {
  background: #2ed573;
  color: #fff;
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

.mark-picker-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}
</style>