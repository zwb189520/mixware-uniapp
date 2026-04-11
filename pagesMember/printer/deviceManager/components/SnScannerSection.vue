<template>
  <view class="sn-scanner-section">
    <view class="section-title">
      <text>{{ texts.scanDevice || '扫码添加设备' }}</text>
    </view>

    <view class="scanner-content">
      <view class="scanner-info">
        <text class="info-text">{{ texts.scanQrCode || '扫描设备上的二维码或条形码' }}</text>
        <text class="info-desc">{{ texts.scanHint || '将设备SN码对准扫描框' }}</text>
      </view>

      <view class="scanner-actions">
        <button class="scan-btn primary" @click="handleScan">
          <uni-icons type="scan" size="24" color="#fff"></uni-icons>
          <text class="btn-text">{{ texts.startScan || '开始扫描' }}</text>
        </button>

        <button class="scan-btn secondary" @click="handleManualInput">
          <uni-icons type="plusempty" size="24" color="#2c3e50"></uni-icons>
          <text class="btn-text">{{ texts.manualInput || '手动输入' }}</text>
        </button>
      </view>
    </view>

    <view v-if="scanResult" class="scan-result">
      <view class="result-header">
        <text class="result-title">{{ texts.scanResult || '扫描结果' }}</text>
        <text class="result-clear" @click="clearResult">{{ texts.clear || '清除' }}</text>
      </view>

      <view class="result-content">
        <view class="result-item">
          <text class="result-label">{{ texts.snCode || 'SN码' }}:</text>
          <text class="result-value">{{ scanResult.snCode }}</text>
        </view>

        <view v-if="scanResult.deviceName" class="result-item">
          <text class="result-label">{{ texts.deviceName || '设备名称' }}:</text>
          <text class="result-value">{{ scanResult.deviceName }}</text>
        </view>

        <view v-if="scanResult.deviceType" class="result-item">
          <text class="result-label">{{ texts.deviceType || '设备类型' }}:</text>
          <text class="result-value">{{ getDeviceTypeText(scanResult.deviceType) }}</text>
        </view>
      </view>

      <view class="result-actions">
        <button class="result-btn add-btn" @click="handleAddDevice">
          <text class="btn-icon">➕</text>
          <text class="btn-text">{{ texts.addDevice || '添加设备' }}</text>
        </button>

        <button class="result-btn rescan-btn" @click="handleRescan">
          <text class="btn-icon">🔄</text>
          <text class="btn-text">{{ texts.rescan || '重新扫描' }}</text>
        </button>
      </view>
    </view>

    <ManualInputModal
      v-if="showManualInput"
      :visible="showManualInput"
      :title="texts.manualInput || '手动输入SN码'"
      :placeholder="texts.snCodePlaceholder || '请输入设备SN码'"
      :hint="texts.snCodeHint || 'SN码通常在设备背面或底部标签上'"
      :confirmText="texts.confirm || '确认'"
      :cancelText="texts.cancel || '取消'"
      @confirm="handleManualConfirm"
      @cancel="showManualInput = false"
      @update:visible="showManualInput = $event"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores'
import ManualInputModal from './ManualInputModal.vue'
// @ts-ignore
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

interface ScanResult {
  snCode: string
  deviceName?: string
  deviceType?: string
  deviceId?: string
}

interface ScanCodeResult {
  result: string
}

const emit = defineEmits<{
  (e: 'scan-success', result: ScanResult): void
  (e: 'add-device', result: ScanResult): void
  (e: 'scan-cleared'): void
}>()

const languageStore = useLanguageStore()
const scanResult = ref<ScanResult | null>(null)
const showManualInput = ref(false)
const isScanning = ref(false)

const texts = computed<Record<string, string>>(() => languageStore?.texts?.deviceManager || {})

onMounted(() => {
  languageStore.loadLanguage()
})

const handleScan = async () => {
  if (isScanning.value) return

  isScanning.value = true
  try {
    const result = await scanCode()
    if (result && result.result) {
      await processSnCode(result.result)
    }
  } catch (error) {
    console.error('扫描失败:', error)
    uni.showToast({
      title: texts.value.scanFailed || '扫描失败',
      icon: 'none'
    })
  } finally {
    isScanning.value = false
  }
}

const handleManualInput = () => {
  showManualInput.value = true
}

