import { API } from '../constants/index.ts'
import { useUserStore } from '../stores/modules/user.ts'
import type { RequestData, HttpMethod, ApiError } from '@/types/api'

type RequestTask = UniApp.RequestTask

interface RequestConfig {
  url: string
  method?: HttpMethod
  data?: RequestData | string
  header?: Record<string, string>
  timeout?: number
  sslVerify?: boolean
  signal?: AbortSignal
}

interface RequestWithRetryConfig extends RequestConfig {
  requestId?: string
  onAbort?: (requestId: string) => void
}

interface UniResponse {
  statusCode: number
  data: unknown
  header: Record<string, string>
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const objectToFormUrlencoded = (obj: RequestData): string => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key] ?? ''))}`)
    .join('&')
}

export const buildUrl = (url: string, baseUrl: string): string => {
  if (!url) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = url.startsWith('/') ? url : '/' + url
  return cleanBaseUrl + cleanPath
}

export const appendQueryParams = (url: string, data: RequestData = {}): string => {
  if (!data || Object.keys(data).length === 0) {
    return url
  }

  const queryString = Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`)
    .join('&')
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}

export const isValidUrl = (url: string): boolean => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export const getToken = (needToken = true): string => {
  if (!needToken) return ''

  try {
    const userStore = useUserStore()
    return userStore.token || ''
  } catch (e) {
    console.error('获取 token 失败:', e)
    return ''
  }
}

export const mergeHeaders = (
  token: string,
  customHeaders: Record<string, string> = {}
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const prepareRequestData = (
  method: HttpMethod,
  data: RequestData = {},
  contentType = 'application/json'
): RequestData | string => {
  const upperMethod = method.toUpperCase()

  if (upperMethod === 'GET') {
    return {}
  }

  if (contentType.includes('application/json')) {
    return typeof data === 'string' ? data : JSON.stringify(data || {})
  }

  return data
}

export const requestWithRetry = (
  requestConfig: RequestWithRetryConfig,
  retryCount = 0,
  pendingRequests?: Map<string, UniApp.RequestTask>
): Promise<UniResponse> => {
  return new Promise((resolve, reject) => {
    const { signal, requestId, onAbort } = requestConfig

    if (signal?.aborted) {
      reject(new Error('Request aborted'))
      return
    }

    const requestTask = (uni.request as (options: any) => any)({
      url: requestConfig.url,
      method: requestConfig.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
      data: requestConfig.data as unknown as Record<string, unknown>,
      header: requestConfig.header,
      timeout: requestConfig.timeout,
      sslVerify: requestConfig.sslVerify,
      success: (res: UniResponse) => {
        if (requestId && pendingRequests) {
          pendingRequests.delete(requestId)
        }
        resolve(res as UniResponse)
      },
      fail: async (err: UniApp.GeneralCallbackResult) => {
        if (requestId && pendingRequests) {
          pendingRequests.delete(requestId)
        }

        if (signal?.aborted || (err.errMsg || '').includes('abort')) {
          reject(new Error('Request aborted'))
          return
        }

        const shouldRetry = shouldRetryError(err)

        if (shouldRetry && retryCount < API.MAX_RETRY_COUNT) {
          console.log(`请求失败，第${retryCount + 1}次重试，URL: ${requestConfig.url}`)
          await delay(API.RETRY_DELAY * (retryCount + 1))
          try {
            const result = await requestWithRetry(requestConfig, retryCount + 1, pendingRequests)
            resolve(result)
          } catch (retryErr) {
            reject(retryErr)
          }
        } else {
          reject(err)
        }
      }
    })

    if (requestId && pendingRequests) {
      pendingRequests.set(requestId, requestTask as unknown as RequestTask)
    }

    if (signal) {
      signal.addEventListener('abort', () => {
        (requestTask as unknown as RequestTask).abort()
        if (requestId && pendingRequests) {
          pendingRequests.delete(requestId)
        }
        if (onAbort) {
          onAbort(requestId || '')
        }
        reject(new Error('Request aborted'))
      })
    }
  })
}

const shouldRetryError = (err: UniApp.GeneralCallbackResult): boolean => {
  if (!err) return false

  const errMsg = (err.errMsg || '').toLowerCase()

  const retryableErrors = [
    'timeout',
    'connect',
    'network',
    'econnrefused',
    'enotfound',
    'enetunreach'
  ]

  const nonRetryableErrors = ['abort', 'cancel', 'intercepted']

  if (nonRetryableErrors.some(keyword => errMsg.includes(keyword))) {
    return false
  }

  return retryableErrors.some(keyword => errMsg.includes(keyword))
}

const _requestTimers = new Map<string, number>()

const LOG_LEVEL: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

const CURRENT_LEVEL = process.env.NODE_ENV === 'development' ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN

const _log = (level: LogLevel, tag: string, data: unknown): void => {
  if (LOG_LEVEL[level] < CURRENT_LEVEL) return
  const ts = new Date().toISOString().slice(11, 23)
  const prefix = `[${ts}][${level}][${tag}]`
  switch (level) {
    case 'ERROR':
      console.error(prefix, data)
      break
    case 'WARN':
      console.warn(prefix, data)
      break
    default:
      console.log(prefix, data)
  }
}

export const debugLog = (type: string, data: unknown): void => {
  _log('DEBUG', type, data)
}

export const logRequest = (method: HttpMethod | 'UPLOAD', url: string, data: unknown): string => {
  const key = `${method}:${url}:${Date.now()}`
  _requestTimers.set(key, Date.now())
  return key
}

export const logResponse = (timerKey: string, statusCode: number, data: unknown): void => {
  _requestTimers.delete(timerKey)
}

export const logRequestError = (timerKey: string, err: unknown): void => {
  const startTime = _requestTimers.get(timerKey)
  const duration = startTime ? `${Date.now() - startTime}ms` : 'N/A'
  _requestTimers.delete(timerKey)
  _log('ERROR', 'REQ_FAIL', { duration, err })
}
