<!-- const resultPromise = subscribeToConfigResult(this.bluetoothDeviceId) -->
<!-- await sendWiFiConfig(this.bluetoothDeviceId, serverUrl, this.selectedWiFi, this.wifiPassword) -->
<!-- this._closeBluetooth() -->
<template>
  <view class="add-device-page">
    <safe-area />
    <custom-navbar :title="texts.title || '添加设备'" @back="handleBack" />
    <view class="page-content">
      <view class="wifi-title-section">
        <text class="wifi-title">{{ texts.connectWiFi || '连接WiFi' }}</text>
      </view>
      <view class="wifi-select-section" @click="handleSelectWiFi" :class="{ 'disabled': isScanning && scanStatus === 'scanning' }">
        <text class="select-label">{{ selectedWiFi || (texts.selectWiFi || '请选择WiFi') }}</text>
        <text class="select-action">{{ 
          scanStatus === 'scanning' ? (texts.scanning || '扫描中...') : 
          scanStatus === 'stopped' ? (texts.stopped || '已停止，点击重新扫描') :
          scanStatus === 'failed' ? (texts.failed || '获取失败，点击重试') : 
          wifiList.length > 0 ? (texts.select || '选择') : (texts.noWiFiRetry || '无WiFi，点击重试')
        }}</text>
      </view>
      <view v-if="isScanning && scanStatus === 'scanning'" class="stop-scan-section" @click="stopScan">
        <text class="stop-scan-text">{{ texts.stopScan || '停止扫描' }}</text>
      </view>
      <view class="password-section">
        <input 
          class="password-input" 
          :type="showPassword ? 'text' : 'password'"
          :placeholder="texts.enterWiFiPassword || '请输入WiFi密码'"
          v-model="wifiPassword"
        />
        <view class="eye-icon" @click="togglePassword">
          <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <view class="tips-section">
        <text class="tips-text">{{ texts.tips || '请确保连接的家庭WiFi网络为2.4G网络' }}</text>
      </view>
      <view class="button-section">
        <button class="next-button" @click="handleNext" :disabled="isConnecting">{{ isConnecting ? (texts.networking || '配网中...') : (texts.nextStep || '下一步') }}</button>
      </view>
    </view>
    <WiFiSelectorModal 
      :visible="showWiFiList" 
      :wifiList="wifiList"
      @close="handleWiFiListClose"
      @select="handleWiFiSelected"
      @refresh="handleWiFiRefresh"
    />
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import WiFiSelectorModal from './components/WiFiSelectorModal.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'
import { connectToDevice, subscribeToWiFiList, sendWiFiConfig, subscribeToConfigResult, initWifi, getWifiList } from '@/utils/bluetooth.ts'
// import { sendWiFiConfigByPlugin, subscribeToConfigResultByPlugin, closePluginBle } from '@/utils/bluetooth-ble.ts'

