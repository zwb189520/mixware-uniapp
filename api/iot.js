const BASE_URL = 'http://app.mixwarebot.cn/api'

export function sendPrintCommand(deviceId, modelId, action) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/iot/sendPrintCommand`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        deviceId: deviceId,
        modelId: modelId,
        action: action
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '发送打印命令失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}
