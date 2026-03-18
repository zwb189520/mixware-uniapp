// @ts-nocheck
// 使用 android-ble 插件实现配网，解决官方 API write 模式多手机兼容性问题
import { BleLib } from '@/uni_modules/android-ble'

// 插件实例（全局单例）
let _bleLib = null
function getBleLib() {
  if (!_bleLib) {
    _bleLib = new BleLib()
  }
  return _bleLib
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 通过插件发送一段字符串（UTF-8编码，自动分包，自动识别writeType）
function sendDataByPlugin(lib, text) {
  return new Promise((resolve, reject) => {
    const hexStr = lib.string2ByteStrWithCharset(text, 'utf-8')
    console.log('[BLE插件] 发送数据:', text, '-> HEX:', hexStr)
    lib.sendData({
      serviceId: lib.getSericUUID(),
      characteristicId: lib.getwriteUUID(),
      fenbao: true,       // 自动分包，每包20字节
      hexStrData: hexStr, // writeType不传 = 插件自动识别
    }, (result) => {
      console.log('[BLE插件] sendData结果:', result)
      if (result.type === 0) {
        resolve()
      } else {
        reject(new Error(`发送失败: type=${result.type} ${result.message}`))
      }
    })
  })
}

/**
 * 用 android-ble 插件发送WiFi配网数据
 * @param {string} deviceId  设备MAC地址，例如 E4:B0:63:84:F1:BA
 * @param {string} serverUrl 服务器URL
 * @param {string} ssid      WiFi名称
 * @param {string} password  WiFi密码
 */
export function sendWiFiConfigByPlugin(deviceId, serverUrl, ssid, password) {
  return new Promise(async (resolve, reject) => {
    const lib = getBleLib()

    // 1. 连接设备
    console.log('[BLE插件] 连接设备:', deviceId)
    const connectOk = await new Promise((res) => {
      lib.connect(deviceId, false, (result) => {
        console.log('[BLE插件] 连接结果:', result)
        // type=0 成功, type=10004 已连接，都算成功
        res(result.type === 0 || result.type === 10004)
      })
    })
    if (!connectOk) {
      reject(new Error('[BLE插件] 连接失败'))
      return
    }

    // 2. 扫描服务与特征值
    console.log('[BLE插件] 扫描服务...')
    await new Promise((res) => {
      lib.scanServices((result) => {
        console.log('[BLE插件] 扫描服务完成')
        lib.setSelectUUID(0) // 选择第一个可用服务
        res()
      })
    })

    // 3. 设置 MTU
    await new Promise((res) => {
      lib.setMtu(512, (result) => {
        console.log('[BLE插件] MTU结果:', result)
        res() // 失败也继续
      })
    })

    console.log('[BLE插件] 服务UUID:', lib.getSericUUID())
    console.log('[BLE插件] 写入UUID:', lib.getwriteUUID())
    console.log('[BLE插件] 通知UUID:', lib.getNotityUUID())

    // 4. 发送各段数据
    try {
      await sendDataByPlugin(lib, `#url#-r||${serverUrl}#end`)
      console.log('[BLE插件] 服务器URL发送成功')
      await delay(500)

      await sendDataByPlugin(lib, `#start#${ssid}||${password}#end`)
      console.log('[BLE插件] WiFi配置发送成功')
      await delay(500)

      await sendDataByPlugin(lib, '#config#start#end')
      console.log('[BLE插件] 配网触发命令发送成功')
      await delay(300)

      await sendDataByPlugin(lib, '#config#end#end')
      console.log('[BLE插件] 配网结束命令发送成功')

      resolve()
    } catch (err) {
      console.error('[BLE插件] 发送失败:', err)
      reject(new Error(`[BLE插件] 发送失败: ${err.message}`))
    }
  })
}

/**
 * 用 android-ble 插件订阅配网结果通知
 * @param {string} deviceId 设备MAC地址
 */
export function subscribeToConfigResultByPlugin(deviceId) {
  return new Promise((resolve) => {
    const lib = getBleLib()
    let isResolved = false
    let timeoutId

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId)
      try {
        lib.onNotityBleData(lib.getSericUUID(), lib.getNotityUUID(), false, () => {})
      } catch (e) {}
    }

    // 60秒超时
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        cleanup()
        resolve({ success: false, message: '配网结果等待超时' })
      }
    }, 60000)

    lib.onNotityBleData(
      lib.getSericUUID(),
      lib.getNotityUUID(),
      true,
      (result) => {
        if (isResolved) return
        if (result.type === 1000) {
          console.log('[BLE插件] 结果通知订阅成功')
          return
        }
        if (result.type !== 0 || !result.data) return

        // 将 number[] 解码为 UTF-8 字符串
        const dataBytes = result.data.data || []
        const hexStr = dataBytes.map(b => b.toString(16).padStart(2, '0')).join('')
        const text = lib.byte2StringWithCharset(hexStr, 'utf-8')
        console.log('[BLE插件] 收到配网数据:', text)

        if (text.includes('#config#success') || text.includes('connected') || text.includes('true')) {
          isResolved = true
          cleanup()
          resolve({ success: true, message: text })
        } else if (text.includes('#config#fail') || text.includes('fail') || text.includes('false')) {
          isResolved = true
          cleanup()
          resolve({ success: false, message: text })
        } else if (text.includes('#split#')) {
          console.log('[BLE插件] 收到WiFi列表，继续等待配网结果')
        } else {
          console.log('[BLE插件] 收到其他数据，继续等待:', text)
        }
      }
    )
  })
}

/**
 * 断开插件 BLE 连接
 */
export function closePluginBle() {
  try {
    getBleLib().close()
    console.log('[BLE插件] 已断开连接')
  } catch (e) {}
}