export default {
  name: 'AddDevice',
  components: {
    CustomNavbar,
    WiFiSelectorModal,
    SafeArea
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.addDevice || {}
    }
  },
  data() {
    return {
      wifiPassword: '',
      showPassword: false,
      selectedWiFi: '',
      showWiFiList: false,
      bluetoothDeviceId: '',
      wifiList: [],
      isConnecting: false,
      isScanning: true,
      scanStatus: 'scanning' // scanning, stopped, failed, success
    }
  },
  async onLoad(options) {
    this.bluetoothDeviceId = options.deviceId || ''
    if (this.bluetoothDeviceId) {
      await this.loadWiFiList()
    } else {
      // 如果没有蓝牙设备ID，直接获取手机的WiFi列表
      await this.loadPhoneWiFiList()
    }
  },
  onUnload() {
    // 页面卸载时断开蓝牙连接
    this._closeBluetooth()
  },
  methods: {
    // 断开蓝牙连接（统一方法）
    _closeBluetooth() {
      if (this.bluetoothDeviceId) {
        console.log('断开蓝牙连接:', this.bluetoothDeviceId)
        uni.closeBLEConnection({
          deviceId: this.bluetoothDeviceId,
          success: () => {
            console.log('蓝牙连接已断开')
            this.bluetoothDeviceId = '' // 清空ID，防止重复断开
          },
          fail: (err) => {
            if (err.code !== 10004) { // 10004=no connection，已断开可忽略
              console.log('断开蓝牙连接失败:', err)
            }
          }
        })
      }
    },

    // 根据模式重新扫描WiFi
    reloadWiFiList() {
      if (this.bluetoothDeviceId) {
        this.loadWiFiList()
      } else {
        this.loadPhoneWiFiList()
      }
    },

    async loadWiFiList() {
    this.isScanning = true
    this.scanStatus = 'scanning'
    console.log('开始获取WiFi列表，设备ID:', this.bluetoothDeviceId)
    uni.showLoading({ title: this.texts.gettingWiFiList || '获取WiFi列表...' })
    try {
      // 第1步：清除所有 BLE 特征値监听，避免旧监听干扰
      console.log('清除BLE特征値监听...')
      try { uni.offBLECharacteristicValueChange() } catch (e) {}

      // 第2步：先显式断开 BLE 连接，让设备端释放连接
      if (this.bluetoothDeviceId) {
        console.log('断开旧BLE连接...')
        await new Promise((resolve) => {
          uni.closeBLEConnection({
            deviceId: this.bluetoothDeviceId,
            success: () => { console.log('旧BLE连接已断开'); resolve() },
            fail: () => { console.log('旧BLE连接断开失败（忽略）'); resolve() }
          })
        })
        // 等待设备端释放连接
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // 第3步：关闭蓝牙适配器，确保完全重置
      console.log('关闭蓝牙适配器...')
      await new Promise((resolve) => {
        uni.closeBluetoothAdapter({
          success: () => {
            console.log('蓝牙适配器已关闭')
            resolve()
          },
          fail: () => {
            console.log('蓝牙适配器未打开，忽略')
            resolve()
          }
        })
      })
      // 等待适配器完全关闭
      await new Promise(resolve => setTimeout(resolve, 500))

      const { initBluetooth } = await import('@/utils/bluetooth.ts')
      console.log('正在初始化蓝牙适配器...')
      await initBluetooth()
      console.log('蓝牙适配器初始化成功')
      
      console.log('正在连接蓝牙设备...')
      await connectToDevice(this.bluetoothDeviceId)
      console.log('蓝牙设备连接成功')
        
        // 获取设备服务信息
        console.log('正在获取设备服务...')
        const services = await this.getDeviceServices(this.bluetoothDeviceId)
        console.log('设备服务列表:', services)
        
        console.log('正在订阅WiFi列表...')
        console.log('设备ID:', this.bluetoothDeviceId)
        console.log('期望数据格式: #wifi#ssid1||signal1,ssid2||signal2#end#')
        
        const wifiList = await subscribeToWiFiList(this.bluetoothDeviceId)
        console.log('获取到的WiFi列表:', wifiList)
        
        this.wifiList = wifiList
        this.isScanning = false
        uni.hideLoading()
        
        if (wifiList.length === 0) {
          console.log('WiFi列表为空')
          this.scanStatus = 'success'
          uni.showToast({
            title: this.texts.noWiFiFound || '未发现可用的WiFi，请检查路由器是否开启',
            icon: 'none'
          })
        } else {
          console.log('成功获取到', wifiList.length, '个WiFi')
          this.scanStatus = 'success'
          // 自动弹出WiFi列表
          this.showWiFiList = true
        }
      } catch (error) {
        console.log('获取WiFi列表失败:', error)
        this.isScanning = false
        this.scanStatus = 'failed'
        uni.hideLoading()
        
        uni.showToast({
          title: this.texts.searchWiFiFailed || '未能搜索到周边WiFi，请重试',
          icon: 'none'
        })
      }
    },
    
    // 加载手机WiFi列表
    async loadPhoneWiFiList() {
      this.isScanning = true
      this.scanStatus = 'scanning'
      console.log('开始获取手机WiFi列表')
      uni.showLoading({ title: this.texts.gettingWiFiList || '获取WiFi列表...' })
      
      try {
        console.log('正在初始化WiFi模块...')
        await initWifi()
        console.log('WiFi模块初始化成功')
        
        console.log('正在获取WiFi列表...')
        const wifiList = await getWifiList()
        console.log('获取到的WiFi列表:', wifiList)
        
        // 转换WiFi列表格式以匹配现有UI
        this.wifiList = wifiList.map(wifi => ({
          ssid: wifi.SSID || wifi.name || 'Unknown',
          signal: wifi.signalStrength || 0
        }))
        
        this.isScanning = false
        uni.hideLoading()
        
        if (this.wifiList.length === 0) {
          console.log('WiFi列表为空')
          this.scanStatus = 'success' // 扫描成功但列表为空
          uni.showToast({
            title: '未发现可用的WiFi，请检查路由器是否开启',
            icon: 'none'
          })
        } else {
          console.log('成功获取到', this.wifiList.length, '个WiFi')
          this.scanStatus = 'success'
        }
      } catch (error) {
        console.log('获取WiFi列表失败:', error)
        this.isScanning = false
        this.scanStatus = 'failed'
        uni.hideLoading()
        uni.showToast({
          title: '未能搜索到周边WiFi，请重试',
          icon: 'none'
        })
      }
    },
    handleBack() {
      uni.navigateBack()
    },
    stopScan() {
      console.log('用户手动停止扫描')
      this.isScanning = false
      this.scanStatus = 'stopped'
      uni.hideLoading()
      uni.showToast({
        title: this.texts.scanStopped || '扫描已停止',
        icon: 'none'
      })
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    handleSelectWiFi() {
      if (this.isScanning) {
        return // 扫描中不能点击
      }

      // 如果扫描失败/停止，或WiFi列表为空，重新扫描
      if (this.scanStatus === 'failed' || this.scanStatus === 'stopped' || this.wifiList.length === 0) {
        this.reloadWiFiList()
        return
      }

      // 有WiFi列表时，显示选择弹窗
      if (this.wifiList.length > 0) {
        this.showWiFiList = true
      }
    },
    handleWiFiListClose() {
      this.showWiFiList = false
    },
    handleWiFiSelected(wifiName) {
      this.selectedWiFi = wifiName
      this.showWiFiList = false
    },
    handleWiFiRefresh() {
      this.showWiFiList = false
      this.reloadWiFiList()
    },

    
    // 获取设备服务
    getDeviceServices(deviceId) {
      return new Promise((resolve, reject) => {
        uni.getBLEDeviceServices({
          deviceId,
          success: (res) => {
            console.log('获取服务成功:', res)
            resolve(res.services || [])
          },
          fail: (error) => {
            console.log('获取服务失败:', error)
            reject(error)
          }
        })
      })
    },
    
    // 获取设备特征值
    getDeviceCharacteristics(deviceId, serviceId) {
      return new Promise((resolve, reject) => {
        uni.getBLEDeviceCharacteristics({
          deviceId,
          serviceId,
          success: (res) => {
            console.log('获取特征值成功:', res)
            const characteristics = (res.characteristics || []).map(char => ({
              uuid: char.uuid,
              shortUuid: char.uuid.substring(4, 8),
              read: char.properties?.read || false,
              write: char.properties?.write || false,
              notify: char.properties?.notify || false,
              indicate: char.properties?.indicate || false
            }))
            console.log('特征值详细信息:')
            characteristics.forEach((char, index) => {
              console.log(`  ${index + 1}. ${char.shortUuid} (${char.uuid})`)
              console.log(`     read: ${char.read}, write: ${char.write}, notify: ${char.notify}, indicate: ${char.indicate}`)
            })
            resolve(characteristics)
          },
          fail: (error) => {
            console.log('获取特征值失败:', error)
            reject(error)
          }
        })
      })
    },
    
    async handleNext() {
      if (!this.selectedWiFi) {
        uni.showToast({
          title: this.texts.pleaseSelectWiFi || '请选择WiFi',
          icon: 'none'
        })
        return
      }
      
      if (!this.wifiPassword) {
        uni.showToast({
          title: this.texts.pleaseEnterPassword || '请输入WiFi密码',
          icon: 'none'
        })
        return
      }
      
      this.isConnecting = true
      uni.showLoading({ title: this.texts.networking || '配网中...' })
      
      try {
        console.log('=== 开始配网流程 ===')
        
        // 根据是否有蓝牙设备ID判断配网模式
        if (this.bluetoothDeviceId) {
          // 蓝牙配网模式
          console.log('使用蓝牙配网模式，设备ID:', this.bluetoothDeviceId)

          // 检查蓝牙连接状态，如果已断开则重新连接
          uni.showLoading({ title: this.texts.checkingDevice || '检查设备连接...' })
          try {
            await connectToDevice(this.bluetoothDeviceId)
            console.log('蓝牙设备连接/已连接')
          } catch (connErr) {
            const msg = connErr.errMsg || connErr.message || ''
            if (!msg.includes('already connect') && !msg.includes('connected')) {
              console.log('蓝牙重连失败，尝试重新初始化...', connErr)
              try { uni.offBLECharacteristicValueChange() } catch (e) {}
              await new Promise(resolve => {
                uni.closeBluetoothAdapter({ success: resolve, fail: resolve })
              })
              await new Promise(resolve => setTimeout(resolve, 500))
              const { initBluetooth } = await import('@/utils/bluetooth.ts')
              await initBluetooth()
              try {
                await connectToDevice(this.bluetoothDeviceId)
                console.log('蓝牙重置后重连成功')
              } catch (retryErr) {
                uni.hideLoading()
                this.isConnecting = false
                uni.showToast({ title: this.texts.deviceConnectFailed || '设备连接失败，请靠近设备后重试', icon: 'none' })
                return
              }
            }
          }
          uni.showLoading({ title: this.texts.networking || '配网中...' })

          // 先订阅配网结果，在发送命令之前
          console.log('1. 开始订阅配网结果...')
          const resultPromise = subscribeToConfigResult(this.bluetoothDeviceId)
          // const resultPromise = subscribeToConfigResultByPlugin(this.bluetoothDeviceId)
          // 发送服务器URL + WiFi 配置
          const serverUrl = 'http://app.mixwarebot.cn/api/iot/auth'
          console.log('2. 准备发送服务器URL:', serverUrl)

          await sendWiFiConfig(this.bluetoothDeviceId, serverUrl, this.selectedWiFi, this.wifiPassword)
          // await sendWiFiConfigByPlugin(this.bluetoothDeviceId, serverUrl, this.selectedWiFi, this.wifiPassword)
          console.log('3. 服务器URL和WiFi配置发送成功')
          
          // 等待配网结果
          const result = await resultPromise
          console.log('4. 配网结果:', result)
          
          uni.hideLoading()
          this.isConnecting = false

          if (result.success) {
            console.log('5. 配网成功，断开蓝牙并跳转到成功页面')
            // 先保存 printerId，再断开蓝牙（断开后 bluetoothDeviceId 会被清空）
            const printerId = this.bluetoothDeviceId
            this._closeBluetooth()
            // closePluginBle()
            uni.showToast({
              title: this.texts.networkConfigSuccess || '配网成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateTo({
                url: `/pagesMember/printer/deviceSuccess/deviceSuccess?printerId=${printerId}`
              })
            }, 1000)
          } else {
            console.log('5. 配网失败:', result.message)
            // 密码错误时设备不回复会导致超时，两种情况提示相同
            const isTimeout = result.message && result.message.includes('超时')
            uni.showModal({
              title: this.texts.networkConfigFailed || '配网失败',
              content: isTimeout
                ? (this.texts.connectionTimeout || '连接超时，请检查：\n1. WiFi密码是否正确\n2. 设备是否已上电\n3. 路由器是否为2.4G网络')
                : (this.texts.networkConfigFailedRetry || '配网失败，请检查WiFi密码是否正确后重试'),
              showCancel: false,
              confirmText: this.texts.confirm || '我知道了',
              confirmColor: '#FF5A00'
            })
          }
        } else {
          // 手机WiFi直连模式
          console.log('使用手机WiFi直连模式')
          uni.connectWifi({
            SSID: this.selectedWiFi,
            password: this.wifiPassword,
            success: () => {
              console.log('WiFi连接成功')
              uni.hideLoading()
              this.isConnecting = false
              uni.showToast({
                title: this.texts.wifiConnectSuccess || 'WiFi连接成功',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pagesMember/printer/deviceSuccess/deviceSuccess'
                })
              }, 1000)
            },
            fail: (err) => {
              console.log('WiFi连接失败:', err)
              uni.hideLoading()
              this.isConnecting = false
              uni.showToast({
                title: this.texts.wifiConnectFailed || 'WiFi连接失败，请检查密码后重试',
                icon: 'none'
              })
            }
          })
        }
      } catch (error) {
        console.log('配网流程出错:', error)
        uni.hideLoading()
        this.isConnecting = false
        uni.showToast({
          title: this.texts.networkConfigFailedRetry || '配网失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.add-device-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 40rpx;
}

.wifi-title-section {
  margin-bottom: 40rpx;
}

.wifi-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.wifi-select-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  margin-bottom: 10rpx;
}

.wifi-select-section.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.select-label {
  font-size: 32rpx;
  color: #333;
}

.select-action {
  font-size: 32rpx;
  color: #007aff;
}

.stop-scan-section {
  text-align: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.stop-scan-text {
  font-size: 28rpx;
  color: #ff9500;
  text-decoration: underline;
}

.password-section {
  position: relative;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-input {
  width: 100%;
  padding: 30rpx;
  padding-right: 80rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  border: none;
}

.eye-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
}

.tips-section {
  margin-bottom: 60rpx;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.button-section {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.next-button {
  width: 100%;
  padding: 20rpx 60rpx;
  background-color: #007aff;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 50rpx;
}

.next-button[disabled] {
  background-color: #999;
  opacity: 0.7;
}


</style>

