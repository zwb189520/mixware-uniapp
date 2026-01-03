<template>
  <view class="printer-info">
    <view class="info-container">
      <view class="printer-photo-section">
        <image class="printer-photo" src="/static/printer-photo.png" mode="aspectFit" />
      </view>
      
      <view class="printer-details">
        <view class="printer-name">{{ printerInfo.name }}</view>
        <view class="printed-object" v-if="showPrintedObject">
          <view class="object-shape"></view>
        </view>
        <view class="printer-status" :class="statusClass">
          <uni-icons :type="statusIcon" :size="16" :color="statusColor"></uni-icons>
          <text class="status-text">{{ printerInfo.statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrinterInfo',
  data() {
    return {
      printerInfo: {
        name: 'Ender-3 V2',
        status: 'idle', // idle, printing, completed, error
        statusText: '睡觉',
        statusColor: '#999'
      },
      filamentHeight: 0
    }
  },
  computed: {
    statusClass() {
      return `status-${this.printerInfo.status}`
    },
    statusIcon() {
      const iconMap = {
        idle: 'color',
        printing: 'color',
        completed: 'checkmarkempty',
        error: 'color'
      }
      return iconMap[this.printerInfo.status] || 'color'
    },
    statusColor() {
      const colorMap = {
        idle: '#999',
        printing: '#007aff',
        completed: '#52c41a',
        error: '#ff4757'
      }
      return colorMap[this.printerInfo.status] || '#999'
    },
    showPrintedObject() {
      return this.filamentHeight > 50
    }
  },
  mounted() {
    this.updatePrinterStatus()
    this.updateFilamentHeight()
  },
  methods: {
    updatePrinterStatus() {
      // 这里可以添加实际获取打印机状态的逻辑
      // 暂时使用模拟数据
      const statuses = [
        { status: 'idle', statusText: '睡觉' },
        { status: 'printing', statusText: '工作中' },
        { status: 'completed', statusText: '完成了' },
        { status: 'error', statusText: '饿了' }
      ]
      
      // 模拟状态变化
      setTimeout(() => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        this.printerInfo = {
          ...this.printerInfo,
          ...randomStatus
        }
      }, 5000)
    },
    updateFilamentHeight() {
      // 模拟丝材高度变化
      setInterval(() => {
        this.filamentHeight = Math.floor(Math.random() * 100)
      }, 3000)
    }
  }
}
</script>

<style scoped>
.printer-info {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}

.info-container {
  display: flex;
  align-items: flex-start;
}

.printer-photo-section {
  margin-right: 30rpx;
}

.printer-photo {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}

.printer-details {
  flex: 1;
  position: relative;
  padding-top: 10rpx;
}

.printer-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.printer-status {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-idle {
  background-color: #f5f5f5;
  color: #999;
}

.status-printing {
  background-color: #e6f4ff;
  color: #007aff;
}

.status-completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-error {
  background-color: #fff2f0;
  color: #ff4757;
}

.status-text {
  font-weight: 500;
}

.printed-object {
  margin-bottom: 20rpx;
}

.object-shape {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
}
</style>
