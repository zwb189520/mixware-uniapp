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