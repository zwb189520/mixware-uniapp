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
            <image
              :src="printer.deviceImage || printer.image || '/static/images/3Dprinter.png'"
              mode="aspectFill"
              class="printer-img"
            ></image>
          </view>
          <view class="printer-details">
            <view class="printer-name">{{
              printer.deviceName || printer.name || printer.deviceId || texts.my3DPrinter
            }}</view>
            <view
              class="printer-status"
              :class="{
                online: printer.deviceStatus === 1 || printer.status === 1,
                offline: printer.deviceStatus !== 1 && printer.status !== 1
              }"
            >
              {{
                printer.deviceStatus === 1 || printer.status === 1 ? texts.online : texts.offline
              }}
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

<script lang="ts">
import AddPrinterModal from '@/components/add-printer-modal/add-printer-modal.vue'
import { getDeviceList, setDefaultDevice, deleteDevice } from '@/api/devices'
import { closeBluetooth } from '@/utils/bluetooth'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface Printer {
  id?: string
  deviceId?: string
  deviceName?: string
  name?: string
  deviceImage?: string
  image?: string
  deviceStatus?: number
  status?: number
}

export default {
  name: 'PrinterPartner',
  components: {
    AddPrinterModal
  },
  data() {
    return {
      isBound: false as boolean,
      printerList: [] as Printer[],
      showAddPrinter: false as boolean
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    userStore(): any {
      return useUserStore()
    },
    texts(): any {
      return this.languageStore.texts.profile
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
    this.checkPrinterStatus()
  },
  onShow(): void {
    this.checkPrinterStatus()
  },
  methods: {
    goToDeviceManager(): void {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: '/pagesMember/printer/deviceManager/deviceManager'
      })
    },
    handleFindPartner(): void {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      this.showAddPrinter = true
    },
    handlePrinterIntro(printer: Printer): void {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      uni.navigateTo({
        url: `/pagesMember/printer/printerIntro/printerIntro?deviceId=${printer.id || printer.deviceId}`
      })
    },
    async handleUnbind(printer: Printer): Promise<void> {
      if (!this.userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pagesMember/auth/login/login' })
        return
      }
      const deviceId = printer.id || printer.deviceId
      console.log('解绑设备ID:', deviceId, '设备信息:', printer)
      uni.showModal({
        title: this.texts.unbindConfirmation,
        content: this.texts.unbindContent,
        success: async (res: any) => {
          if (res.confirm) {
            try {
              const result: any = await deleteDevice(deviceId as string)
              console.log('解绑结果:', result)

              try {
                await closeBluetooth()
                console.log('蓝牙适配器已关闭')

                await new Promise<void>(resolve => setTimeout(resolve, 500))

                await import('@/utils/bluetooth').then(module => module.initBluetooth())
                console.log('蓝牙适配器已重新初始化')
              } catch (bluetoothError: any) {
                console.error('重置蓝牙适配器失败:', bluetoothError)
              }

              uni.showToast({
                title: this.texts.unbindSuccess,
                icon: 'success'
              })
              await this.checkPrinterStatus()
            } catch (error: any) {
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
    async onSelectPrinter(printerId: string): Promise<void> {
      uni.navigateTo({
        url: `/pagesMember/printer/addDevice/addDevice?deviceId=${printerId}`
      })
      this.showAddPrinter = false
    },
    onCancelAddPrinter(): void {
      this.showAddPrinter = false
    },
    async checkPrinterStatus(): Promise<void> {
      try {
        const res: any = await getDeviceList()
        console.log('PrinterPartner getDeviceList 返回:', JSON.stringify(res, null, 2))
        if (res.data && res.data.records && res.data.records.length > 0) {
          this.isBound = true
          this.printerList = res.data.records
          console.log(
            '设备列表:',
            this.printerList.map((p: Printer) => ({
              id: p.id || p.deviceId,
              deviceStatus: p.deviceStatus,
              status: p.status
            }))
          )
        } else {
          this.isBound = false
          this.printerList = []
        }
      } catch (error: any) {
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
  background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
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
  background: linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%);
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
  color: #ff5a00;
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
  color: #ff5a00;
}

.intro-entry {
  border: 2rpx solid #ff5a00;
  border-radius: 16rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #fff9f5 0%, #ffe8dc 100%);
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
  border: 2rpx dashed #ff5a00;
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
  color: #ff5a00;
}
</style>
