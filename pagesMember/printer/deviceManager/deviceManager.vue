<template>
  <view class="device-manager-page">
    <view class="header-wrapper">
      <safe-area />
      <custom-navbar :title="texts.deviceManager || '设备管理'" @back="handleBack" />
    </view>
    
    <view class="content-container">
      <!-- 空状态 -->
      <view v-if="devices.length === 0 && !isLoading" class="empty-state">
        <view class="empty-icon">📱</view>
        <text class="empty-title">还没有设备</text>
        <text class="empty-desc">扫描设备二维码或手动输入SN码添加设备</text>
      </view>
      
      <!-- 设备列表 -->
      <view v-else class="device-list">
        <view 
          v-for="device in devices" 
          :key="device.deviceId"
          class="device-card"
          @click="handleDeviceClick(device)"
        >
          <view class="card-header">
            <view class="device-main-info">
              <image class="device-img" src="/static/images/3Dprinter.png" mode="aspectFit"></image>
              <view class="device-text-info">
                <text class="device-name">{{ device.deviceName || texts.unnamedDevice || '未命名设备' }}</text>
                <text v-if="device.deviceName !== device.deviceId" class="device-id">{{ device.deviceId }}</text>
              </view>
            </view>
            <view class="status-badge" :class="getStatusClass(device)">
              <view class="status-dot"></view>
              <text>{{ getDeviceStatusText(device) }}</text>
            </view>
          </view>
          
          <view class="card-actions">
            <button class="card-btn edit-btn" @click.stop="handleEditDevice(device)">
              <text>编辑</text>
            </button>
            <button class="card-btn delete-btn" @click.stop="handleDeleteDevice(device)">
              <text>删除</text>
            </button>
          </view>
        </view>
      </view>
      
      <!-- 扫码添加设备 -->
      <!-- <sn-scanner-section 
        @scan-success="handleScanSuccess"
        @add-device="handleCreateDevice"
        @scan-cleared="handleScanCleared"
      /> -->

      <!-- 添加打印机盒子 -->
      <view class="add-printer-btn" @click="handleShowAddPrinter">
        <uni-icons type="plus" size="20" color="#FF5A00"></uni-icons>
        <text class="add-text">添加打印机</text>
      </view>
    </view>
    
    <!-- 添加打印机弹框 -->
    <AddPrinterModal 
      :visible="showAddPrinter" 
      @select-printer="onSelectPrinter" 
      @cancel="onCancelAddPrinter" 
    />
    
    <!-- 编辑设备弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <view class="edit-modal" @click.stop>
        <view class="modal-decoration">
          <view class="decoration-circle decoration-circle-1"></view>
          <view class="decoration-circle decoration-circle-2"></view>
        </view>
        
        <view class="modal-header">
          <view class="header-left">
            <text class="modal-icon">✏️</text>
            <text class="modal-title">编辑设备</text>
          </view>
          <view class="modal-close" @click="closeEditModal">
            <text>×</text>
          </view>
        </view>
        
        <view class="modal-body">
          <view class="input-wrapper">
            <text class="input-icon">📝</text>
            <input 
              class="form-input"
              v-model="editForm.deviceName"
              placeholder="请输入设备名称"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeEditModal">
            <text>取消</text>
          </button>
          <button class="btn-confirm" @click="handleSaveDevice">
            <text>保存</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import SnScannerSection from './components/SnScannerSection.vue'
import AddPrinterModal from '@/components/add-printer-modal/add-printer-modal.vue'
import { getDeviceList, updateDeviceInfo, deleteDevice, parseSnCode } from '@/api/devices.js'
import { useLanguageStore } from '@/stores'

