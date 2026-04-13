import { post, get } from './request'
import { API } from '../constants/index.ts'
import type { ApiResponse, Device } from '@/types/api'

interface FirmwareInfo {
  version: string
  buildDate?: string
  status?: string
  latestVersion?: string
  hasUpdate?: boolean
  downloadUrl?: string
}

interface DeviceCredential {
  deviceId: string
  credentialStatus?: string
  lastAuthTime?: string
}

export function sendStopCommand(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/iot/sendStopCommand/${deviceId}`, {})
}

export function sendPrintCommand(
  deviceId: string,
  modelId: string,
  action: string,
  gcodeUrl: string,
  taskId: string
): Promise<ApiResponse<null>> {
  return post<null>('/iot/sendPrintCommand', { deviceId, modelId, action, gcodeUrl, taskId })
}

export function updateFirmwareStatus(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>('/iot/firmware/updateStatus', { deviceId })
}

export function checkFirmware(firmwareCheckRequestDTO: Record<string, unknown>): Promise<ApiResponse<FirmwareInfo>> {
  return post<FirmwareInfo>('/iot/firmware/checkVersion', firmwareCheckRequestDTO)
}

export function verifyCredential(
  deviceCredentialVerifyDTO: Record<string, unknown>
): Promise<ApiResponse<DeviceCredential>> {
  return post<DeviceCredential>('/iot/auth/verify', deviceCredentialVerifyDTO)
}

export function getDeviceStatus(deviceId: string): Promise<ApiResponse<Device>> {
  return get<Device>(`/iot/status/${deviceId}`)
}

export function getDeviceAuth(deviceId: string): Promise<ApiResponse<DeviceCredential>> {
  return get<DeviceCredential>('/iot/auth', { deviceId })
}

export function getFirmwareInfo(deviceId: string): Promise<ApiResponse<FirmwareInfo>> {
  return get<FirmwareInfo>('/iot/firmware/info', { deviceId })
}

export function sendPauseCommand(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/iot/sendPauseCommand/${deviceId}`, {})
}

export function sendResumeCommand(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/iot/sendResumeCommand/${deviceId}`, {})
}

export function sendRestartCommand(deviceId: string): Promise<ApiResponse<null>> {
  return post<null>(`/iot/sendRestartCommand/${deviceId}`, {})
}

export function connectSSE(
  onMessage?: (data: unknown) => void,
  onError?: (error: unknown) => void
): EventSource {
  const url = `${API.BASE_URL}/notify/sse/connect`
  console.log('建立SSE连接:', url)
  const eventSource = new EventSource(url)

  eventSource.onopen = () => {
    console.log('SSE连接已打开')
  }

  eventSource.onmessage = event => {
    console.log('SSE原始消息:', event.data)
    try {
      const data = JSON.parse(event.data)
      onMessage && onMessage(data)
    } catch (e) {
      onMessage && onMessage(event.data)
    }
  }

  eventSource.onerror = error => {
    console.error('SSE连接错误:', error)
    onError && onError(error)
  }

  return eventSource
}
