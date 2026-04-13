import { API } from '../constants/index.ts'
import { generateCacheKey, getCache, clearCache, clearUrlCache, setCache } from './cache.ts'
import { isNoTokenUrl } from './validators.ts'
import { handleSuccess, handleError, handleNetworkError } from './errorHandler.ts'
import { install } from './interceptor.ts'
import type { ApiResponse } from '@/types/api'
import {
  buildUrl,
  appendQueryParams,
  isValidUrl,
  getToken,
  mergeHeaders,
  prepareRequestData,
  requestWithRetry,
  objectToFormUrlencoded,
  logRequest,
  logResponse,
  logRequestError
} from './utils.ts'

export const BASE_URL = API.BASE_URL

interface RequestOptions {
  url?: string
  method?: string
  data?: unknown
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  cache?: boolean
  cacheTime?: number
  timeout?: number
  sslVerify?: boolean
  silent?: boolean
  signal?: AbortSignal
  [key: string]: unknown
}

const pendingRequests = new Map<string, UniApp.RequestTask>()

export const cancelRequest = (requestId: string): void => {
  const task = pendingRequests.get(requestId)
  if (task) {
    task.abort()
    pendingRequests.delete(requestId)
  }
}

export const cancelAllRequests = (): void => {
  pendingRequests.forEach((task) => {
    task.abort()
  })
  pendingRequests.clear()
}

export const generateRequestId = (url: string, method: string): string => {
  return `${method.toUpperCase()}_${url}_${Date.now()}`
}

export const request = <T = unknown>(options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      cache = false,
      cacheTime = API.DEFAULT_CACHE_TIME
    } = options

    // GET请求且启用缓存时，先检查缓存
    if (method.toUpperCase() === 'GET' && cache) {
      const cacheKey = generateCacheKey(url ?? '', data as Record<string, unknown>)
      const cachedData = getCache(cacheKey)
      if (cachedData) {
        console.log('使用缓存数据:', url)
        resolve(cachedData as ApiResponse<T>)
        return
      }
    }

    // 显示加载提示
    if (options.showLoading) {
      uni.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      })
    }

    // 处理 URL
    let requestUrl = buildUrl(url ?? '', BASE_URL)

    // GET 请求参数拼接到 URL
    if (method.toUpperCase() === 'GET' && data && Object.keys(data as Record<string, unknown>).length > 0) {
      requestUrl = appendQueryParams(requestUrl, data as Record<string, unknown>)
    }

    // 验证 URL 格式
    if (!isValidUrl(requestUrl)) {
      console.error('无效的请求 URL:', requestUrl)
      if (options.showLoading) {
        uni.hideLoading()
      }
      reject(new Error('无效的请求 URL'))
      return
    }

    // 检查是否为不需要token的接口
    const needToken = !isNoTokenUrl(requestUrl)

    // 获取 token
    const token = getToken(needToken)

    // 卫兵逻辑：如果接口需要 Token 但本地没有
    if (needToken && !token) {
      console.warn('检测到未登录，已拦截强制授权接口:', requestUrl)
      if (options.showLoading) {
        uni.hideLoading()
      }
      resolve({ code: 401, msg: '未登录', data: undefined })
      return
    }

    // 合并请求头
    const headers = mergeHeaders(token, options.header)

    // 准备请求数据
    const contentType = (headers['Content-Type'] || '').toLowerCase()
    let requestData = prepareRequestData(method, data, contentType)

    // 请求日志 + 计时
    const _timerKey = logRequest(method || 'GET', requestUrl, data)

    const requestConfig = {
      url: requestUrl,
      method: method || 'GET',
      data: requestData,
      header: headers,
      timeout: options.timeout || API.TIMEOUT,
      sslVerify: options.sslVerify !== false,
      signal: options.signal,
      requestId: options.signal ? undefined : generateRequestId(url ?? '', method || 'GET'),
      onAbort: (id: string) => {
        pendingRequests.delete(id)
      }
    }

    requestWithRetry(requestConfig, 0, pendingRequests)
      .then(res => {
        logResponse(_timerKey, res.statusCode, res.data)

        const successData = handleSuccess(res as any, options, url ?? '', data as Record<string, unknown>, cache, cacheTime)
        if (successData !== null) {
          resolve(successData as ApiResponse<T>)
          return
        }

        const isHandled = handleError(res as any, options, requestUrl)
        if (isHandled) {
          reject(res)
          return
        }

        reject(res)
      })
      .catch(err => {
        if ((err as Error).message === 'Request aborted') {
          console.log('请求已取消:', requestUrl)
          return
        }
        logRequestError(_timerKey, err)
        handleNetworkError(err as any, options as any, requestUrl)
        reject(err)
      })
  })
}

