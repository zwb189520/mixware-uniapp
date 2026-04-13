<template>
  <view class="info-section">
    <view class="info-item" @click="handleEditName">
      <text class="info-label">{{ texts.nameLabel || '名称' }}</text>
      <view class="value-wrapper">
        <text class="info-value">{{ printerName }}</text>
        <uni-icons type="compose" size="16" color="#999" class="edit-icon"></uni-icons>
      </view>
    </view>
    <view class="info-item" @click="handleEditRemark">
      <text class="info-label">{{ texts.remarkLabel || '备注' }}</text>
      <view class="value-wrapper">
        <text class="info-value">{{
          printerRemark || texts.clickToAddRemark || '点击添加备注'
        }}</text>
        <uni-icons type="compose" size="16" color="#999" class="edit-icon"></uni-icons>
      </view>
    </view>
    <view class="info-item">
      <text class="info-label">{{ texts.snLabel || 'SN' }}</text>
      <text class="info-value">{{ printerSN }}</text>
    </view>
    <!-- <view class="info-item">
      <text class="info-label">MAC</text>
      <text class="info-value">{{ printerMAC }}</text>
    </view>
    <view class="info-item">
      <text class="info-label">绑定时间</text>
      <text class="info-value">{{ bindTime }}</text>
    </view> -->
  </view>
</template>

<script lang="ts">
import { getDeviceInfo, updateDeviceInfo } from '@/api/devices.ts'
import { useLanguageStore } from '@/stores/index.ts'

interface DeviceInfoData {
  deviceName: string
  remark: string
  snCode: string
  deviceId: string
  bindTime: string
  status?: string
  model?: string
  firmware?: string
}

export default {
  name: 'PrinterInfoSection',
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      printerName: '' as string,
      printerRemark: '' as string,
      printerSN: '' as string,
      printerMAC: '' as string,
      bindTime: '-' as string
    }
  },
  computed: {
    languageStore(): any {
      return useLanguageStore()
    },
    texts(): any {
      return this.languageStore?.texts?.printerMoreIntro || {}
    }
  },
  watch: {
    deviceId: {
      handler(val: string): void {
        if (val) {
          this.loadDeviceInfo()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadDeviceInfo(): Promise<void> {
      if (!this.deviceId) return
      try {
        const res: any = await getDeviceInfo(this.deviceId)
        if (res.data) {
          const info: DeviceInfoData = res.data
          this.printerName = info.deviceName || this.texts.unnamedDevice || '未命名设备'
          this.printerRemark = info.remark || ''
          this.printerSN = info.snCode || '-'
          this.printerMAC = info.deviceId || '-'
          this.bindTime = info.bindTime ? info.bindTime.split('T')[0] : '-'
          this.$emit('device-info-loaded', info)
        }
      } catch (error) {
        console.error('获取设备信息失败:', error)
      }
    },
    handleEditName(): void {
      uni.showModal({
        title: this.texts.editDeviceName || '修改设备名称',
        editable: true,
        placeholderText: this.texts.enterNewDeviceName || '请输入新的设备名称',
        content: this.printerName,
        success: async (res: any) => {
          if (res.confirm && res.content.trim()) {
            const newName = res.content.trim()
            try {
              const updateData = {
                deviceId: this.deviceId,
                deviceName: newName
              }
              await updateDeviceInfo(updateData)
              this.printerName = newName
              uni.showToast({
                title: this.texts.editSuccess || '修改成功',
                icon: 'success'
              })
              this.loadDeviceInfo()
            } catch (error) {
              uni.showToast({
                title: this.texts.editFailed || '修改失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    handleEditRemark(): void {
      uni.showModal({
        title: this.texts.editRemark || '修改备注',
        editable: true,
        placeholderText: this.texts.enterDeviceRemark || '请输入设备备注',
        content: this.printerRemark,
        success: async (res: any) => {
          if (res.confirm) {
            const newRemark = res.content.trim()
            try {
              const updateData = {
                deviceId: this.deviceId,
                remark: newRemark
              }
              await updateDeviceInfo(updateData)
              this.printerRemark = newRemark
              uni.showToast({
                title: this.texts.editSuccess || '修改成功',
                icon: 'success'
              })
              this.loadDeviceInfo()
            } catch (error) {
              uni.showToast({
                title: this.texts.editFailed || '修改失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.info-section {
  background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255, 107, 53, 0.08);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 600;
}

.value-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.edit-icon {
  opacity: 0.6;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
