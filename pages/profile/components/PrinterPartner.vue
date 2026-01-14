<template>
  <view class="printer-partner">
    <view class="section-title">
      <text>打印机伙伴</text>
    </view>
    
    <view v-if="!isBound" class="partner-unbound" @click="handleFindPartner">
      <view class="partner-content">
        <uni-icons type="search" size="24" color="#666"></uni-icons>
        <text class="partner-text">寻找伙伴</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
    
    <view v-else class="intro-entry" @click="handlePrinterIntro">
      <view class="intro-content">
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
import AddPrinterModal from '@/components/add-printer-modal/add-printer-modal.vue'
import { getDefaultDevice, setDefaultDevice } from '@/api/devices.js'

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
          url: '/pagesMember/printer/printerIntro/printerIntro'
        })
      },
      async onSelectPrinter(printerId) {
        // 跳转到配网页面
        uni.navigateTo({
          url: `/pagesMember/printer/addDevice/addDevice?deviceId=${printerId}`
        })
        this.showAddPrinter = false
      },
    onCancelAddPrinter() {
      this.showAddPrinter = false
      console.log('用户取消添加打印机')
    },
    async checkPrinterStatus() {
      try {
        const res = await getDefaultDevice()
        if (res.data && (res.data.deviceId || res.data.id)) {
          this.isBound = true
          this.printerInfo = {
            name: res.data.deviceName || res.data.name || '我的3D打印机',
            model: res.data.deviceModel || res.data.model || '未知型号',
            isOnline: res.data.deviceStatus === 1 || res.data.status === 1
          }
        } else {
          this.isBound = false
        }
      } catch (error) {
        console.error('获取设备信息失败:', error)
        this.isBound = false
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
  margin: 20rpx;
  border-radius: 16rpx;
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
  border: 2rpx solid #007aff;
  border-radius: 12rpx;
  padding: 20rpx;
  background-color: #f0f8ff;
}

.intro-content {
  display: flex;
  align-items: center;
}
</style>