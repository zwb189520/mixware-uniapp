<template>
  <view v-if="visible" class="modal-overlay" @tap="handleCancel">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">{{ texts.title || '添加打印机' }}</text>
      </view>

      <view class="modal-body">
        <view v-if="loading" class="loading">
          <text>{{ texts.loading || '加载中...' }}</text>
        </view>
        <view v-else-if="deviceList.length === 0" class="empty"> </view>
        <view v-else>
          <view
            v-for="device in deviceList"
            :key="device.id || device.deviceId"
            class="printer-item"
          >
            <view class="printer-main" @tap="handleSelectPrinter(device.deviceId)">
              <image class="printer-icon" src="/static/images/3Dprinter.png" mode="aspectFit" />
              <view class="printer-info">
                <text class="printer-name">{{
                  device.deviceName || device.name || texts.unnamedDevice || '未命名设备'
                }}</text>
                <text class="printer-model">{{
                  device.deviceId || texts.unknownDevice || '未知设备'
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <button class="btn-cancel" @tap="handleCancel">{{ texts.cancel || '取消' }}</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { useLanguageStore } from '@/stores/index.ts'
import { deleteDevice, bindDevice, getDeviceList } from '@/api/devices.ts'
import type { Device } from '@/types/api'
import {
  initBluetooth,
  startBluetoothScan,
  stopBluetoothScan,
  getBluetoothDevices
} from '@/utils/bluetooth.ts'
import { checkAllPermissions } from '@/utils/permission.ts'

interface BluetoothDevice {
  id?: string
  name?: string
  deviceId: string
  deviceName?: string
  rssi?: number
  isBluetooth?: boolean
  displayName?: string
  RSSI?: number
}

interface DeviceItem {
  id?: string
  name?: string
  deviceId: string
  deviceName?: string
  rssi?: number
  isBluetooth: boolean
}

export default {
  name: 'AddPrinterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-printer', 'cancel'],
  data() {
    return {
      deviceList: [] as DeviceItem[],
      loading: false,
      bluetoothDevices: [] as BluetoothDevice[],
      scanType: 'bluetooth',
      scanTimer: null as any
    }
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore.texts.addPrinter || {}
    }
  },
  watch: {
    visible(newVal: boolean): void {
      if (newVal) {
        this.loadDeviceList()
      } else {
        this.stopBluetoothScan()
        this.deviceList = []
        this.bluetoothDevices = []
      }
    }
  },
  methods: {
    async loadDeviceList(): Promise<void> {
      this.loading = true
      try {
        await this.scanBluetoothDevices()
      } catch (error: unknown) {
        console.error('扫描设备失败:', error)
      } finally {
        this.loading = false
      }
    },

    async scanBluetoothDevices(): Promise<void> {
      console.log('扫描蓝牙设备...')

      try {
        const hasPermission = await checkAllPermissions()
        if (!hasPermission) {
          console.log('权限不足，无法扫描')
          return
        }

        await initBluetooth()
        await startBluetoothScan()

        uni.showLoading({
          title: this.texts.scanning || '扫描中...'
        })

        const startTime = Date.now()
        const checkDevices = async (): Promise<void> => {
          const boundDevices = await this.getBoundDevices()
          const devices = await getBluetoothDevices(boundDevices)
          const elapsed = Date.now() - startTime

          if (devices.length > 0 && elapsed >= 3000) {
            this.finishScan(devices)
          } else if (elapsed >= 40000) {
            this.finishScan(devices)
          } else {
            this.scanTimer = setTimeout(checkDevices, 1000)
          }
        }

        checkDevices()
      } catch (error: unknown) {
        uni.hideLoading()
        console.error('蓝牙扫描失败:', error)
        uni.showToast({
          title: this.texts.bluetoothScanFailed || '蓝牙扫描失败，请确认已开启蓝牙权限',
          icon: 'none'
        })
      }
    },

    async finishScan(devices: BluetoothDevice[]): Promise<void> {
      console.log('蓝牙扫描结束，结果:', devices)
      uni.hideLoading()

      const mappedDevices: DeviceItem[] = devices.map((device: BluetoothDevice) => ({
        id: device.deviceId,
        name: device.displayName || device.deviceName,
        deviceId: device.deviceId,
        deviceName: device.displayName || device.deviceName,
        rssi: device.RSSI || device.rssi,
        isBluetooth: true
      }))

      this.bluetoothDevices = mappedDevices
      this.deviceList = mappedDevices
      await stopBluetoothScan()

      if (mappedDevices.length === 0) {
        uni.showToast({
          title: this.texts.noBluetoothDevices || '未扫描到任何蓝牙设备',
          icon: 'none'
        })
      }
    },

    async getBoundDevices(): Promise<any[]> {
      try {
        const res = await getDeviceList()
        if (res.code === 1 || res.code === 200) {
          const data = res.data as Device[] | { records: Device[] }
          if (Array.isArray(data)) return data
          if (data && Array.isArray((data as { records: Device[] }).records)) return (data as { records: Device[] }).records
          return []
        } else {
          console.error('获取已绑定设备列表失败:', res)
          return []
        }
      } catch (error: unknown) {
        console.error('获取已绑定设备列表异常:', error)
        return []
      }
    },

    stopBluetoothScan(): void {
      try {
        if (this.scanTimer) {
          clearTimeout(this.scanTimer)
          this.scanTimer = null
        }
        uni.hideLoading()
        stopBluetoothScan()
        console.log('蓝牙扫描已停止')
      } catch (error: unknown) {
        console.log('停止扫描失败:', error)
      }
    },

    handleSelectPrinter(printerId: string): void {
      this.$emit('select-printer', printerId)
    },
    async handleBindDevice(deviceId: string): Promise<void> {
      this.$emit('select-printer', deviceId)
    },
    handleCancel(): void {
      this.stopBluetoothScan()
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  position: relative;
  text-align: center;
  margin-bottom: 40rpx;
}

.scan-type-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 40rpx;
}

.loading,
.empty {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.add-device-hint {
  margin-top: 20rpx;
  padding: 20rpx 40rpx;
  background-color: #ff5a00;
  border-radius: 50rpx;
  display: inline-block;
}

.hint-text {
  color: white;
  font-size: 28rpx;
}

.printer-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff9f5;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.printer-main {
  flex: 1;
  display: flex;
  align-items: center;
}

.printer-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 30rpx;
}

.printer-info {
  flex: 1;
}

.printer-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.printer-model {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.printer-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bind-btn,
.delete-btn {
  padding: 10rpx;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.btn-cancel {
  width: 100%;
  padding: 16rpx 40rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  border: none;
  background-color: #ff5a00;
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(255, 90, 0, 0.3);
}
</style>