export const get = <T = unknown>(url: string, params: unknown = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    ...(options as Record<string, unknown>)
  })
}

export const post = <T = unknown>(url: string, data: unknown = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...(options as Record<string, unknown>)
  })
}

export const postWithQuery = <T = unknown>(url: string, data: unknown = {}, queryParams: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }
  return request<T>({
    url: finalUrl,
    method: 'POST',
    data,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.header
    },
    ...(options as Record<string, unknown>)
  })
}

export const put = <T = unknown>(url: string, data: unknown = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...(options as Record<string, unknown>)
  })
}

export const putWithQuery = <T = unknown>(url: string, data: unknown = {}, queryParams: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }
  return request<T>({
    url: finalUrl,
    method: 'PUT',
    data,
    ...(options as Record<string, unknown>)
  })
}

export const del = <T = unknown>(url: string, data: unknown = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...(options as Record<string, unknown>)
  })
}

export const delWithQuery = <T = unknown>(url: string, data: unknown = {}, queryParams: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }
  return request<T>({
    url: finalUrl,
    method: 'DELETE',
    data,
    ...(options as Record<string, unknown>)
  })
}

export const postForm = <T = unknown>(url: string, data: unknown = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const formData = objectToFormUrlencoded(data as Record<string, unknown>)

  return request<T>({
    url,
    method: 'POST',
    data: formData,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.header
    },
    ...(options as Record<string, unknown>)
  })
}

export const postFormWithQuery = <T = unknown>(url: string, data: unknown = {}, queryParams: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const formData = objectToFormUrlencoded(data as Record<string, unknown>)

  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }

  return request<T>({
    url: finalUrl,
    method: 'POST',
    data: formData,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.header
    },
    ...(options as Record<string, unknown>)
  })
}

interface UploadOptions extends RequestOptions {
  name?: string
  formData?: unknown
  [key: string]: unknown
}

export const uploadFile = <T = unknown>(url: string, filePath: string, options: UploadOptions = {}): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const { name = 'file', formData = {}, header = {} } = options

    let requestUrl = buildUrl(url, BASE_URL)

    // 添加token认证
    const needToken = !isNoTokenUrl(requestUrl)
    const token = getToken(needToken)

    // 合并请求头，添加token
    const headers = {
      ...header
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (options.showLoading) {
      uni.showLoading({
        title: options.loadingText || '上传中...',
        mask: true
      })
    }

    // 记录请求开始
    const timerKey = logRequest('UPLOAD', requestUrl, { filePath, formData: formData as Record<string, unknown> })

    uni.uploadFile({
      url: requestUrl,
      filePath: filePath,
      name: name,
      formData: formData as Record<string, unknown>,
      header: headers,
      timeout: 30000,
      success: (res: any) => {
        logResponse(timerKey, res.statusCode, res.data)

        if (options.showLoading) {
          uni.hideLoading()
        }

        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            // 使用统一的错误处理
            const isHandled = handleError(res as any, options as any, requestUrl)
            if (isHandled) {
              reject(res)
            } else {
              reject({
                code: res.statusCode,
                msg: data?.msg || data?.message || `上传失败，状态码: ${res.statusCode}`,
                data: data
              })
            }
          }
        } catch (e) {
          logRequestError(timerKey, e)
          reject({
            code: -1,
            msg: '上传响应格式错误',
            data: res.data
          })
        }
      },
      fail: (err: any) => {
        logRequestError(timerKey, err)
        handleNetworkError(err, options, requestUrl)
        if (options.showLoading) {
          uni.hideLoading()
        }
        reject({
          code: err.errCode || -1,
          msg: err.errMsg || '上传请求失败',
          error: err
        })
      }
    })
  })
}

// 导出缓存相关函数
export { install, clearCache, clearUrlCache }
