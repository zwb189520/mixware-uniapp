<template>
  <view class="printer-partner">
    <view class="section-title">
      <text>打印机伙伴</text>
    </view>
    
    <view v-if="!isBound" class="partner-unbound" @click="handleFindPartner">
      <view class="partner-content">
        <uni-icons type="color" size="24" color="#666"></uni-icons>
        <text class="partner-text">寻找伙伴</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <view v-else class="partner-bound" @click="handlePrinterIntro">
      <view class="partner-info">
        <view class="printer-icon">
          <uni-icons type="color" size="30" color="#007aff"></uni-icons>
        </view>
        <view class="printer-details">
          <view class="printer-name">{{ printerInfo.name }}</view>
          <view class="printer-model">{{ printerInfo.model }}</view>
          <view class="printer-status" :class="{ 'online': printerInfo.isOnline, 'offline': !printerInfo.isOnline }">
            {{ printerInfo.isOnline ? '在线' : '离线' }}
          </view>
        </view>
      </view>
    </view>
    
    <view class="intro-entry" @click="handlePrinterIntro">
      <view class="intro-content">
        <uni-icons type="gear" size="20" color="#666"></uni-icons>
        <text class="intro-text">打印机详情与状态</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <!-- 添加打印机弹框 -->
    <AddPrinterModal 
      :visible="showAddPrinter" 
      @select-printer="onSelectPrinter" 
      @cancel="onCancelAddPrinter" 
    />
  </view>
</template>

<script>
import AddPrinterModal from './AddPrinterModal.vue'

export default {
  name: 'PrinterPartner',
  components: {
    AddPrinterModal
  },
  data() {
    return {
      isBound: false,
      printerInfo: {
        name: '',
        model: '',
        isOnline: false
      },
      showAddPrinter: false
    }
  },
  methods: {
    handleFindPartner() {
      this.showAddPrinter = true
    },
    handlePrinterIntro() {
        uni.navigateTo({
          url: '/pages/printer/printerIntro/printerIntro'
        })
      },
      onSelectPrinter(printerId) {
        this.showAddPrinter = false
        uni.navigateTo({
          url: `/pages/printer/printerPrint/printerPrint?printerId=${printerId}`
        })
      },
    onCancelAddPrinter() {
      this.showAddPrinter = false
      console.log('用户取消添加打印机')
    },
    checkPrinterStatus() {
      // 这里可以检查打印机绑定状态
      // 暂时使用模拟数据
      this.isBound = false
      this.printerInfo = {
        name: '我的3D打印机',
        model: 'Ender-3 V2',
        isOnline: true
      }
    }
  },
  mounted() {
    this.checkPrinterStatus()
  }
}
</script>

<style scoped>
.printer-partner {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.partner-unbound {
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  padding: 40rpx;
}

.partner-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.partner-text {
  font-size: 28rpx;
  color: #666;
  margin: 0 20rpx;
}

.partner-bound {
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 30rpx;
}

.partner-info {
  display: flex;
  align-items: center;
}

.printer-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #f0f8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.printer-details {
  flex: 1;
}

.printer-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.printer-model {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.printer-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.printer-status.online {
  background-color: #e8f5e8;
  color: #52c41a;
}

.printer-status.offline {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.intro-entry {
  margin-top: 20rpx;
  border: 2rpx solid #007aff;
  border-radius: 12rpx;
  padding: 20rpx;
  background-color: #f0f8ff;
}

.intro-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.intro-text {
  font-size: 26rpx;
  color: #007aff;
  margin: 0 20rpx;
  font-weight: 500;
}
</style>