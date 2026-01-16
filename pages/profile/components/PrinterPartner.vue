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
    
    <view v-else>
      <view 
        v-for="(printer, index) in printerList" 
        :key="printer.id || printer.deviceId || index"
        class="intro-entry" 
        @click="handlePrinterIntro(printer)"
      >
        <view class="intro-content">
          <view class="printer-icon">
            <image v-if="printer.deviceImage || printer.image" :src="printer.deviceImage || printer.image" mode="aspectFill" class="printer-img"></image>
            <uni-icons v-else type="color" size="30" color="#007aff"></uni-icons>
          </view>
          <view class="printer-details">
            <view class="printer-name">{{ printer.deviceName || printer.name || '我的3D打印机' }}</view>
            <view class="printer-model">{{ printer.deviceModel || printer.model || '未知型号' }}</view>
            <view class="printer-status" :class="{ 'online': printer.deviceStatus === 1 || printer.status === 1, 'offline': printer.deviceStatus !== 1 && printer.status !== 1 }">
              {{ printer.deviceStatus === 1 || printer.status === 1 ? '在线' : '离线' }}
            </view>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
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
import { getDeviceList, setDefaultDevice } from '@/api/devices.js'

export default {
  name: 'PrinterPartner',
  components: {
    AddPrinterModal
  },
  data() {
    return {
      isBound: false,
      printerList: [],
      showAddPrinter: false
    }
  },
  methods: {
    handleFindPartner() {
      this.showAddPrinter = true
    },
    handlePrinterIntro(printer) {
        uni.navigateTo({
          url: `/pagesMember/printer/printerIntro/printerIntro?deviceId=${printer.id || printer.deviceId}`
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
        const res = await getDeviceList()
        if (res.data && res.data.records && res.data.records.length > 0) {
          this.isBound = true
          this.printerList = res.data.records
        } else {
          this.isBound = false
          this.printerList = []
        }
      } catch (error) {
        console.error('获取设备列表失败:', error)
        this.isBound = false
        this.printerList = []
      }
    }
  },
  mounted() {
    this.checkPrinterStatus()
  },
  onShow() {
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
  overflow: hidden;
}

.printer-img {
  width: 100%;
  height: 100%;
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