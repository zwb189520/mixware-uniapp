import { post, get } from './request'

/**
 * 发送停止命令
 * @param deviceId - 设备 ID
 */
export function sendStopCommand(deviceId: string): Promise<unknown> {
  return post(`/iot/sendStopCommand/${deviceId}`, {})
}

/**
 * 发送打印命令
 * @param deviceId - 设备 ID
 * @param modelId - 模型 ID
 * @param action - 操作类型
 * @param gcodeUrl - GCode文件URL
 * @param taskId - 任务 ID
 */
export function sendPrintCommand(deviceId: string, modelId: string, action: string, gcodeUrl: string, taskId: string): Promise<unknown> {
  return post('/iot/sendPrintCommand', { deviceId, modelId, action, gcodeUrl, taskId })
}

/**
 * 更新固件状态
 * @param deviceId - 设备 ID
 */
export function updateFirmwareStatus(deviceId: string): Promise<unknown> {
  return post('/iot/firmware/updateStatus', { deviceId })
}

/**
 * 检查固件版本
 * @param firmwareCheckRequestDTO - 固件检查请求数据
 */
export function checkFirmware(firmwareCheckRequestDTO: Record<string, unknown>): Promise<unknown> {
  return post('/iot/firmware/checkVersion', firmwareCheckRequestDTO)
}

/**
 * 验证设备凭证
 * @param deviceCredentialVerifyDTO - 设备凭证验证数据
 */
export function verifyCredential(deviceCredentialVerifyDTO: Record<string, unknown>): Promise<unknown> {
  return post('/iot/auth/verify', deviceCredentialVerifyDTO)
}

/**
 * 获取设备状态
 * @param deviceId - 设备 ID
 */
export function getDeviceStatus(deviceId: string): Promise<unknown> {
  return get(`/iot/status/${deviceId}`)
}

/**
 * 获取设备认证信息
 * @param deviceId - 设备 ID
 */
export function getDeviceAuth(deviceId: string): Promise<unknown> {
  return get('/iot/auth', { deviceId })
}

/**
 * 获取固件信息
 * @param deviceId - 设备 ID
 */
export function getFirmwareInfo(deviceId: string): Promise<unknown> {
  return get('/iot/firmware/info', { deviceId })
}

/**
 * 发送暂停命令
 * @param deviceId - 设备 ID
 */
export function sendPauseCommand(deviceId: string): Promise<unknown> {
  return post(`/iot/sendPauseCommand/${deviceId}`, {})
}

/**
 * 发送恢复命令
 * @param deviceId - 设备 ID
 */
export function sendResumeCommand(deviceId: string): Promise<unknown> {
  return post(`/iot/sendResumeCommand/${deviceId}`, {})
}

/**
 * 发送重启命令
 * @param deviceId - 设备 ID
 */
export function sendRestartCommand(deviceId: string): Promise<unknown> {
  return post(`/iot/sendRestartCommand/${deviceId}`, {})
}

/**
 * 建立SSE连接接收实时通知
 * @param onMessage - 收到消息时的回调函数
 * @param onError - 连接错误时的回调函数
 * @returns 返回EventSource实例
 */
export function connectSSE(onMessage?: (data: unknown) => void, onError?: (error: unknown) => void): EventSource {
  const BASE_URL = 'http://app.mixwarebot.cn:8080'
  const url = `${BASE_URL}/api/notify/sse/connect`
  console.log('建立SSE连接:', url)
  const eventSource = new EventSource(url)

  eventSource.onopen = () => {
    console.log('SSE连接已打开')
  }

  eventSource.onmessage = (event) => {
    console.log('SSE原始消息:', event.data)
    try {
      const data = JSON.parse(event.data)
      onMessage && onMessage(data)
    } catch (e) {
      onMessage && onMessage(event.data)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE连接错误:', error)
    onError && onError(error)
  }
  
  return eventSource
}