export default {
  name: 'DeviceManager',
  components: {
    CustomNavbar,
    SafeArea,
    SnScannerSection,
    AddPrinterModal
  },
  data() {
    return {
      devices: [],
      showEditModal: false,
      showAddPrinter: false,
      editForm: {
        id: '',
        deviceId: '',
        deviceName: ''
      },
      isLoading: false
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.deviceManager || {}
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
    this.loadDevices()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    
    async loadDevices() {
      this.isLoading = true
      try {
        const res = await getDeviceList()
        if (res.data && res.data.records) {
          this.devices = res.data.records
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    getDeviceStatusText(device) {
      const status = device.deviceStatus
      if (status === 1 || status === '1') {
        return '在线'
      }
      return '离线'
    },
    
    getStatusClass(device) {
      const status = device.deviceStatus
      if (status === 1 || status === '1') {
        return 'status-online'
      }
      return 'status-offline'
    },
    
    handleDeviceClick(device) {
      uni.navigateTo({
        url: `/pagesMember/printer/printerIntro/printerIntro?deviceId=${device.deviceId}`
      })
    },
    
    handleEditDevice(device) {
      console.log('编辑设备原始数据:', device)
      this.editForm = {
        id: device.id || device.deviceId, // 优先使用 id，如果没有则尝试 deviceId
        deviceId: device.deviceId,
        deviceName: device.deviceName || ''
      }
      this.showEditModal = true
    },
    
    async handleSaveDevice() {
      if (!this.editForm.deviceName.trim()) {
        uni.showToast({
          title: '请输入设备名称',
          icon: 'none'
        })
        return
      }
      
      const submitData = {
        deviceId: this.editForm.deviceId,
        deviceName: this.editForm.deviceName
      }
      console.log('尝试精简提交数据:', submitData)
      
      try {
        const res = await updateDeviceInfo(submitData)
        
        if (res.code === 1 || res.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.closeEditModal()
          this.loadDevices()
        } else {
          uni.showToast({
            title: res.msg || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存设备信息失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    async handleDeleteDevice(device) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备 "${device.deviceName || device.deviceId}" 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteDevice(device.deviceId)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadDevices()
            } catch (error) {
              console.error('删除设备失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    handleScanSuccess(scanData) {
      console.log('扫描成功:', scanData)
    },
    
    async handleCreateDevice(deviceData) {
      // 设备已在 SnScannerSection 中添加，这里只需刷新列表
      this.loadDevices()
    },
    
    handleScanCleared() {
      console.log('扫描清除')
    },
    
    handleShowAddPrinter() {
      this.showAddPrinter = true
    },
    
    onSelectPrinter(printerId) {
      // 跳转到配网页面
      uni.navigateTo({
        url: `/pagesMember/printer/addDevice/addDevice?deviceId=${printerId}`
      })
      this.showAddPrinter = false
    },
    
    onCancelAddPrinter() {
      this.showAddPrinter = false
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.editForm = {
        deviceId: '',
        deviceName: ''
      }
    }
  }
}
</script>

<style scoped>
.device-manager-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFF 100%);
  position: relative;
  overflow: hidden;
}

.device-manager-page::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -15%;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-bg 8s ease-in-out infinite;
}

.device-manager-page::after {
  content: '';
  position: absolute;
  bottom: -15%;
  left: -10%;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255, 142, 83, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-bg 10s ease-in-out infinite reverse;
}

@keyframes pulse-bg {
  0%, 100% { transform: scale(1) translateY(0); opacity: 0.5; }
  50% { transform: scale(1.2) translateY(-30rpx); opacity: 0.8; }
}

.header-wrapper {
  background: #fff;
  position: relative;
  z-index: 10;
}

.content-container {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  position: relative;
  z-index: 1;
}

.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.empty-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  display: block;
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.device-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.08);
  transition: all 0.3s ease;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.device-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.device-main-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.device-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background: #f8f8f8;
  flex-shrink: 0;
}

.device-text-info {
  flex: 1;
}

.device-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #000;
  margin-bottom: 12rpx;
}

.device-id {
  display: block;
  font-size: 24rpx;
  color: #999;
  font-family: 'Courier New', monospace;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-online {
  background: rgba(126, 211, 33, 0.1);
  color: #7ED321;
}

.status-offline {
  background: rgba(155, 155, 155, 0.1);
  color: #95a5a6;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-actions {
  display: flex;
  gap: 16rpx;
}

.card-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
}

.card-btn:active {
  transform: scale(0.95);
}

.edit-btn {
  background: #4A90E2;
  color: #fff;
}

.delete-btn {
  background: linear-gradient(135deg, #FF5A00, #FF8C00);
  color: #fff;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5rpx);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.edit-modal {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.3s ease-out;
  position: relative;
  padding-bottom: safe-area-inset-bottom;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 90, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%);
}

.decoration-circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -150rpx;
  right: -100rpx;
}

.decoration-circle-2 {
  width: 200rpx;
  height: 200rpx;
  top: -50rpx;
  left: -80rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.modal-icon {
  font-size: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #000;
}

.modal-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-size: 48rpx;
  color: #666;
}

.modal-close:active {
  transform: scale(0.9);
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 32rpx;
  position: relative;
  z-index: 1;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  background: #fafafa;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #FF5A00;
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(255, 90, 0, 0.1);
}

.input-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  border: none;
  background: transparent;
  outline: none;
  line-height: 1.5;
  min-height: 40rpx;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
  position: relative;
  z-index: 1;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:active {
  transform: scale(0.95);
  background: #eeeeee;
}

.btn-confirm {
  background: linear-gradient(135deg, #FF5A00, #FF8C00);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(255, 90, 0, 0.2);
}

.btn-confirm:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(255, 90, 0, 0.2);
}
</style>