const processSnCode = async (snCode: string) => {
  if (!snCode) {
    uni.showToast({
      title: texts.value.snCodeRequired || 'SN码不能为空',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: texts.value.parsing || '解析中...' })
  try {
    const res = await uni.$http.post('/devices/parseSnCode', { snCode })
    uni.hideLoading()

    if (res.code === 0) {
      scanResult.value = {
        snCode: snCode,
        deviceName: '新设备',
        deviceType: '3D_PRINTER'
      }
      emit('scan-success', scanResult.value)
      uni.showToast({
        title: texts.value.parseSuccess || '解析成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.msg || texts.value.parseFailed || '解析失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('解析SN码失败:', error)
    uni.showToast({
      title: texts.value.parseFailed || '解析失败',
      icon: 'none'
    })
  }
}

const handleManualConfirm = async (snCode: string) => {
  await processSnCode(snCode)
}

const handleRescan = () => {
  clearResult()
  handleScan()
}

const handleAddDevice = async () => {
  if (!scanResult.value) return

  uni.showLoading({ title: texts.value.adding || '添加中...' })
  try {
    const res = await uni.$http.post('/devices/bind', {
      deviceId: scanResult.value.deviceId || '',
      snCode: scanResult.value.snCode
    })
    uni.hideLoading()

    if (res.code === 0) {
      uni.showToast({
        title: texts.value.addSuccess || '添加成功',
        icon: 'success'
      })
      emit('add-device', scanResult.value)
      clearResult()
    } else {
      uni.showToast({
        title: res.msg || texts.value.addFailed || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('添加设备失败:', error)
    uni.showToast({
      title: texts.value.addFailed || '添加失败',
      icon: 'none'
    })
  }
}

const clearResult = () => {
  scanResult.value = null
  emit('scan-cleared')
}

const scanCode = (): Promise<ScanCodeResult | null> => {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode', 'barCode'],
      success: (res: any) => {
        resolve(res as ScanCodeResult)
      },
      fail: (err: any) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          resolve(null)
        } else {
          reject(err)
        }
      }
    })
  })
}

const getDeviceTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    '3D_PRINTER': '3D打印机',
    LASER_CUTTER: '激光切割机',
    CNC_MACHINE: 'CNC机床',
    OTHER: '其他设备'
  }
  return typeMap[type] || '未知设备'
}
</script>

<style scoped>
.sn-scanner-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  padding: 32rpx;
  animation: slideUp 0.6s ease-out;
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

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: #ff5a00;
  border-radius: 4rpx;
  margin-right: 16rpx;
}

.scanner-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.scanner-info {
  text-align: center;
  padding: 24rpx;
  background: linear-gradient(135deg, rgba(255, 90, 0, 0.05) 0%, rgba(255, 140, 0, 0.05) 100%);
  border-radius: 20rpx;
  border: 2rpx dashed rgba(255, 90, 0, 0.3);
}

.info-text {
  display: block;
  font-size: 28rpx;
  color: #000;
  margin-bottom: 12rpx;
  font-weight: 600;
}

.info-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.scanner-actions {
  display: flex;
  gap: 16rpx;
}

.scan-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 80rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scan-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.scan-btn.primary {
  background: linear-gradient(135deg, #ff5a00, #ff8c00);
  color: #ffffff;
}

.scan-btn.secondary {
  background: #4a90e2;
  color: #fff;
}

.btn-text {
  font-size: 28rpx;
}

.scan-result {
  margin-top: 24rpx;
  padding: 24rpx;
  background: rgba(126, 211, 33, 0.05);
  border-radius: 24rpx;
  border: 2rpx solid rgba(126, 211, 33, 0.2);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #7ed321;
}

.result-clear {
  font-size: 26rpx;
  color: #95a5a6;
  font-weight: 600;
  padding: 8rpx 16rpx;
  background: rgba(149, 165, 166, 0.1);
  border-radius: 12rpx;
}

.result-clear:active {
  background: rgba(231, 76, 60, 0.2);
}

.result-content {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
}

.result-item {
  display: flex;
  margin-bottom: 16rpx;
  align-items: center;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  font-size: 26rpx;
  color: #666;
  min-width: 120rpx;
  margin-right: 16rpx;
  font-weight: 600;
}

.result-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.result-actions {
  display: flex;
  gap: 16rpx;
}

.result-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.result-btn:active {
  transform: scale(0.96);
}

.btn-icon {
  font-size: 32rpx;
}

.add-btn {
  background: linear-gradient(135deg, #ff5a00, #ff8c00);
  color: #fff;
}

.rescan-btn {
  background: #f5f5f7;
  color: #333;
}
</style>
