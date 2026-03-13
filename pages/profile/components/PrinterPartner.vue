<template>
  <view class="printer-partner">
    <view class="partner-header">
      <view class="partner-title">
        <image src="/static/images/icon/printer.png" mode="aspectFit" class="partner-icon"></image>
        <text>{{ texts.printerPartner }}</text>
      </view>
      <view class="partner-actions">
        <button class="manage-btn" @click="goToDeviceManager">
          <text class="manage-btn-text">{{ texts.deviceManager || '设备管理' }}</text>
        </button>
      </view>
    </view>
    
    <view v-if="!isBound" class="partner-unbound" @click="handleFindPartner">
      <view class="partner-content">
        <uni-icons type="search" size="24" color="#666"></uni-icons>
        <text class="partner-text">{{ texts.findPartner }}</text>
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
            <image :src="printer.deviceImage || printer.image || '/static/images/3Dprinter.png'" mode="aspectFill" class="printer-img"></image>
          </view>
          <view class="printer-details">
            <view class="printer-name">{{ printer.deviceName || printer.name || texts.my3DPrinter }}</view>
            <view class="printer-status" :class="{ 'online': printer.deviceStatus === 1 || printer.status === 1, 'offline': printer.deviceStatus !== 1 && printer.status !== 1 }">
              {{ printer.deviceStatus === 1 || printer.status === 1 ? texts.online : texts.offline }}
            </view>
          </view>
          <view class="printer-actions">
            <view class="unbind-btn" @click.stop="handleUnbind(printer)">
              <uni-icons type="clear" size="16" color="#FF5A00"></uni-icons>
              <text class="unbind-text">{{ texts.unbind }}</text>
            </view>
            <uni-icons type="right" size="16" color="#999"></uni-icons>
          </view>
        </view>
      </view>
      
      <view class="add-printer-btn" @click="handleFindPartner">
        <uni-icons type="plus" size="20" color="#FF5A00"></uni-icons>
        <text class="add-text">{{ texts.addPrinter }}</text>
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
import { getDeviceList, setDefaultDevice, deleteDevice } from '@/api/devices.js'
import { useLanguageStore } from '@/stores'

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
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.profile
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
    this.checkPrinterStatus()
  },
  onShow() {
    this.checkPrinterStatus()
  },
  methods: {
    goToDeviceManager() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: '/pagesMember/printer/deviceManager/deviceManager'
      })
    },
    handleFindPartner() {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      this.showAddPrinter = true
    },
    handlePrinterIntro(printer) {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: `/pagesMember/printer/printerIntro/printerIntro?deviceId=${printer.id || printer.deviceId}`
      })
    },
    async handleUnbind(printer) {
      if (!uni.getStorageSync('isLoggedIn')) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      const deviceId = printer.id || printer.deviceId
      console.log('解绑设备ID:', deviceId, '设备信息:', printer)
      uni.showModal({
        title: this.texts.unbindConfirmation,
        content: this.texts.unbindContent,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await deleteDevice(deviceId)
              console.log('解绑结果:', result)
              uni.showToast({
                title: this.texts.unbindSuccess,
                icon: 'success'
              })
              await this.checkPrinterStatus()
            } catch (error) {
              console.error('解绑失败:', error)
              uni.showToast({
                title: this.texts.unbindFailed,
                icon: 'none'
              })
            }
          }
        }
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
  }
}
</script>

<style scoped>
.printer-partner {
  background: linear-gradient(135deg, #fff 0%, #FFF9F5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
}

.partner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.partner-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.partner-title .partner-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 10rpx;
  filter: drop-shadow(0 2rpx 8rpx rgba(255, 107, 53, 0.2));
}

.partner-title text {
  margin-left: 0;
}

.partner-actions {
  display: flex;
  align-items: center;
}

.manage-btn {
  padding: 6rpx 18rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 8rpx;
  border: none;
  margin: 0;
  min-height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.manage-btn:active {
  transform: scale(0.95);
}

.manage-btn-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
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
  border-radius: 12rpx;
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
  color: #FF5A00;
}

.printer-actions {
  display: flex;
  align-items: center;
  margin-left: 10rpx;
}

.unbind-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  background: #fff2f0;
}

.unbind-text {
  font-size: 22rpx;
  color: #FF5A00;
}

.intro-entry {
  border: 2rpx solid #FF5A00;
  border-radius: 16rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #FFF9F5 0%, #FFE8DC 100%);
  transition: all 0.3s ease;
}

.intro-entry:active {
  transform: scale(0.98);
}

.intro-content {
  display: flex;
  align-items: center;
}

.add-printer-btn {
  border: 2rpx dashed #FF5A00;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 20rpx;
  background: rgba(255, 107, 53, 0.03);
  transition: all 0.3s ease;
}

.add-printer-btn:active {
  background: rgba(255, 107, 53, 0.08);
  transform: scale(0.98);
}

.add-text {
  font-size: 28rpx;
  color: #FF5A00;
}
</style>