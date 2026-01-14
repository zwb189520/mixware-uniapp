export function initBluetooth() {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: resolve,
      fail: reject
    })
  })
}

export function startBluetoothScan() {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: resolve,
      fail: reject
    })
  })
}

export function stopBluetoothScan() {
  return new Promise((resolve, reject) => {
    uni.stopBluetoothDevicesDiscovery({
      success: resolve,
      fail: reject
    })
  })
}

export function getBluetoothDevices() {
  return new Promise((resolve, reject) => {
    uni.getBluetoothDevices({
      success: (res) => {
        const devices = res.devices || []
        console.log('所有蓝牙设备:', devices)
        
        // 显示所有设备，包括没有名称的
        const processedDevices = devices.map(device => ({
          ...device,
          displayName: device.name || device.localName || device.deviceId || '未知设备'
        }))
        
        // 过滤WG开头的设备
        const wgDevices = processedDevices.filter(device => {
          const name = device.name || device.localName || ''
          return name.toUpperCase().startsWith('WG')
        })
        
        console.log('WG设备:', wgDevices)
        resolve(wgDevices)
      },
      fail: reject
    })
  })
}

export function connectToDevice(deviceId) {
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId,
      success: resolve,
      fail: reject
    })
  })
}

export function getDeviceServices(deviceId) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceServices({
      deviceId,
      success: resolve,
      fail: reject
    })
  })
}

// 数据转换工具函数
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

function ab2str(buffer) {
  const bytes = new Uint8Array(buffer)
  let result = ''
  let i = 0
  while (i < bytes.length) {
    const byte = bytes[i]
    if (byte < 0x80) {
      result += String.fromCharCode(byte)
      i++
    } else if (byte < 0xE0) {
      const charCode = ((byte & 0x1F) << 6) | (bytes[i + 1] & 0x3F)
      result += String.fromCharCode(charCode)
      i += 2
    } else if (byte < 0xF0) {
      const charCode = ((byte & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F)
      result += String.fromCharCode(charCode)
      i += 3
    } else {
      const charCode = ((byte & 0x07) << 18) | ((bytes[i + 1] & 0x3F) << 12) | ((bytes[i + 2] & 0x3F) << 6) | (bytes[i + 3] & 0x3F)
      result += String.fromCharCode(charCode)
      i += 4
    }
  }
  return result
}

export function subscribeToWiFiList(deviceId) {
  return new Promise((resolve, reject) => {
    let accumulatedData = ''
    let lastReceiveTime = Date.now()
    let receiveTimeoutId = null
    let isResolved = false
    
    const onCharacteristicChange = (res) => {
      if (isResolved) return
      try {
        const wifiData = ab2str(res.value)
        console.log('收到WiFi数据:', wifiData)
        if (!wifiData) return
        accumulatedData += wifiData
        console.log('累计数据:', accumulatedData)
        lastReceiveTime = Date.now()
        if (!receiveTimeoutId) {
          receiveTimeoutId = setTimeout(checkReceiveComplete, 2000)
        }
      } catch (error) {
        console.log('解析异常:', error)
      }
    }
    
    const checkReceiveComplete = () => {
      if (isResolved) return
      if (Date.now() - lastReceiveTime >= 5000 && accumulatedData.length > 0) {
        isResolved = true
        try {
          let wifiList = []
          if (accumulatedData.includes('#split#') && accumulatedData.includes('#endsplit')) {
            const startIndex = accumulatedData.indexOf('#split#') + 7
            const endIndex = accumulatedData.indexOf('#endsplit')
            const wifiContent = accumulatedData.substring(startIndex, endIndex)
            const wifiItems = wifiContent.split('||')
            wifiList = wifiItems.filter(item => item).map(item => ({
              ssid: item,
              signal: 0
            }))
          } else if (accumulatedData.includes('#wifi#') && accumulatedData.includes('#end#')) {
            const startIndex = accumulatedData.indexOf('#wifi#') + 6
            const endIndex = accumulatedData.indexOf('#end#')
            const wifiContent = accumulatedData.substring(startIndex, endIndex)
            const wifiItems = wifiContent.split(',')
            wifiList = wifiItems.map(item => {
              const parts = item.split('||')
              return {
                ssid: parts[0] || '',
                signal: parts[1] ? parseInt(parts[1]) : 0
              }
            }).filter(item => item.ssid)
          }
          clearTimeout(receiveTimeoutId)
          resolve(wifiList)
        } catch (error) {
          clearTimeout(receiveTimeoutId)
          resolve([])
        }
      } else {
        receiveTimeoutId = setTimeout(checkReceiveComplete, 500)
      }
    }
    
    const timeoutId = setTimeout(() => {
      isResolved = true
      resolve([])
    }, 30000)

    uni.onBLECharacteristicValueChange(onCharacteristicChange)

    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      characteristicId: '00002AD3-0000-1000-8000-00805F9B34FB',
      state: true,
      success: () => {
        const command = '#scan#'
        const requestBuffer = new ArrayBuffer(command.length)
        const requestView = new Uint8Array(requestBuffer)
        for (let j = 0; j < command.length; j++) {
          requestView[j] = command.charCodeAt(j)
        }
        uni.writeBLECharacteristicValue({
          deviceId,
          serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
          characteristicId: '00002AD2-0000-1000-8000-00805F9B34FB',
          value: requestBuffer
        })
      },
      fail: (error) => {
        clearTimeout(timeoutId)
        isResolved = true
        reject(error)
      }
    })
  })
}

export function sendWiFiConfig(deviceId, serverUrl, ssid, password) {
  return new Promise((resolve, reject) => {
    const serverData = `#url#-r||${serverUrl}#end`
    const serverBuffer = new ArrayBuffer(serverData.length)
    const serverView = new Uint8Array(serverBuffer)
    for (let i = 0; i < serverData.length; i++) {
      serverView[i] = serverData.charCodeAt(i)
    }
    
    uni.writeBLECharacteristicValue({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      characteristicId: '00002AD2-0000-1000-8000-00805F9B34FB',
      value: serverBuffer,
      success: () => {
        const wifiData = `#start#${ssid}||${password}#end`
        const wifiBuffer = new ArrayBuffer(wifiData.length)
        const wifiView = new Uint8Array(wifiBuffer)
        for (let i = 0; i < wifiData.length; i++) {
          wifiView[i] = wifiData.charCodeAt(i)
        }
        uni.writeBLECharacteristicValue({
          deviceId,
          serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
          characteristicId: '00002AD2-0000-1000-8000-00805F9B34FB',
          value: wifiBuffer,
          success: resolve,
          fail: reject
        })
      },
      fail: reject
    })
  })
}

export function subscribeToConfigResult(deviceId) {
  return new Promise((resolve, reject) => {
    uni.onBLECharacteristicValueChange((res) => {
      try {
        const resultData = ab2str(res.value)
        if (resultData.includes('success') || resultData.includes('成功')) {
          resolve({ success: true, message: '配网成功' })
        } else if (resultData.includes('fail') || resultData.includes('失败')) {
          resolve({ success: false, message: resultData || '配网失败' })
        }
      } catch (error) {}
    })
    
    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
      characteristicId: '00002AD4-0000-1000-8000-00805F9B34FB',
      state: true,
      success: () => {},
      fail: reject
    })
  })
}