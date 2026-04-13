import { BleLib } from '@/uni_modules/android-ble'

interface BleResult {
  type: number
  message?: string
  data?: {
    data: number[]
  }
}

interface ConfigResult {
  success: boolean
  message: string
}

let _bleLib: any = null
function getBleLib(): any {
  if (!_bleLib) {
    _bleLib = new BleLib()
  }
  return _bleLib
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function sendDataByPlugin(lib: any, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const hexStr = lib.string2ByteStrWithCharset(text, 'utf-8')
    console.log('[BLE插件] 发送数据:', text, '-> HEX:', hexStr)
    lib.sendData(
      {
        serviceId: lib.getSericUUID(),
        characteristicId: lib.getwriteUUID(),
        fenbao: true,
        hexStrData: hexStr
      },
      (result: BleResult) => {
        console.log('[BLE插件] sendData结果:', result)
        if (result.type === 0) {
          resolve()
        } else {
          reject(new Error(`发送失败: type=${result.type} ${result.message}`))
        }
      }
    )
  })
}

export function sendWiFiConfigByPlugin(deviceId: string, serverUrl: string, ssid: string, password: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const lib = getBleLib()

    console.log('[BLE插件] 连接设备:', deviceId)
    const connectOk = await new Promise<boolean>(res => {
      lib.connect(deviceId, false, (result: BleResult) => {
        console.log('[BLE插件] 连接结果:', result)
        res(result.type === 0 || result.type === 10004)
      })
    })
    if (!connectOk) {
      reject(new Error('[BLE插件] 连接失败'))
      return
    }

    console.log('[BLE插件] 扫描服务...')
    await new Promise<void>(res => {
      lib.scanServices((result: BleResult) => {
        console.log('[BLE插件] 扫描服务完成')
        lib.setSelectUUID(0)
        res()
      })
    })

    await new Promise<void>(res => {
      lib.setMtu(512, (result: BleResult) => {
        console.log('[BLE插件] MTU结果:', result)
        res()
      })
    })

    console.log('[BLE插件] 服务UUID:', lib.getSericUUID())
    console.log('[BLE插件] 写入UUID:', lib.getwriteUUID())
    console.log('[BLE插件] 通知UUID:', lib.getNotityUUID())

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
    } catch (err: any) {
      console.error('[BLE插件] 发送失败:', err)
      reject(new Error(`[BLE插件] 发送失败: ${err.message}`))
    }
  })
}

export function subscribeToConfigResultByPlugin(deviceId: string): Promise<ConfigResult> {
  return new Promise(resolve => {
    const lib = getBleLib()
    let isResolved = false
    let timeoutId: any

    const cleanup = (): void => {
      if (timeoutId) clearTimeout(timeoutId)
      try {
        lib.onNotityBleData(lib.getSericUUID(), lib.getNotityUUID(), false, () => {})
      } catch {
        console.warn('[BLE插件] 取消通知监听失败')
      }
    }

    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        cleanup()
        resolve({ success: false, message: '配网结果等待超时' })
      }
    }, 60000)

    lib.onNotityBleData(lib.getSericUUID(), lib.getNotityUUID(), true, (result: BleResult) => {
      if (isResolved) return
      if (result.type === 1000) {
        console.log('[BLE插件] 结果通知订阅成功')
        return
      }
      if (result.type !== 0 || !result.data) return

      const dataBytes = result.data.data || []
      const hexStr = dataBytes.map((b: number) => b.toString(16).padStart(2, '0')).join('')
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
    })
  })
}

export function closePluginBle(): void {
  try {
    getBleLib().close()
    console.log('[BLE插件] 已断开连接')
  } catch {
    console.warn('[BLE插件] 断开连接失败')
  }
}
