export function checkBluetoothPermission() {
  return new Promise((resolve, reject) => {
    // 检查是否是微信小程序环境
    if (typeof wx !== 'undefined' && wx.authorize) {
      wx.authorize({
        scope: 'scope.bluetooth',
        success: () => {
          resolve(true)
        },
        fail: (error) => {
          console.error('蓝牙权限申请失败:', error)
          wx.showModal({
            title: '需要蓝牙权限',
            content: '扫描打印机需要蓝牙权限，请在设置中开启',
            showCancel: false,
            success: () => {
              wx.openSetting({
                success: (res) => {
                  resolve(res.authSetting['scope.bluetooth'] || false)
                }
              })
            }
          })
          reject(error)
        }
      })
    } else {
      // 非微信环境，直接返回true
      console.log('非微信环境，跳过权限检查')
      resolve(true)
    }
  })
}

export function checkLocationPermission() {
  return new Promise((resolve, reject) => {
    // 检查是否是微信小程序环境
    if (typeof wx !== 'undefined' && wx.authorize) {
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          resolve(true)
        },
        fail: (error) => {
          console.error('位置权限申请失败:', error)
          wx.showModal({
            title: '需要位置权限',
            content: '蓝牙扫描需要位置权限，请在设置中开启',
            showCancel: false,
            success: () => {
              wx.openSetting({
                success: (res) => {
                  resolve(res.authSetting['scope.userLocation'] || false)
                }
              })
            }
          })
          reject(error)
        }
      })
    } else {
      // 非微信环境，直接返回true
      console.log('非微信环境，跳过位置权限检查')
      resolve(true)
    }
  })
}

export async function checkAllPermissions() {
  try {
    const bluetooth = await checkBluetoothPermission()
    const location = await checkLocationPermission()
    return bluetooth && location
  } catch (error) {
    console.error('权限检查失败:', error)
    return false
  }
}