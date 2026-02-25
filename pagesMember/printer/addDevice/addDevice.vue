<template>
  <view class="add-device-page">
    <safe-area />
    <custom-navbar title="添加设备" @back="handleBack" />
    <view class="page-content">
      <view class="wifi-title-section">
        <text class="wifi-title">连接WiFi</text>
      </view>
      <view class="wifi-select-section" @click="handleSelectWiFi" :class="{ 'disabled': isScanning && scanStatus === 'scanning' }">
        <text class="select-label">{{ selectedWiFi || '请选择WiFi' }}</text>
        <text class="select-action">{{ 
          scanStatus === 'scanning' ? '扫描中...' : 
          scanStatus === 'failed' ? '获取失败，点击重试' : 
          wifiList.length > 0 ? '选择' : '无WiFi'
        }}</text>
      </view>
      <view v-if="isScanning && scanStatus === 'scanning'" class="stop-scan-section" @click="stopScan">
        <text class="stop-scan-text">停止扫描</text>
      </view>
      <view class="password-section">
        <input 
          class="password-input" 
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入WiFi密码"
          v-model="wifiPassword"
        />
        <view class="eye-icon" @click="togglePassword">
          <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <view class="tips-section">
        <text class="tips-text">请确保连接的家庭WiFi网络为2.4G网络</text>
      </view>
      <view class="button-section">
        <button class="next-button" @click="handleNext" :disabled="isConnecting">{{ isConnecting ? '配网中...' : '下一步' }}</button>
      </view>
    </view>
    <WiFiSelectorModal 
      :visible="showWiFiList" 
      :wifiList="wifiList"
      @close="handleWiFiListClose"
      @select="handleWiFiSelected"
    />
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import WiFiSelectorModal from './components/WiFiSelectorModal.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { connectToDevice, subscribeToWiFiList, sendWiFiConfig, subscribeToConfigResult, initWifi, getWifiList } from '@/utils/bluetooth.js'

export default {
  name: 'AddDevice',
  components: {
    CustomNavbar,
    WiFiSelectorModal,
    SafeArea
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
      scanStatus: 'scanning' // scanning, failed, success
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
  methods: {
    async loadWiFiList() {
    this.isScanning = true
    this.scanStatus = 'scanning'
    console.log('开始获取WiFi列表，设备ID:', this.bluetoothDeviceId)
    uni.showLoading({ title: '获取WiFi列表...' })
    try {
      const { initBluetooth } = await import('@/utils/bluetooth.js')
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
          this.scanStatus = 'success' // 扫描成功但列表为空
          uni.showToast({
            title: '未获取到WiFi列表',
            icon: 'none'
          })
        } else {
          console.log('成功获取到', wifiList.length, '个WiFi')
          this.scanStatus = 'success'
        }
      } catch (error) {
        console.log('获取WiFi列表失败:', error)
        this.isScanning = false
        this.scanStatus = 'failed'
        uni.hideLoading()
        
        if (error.message.includes('超时')) {
          uni.showToast({
            title: 'WiFi扫描超时，请重试',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: '获取WiFi列表失败: ' + error.message,
            icon: 'none'
          })
        }
      }
    },
    
    // 加载手机WiFi列表
    async loadPhoneWiFiList() {
      this.isScanning = true
      this.scanStatus = 'scanning'
      console.log('开始获取手机WiFi列表')
      uni.showLoading({ title: '获取WiFi列表...' })
      
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
            title: '未获取到WiFi列表',
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
        
        if (error.message.includes('超时')) {
          uni.showToast({
            title: 'WiFi扫描超时，请重试',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: '获取WiFi列表失败: ' + error.message,
            icon: 'none'
          })
        }
      }
    },
    handleBack() {
      uni.navigateBack()
    },
    stopScan() {
      console.log('用户手动停止扫描')
      this.isScanning = false
      this.scanStatus = 'failed'
      uni.hideLoading()
      uni.showToast({
        title: '扫描已停止',
        icon: 'none'
      })
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    handleSelectWiFi() {
      if (this.isScanning) {
        return  // 扫描中不能点击
      }
      
      // 如果扫描失败，点击可以重新扫描
      if (this.scanStatus === 'failed') {
        this.loadWiFiList()
        return
      }
      
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
          title: '请选择WiFi',
          icon: 'none'
        })
        return
      }
      
      if (!this.wifiPassword) {
        uni.showToast({
          title: '请输入WiFi密码',
          icon: 'none'
        })
        return
      }
      
      this.isConnecting = true
      uni.showLoading({ title: '配网中...' })
      
      try {
        console.log('=== 开始配网流程 ===')
        
        // 根据是否有蓝牙设备ID判断配网模式
        if (this.bluetoothDeviceId) {
          // 蓝牙配网模式
          console.log('使用蓝牙配网模式，设备ID:', this.bluetoothDeviceId)
          
          // 先订阅配网结果，在发送命令之前
          console.log('1. 开始订阅配网结果...')
          console.log('期望数据格式: #config#success 或 success 或 #config#fail 或 fail')
          const resultPromise = subscribeToConfigResult(this.bluetoothDeviceId)
          
          // 发送服务器IP - 严格按照你的格式
          const serverUrl = 'http://app.mixwarebot.cn/api/iot/auth'
          console.log('2. 准备发送服务器URL:', serverUrl)
          console.log('发送格式: #url#-r||' + serverUrl + '#end')
          
          await sendWiFiConfig(this.bluetoothDeviceId, serverUrl, this.selectedWiFi, this.wifiPassword)
          console.log('3. 服务器URL和WiFi配置发送成功')
          
          // 等待配网结果
          const result = await resultPromise
          console.log('4. 配网结果:', result)
          
          if (result.success) {
            console.log('5. 配网成功，跳转到成功页面')
            uni.showToast({
              title: '配网成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateTo({
                url: `/pagesMember/printer/deviceSuccess/deviceSuccess?printerId=${this.bluetoothDeviceId}`
              })
            }, 1000)
          } else {
            console.log('5. 配网失败:', result.message)
            uni.showToast({
              title: '配网失败: ' + (result.message || '未知错误'),
              icon: 'none'
            })
          }
        } else {
          // WiFi直连模式 - 可能需要不同的处理方式
          console.log('使用WiFi直连模式')
          
          // 连接到选定的WiFi
          try {
            await connectWifi({
              SSID: this.selectedWiFi,
              password: this.wifiPassword
            })
            
            uni.showToast({
              title: 'WiFi连接成功',
              icon: 'success'
            })
            
            // 连接成功后，跳转到设备发现页面或成功页面
            setTimeout(() => {
              uni.navigateTo({
                url: '/pagesMember/printer/deviceSuccess/deviceSuccess'
              })
            }, 1000)
          } catch (wifiError) {
            console.log('WiFi连接失败:', wifiError)
            uni.showToast({
              title: 'WiFi连接失败: ' + wifiError.message,
              icon: 'none'
            })
          }
        }
      } catch (error) {
        console.log('配网流程出错:', error)
        uni.hideLoading()
        this.isConnecting = false
        uni.showToast({
          title: '配网失败: ' + error.message,
          icon: 'none'
        })
      } finally {
        if (this.isConnecting) {
          uni.hideLoading()
          this.isConnecting = false
        }
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


</style>