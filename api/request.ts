import { API } from '../constants/index.ts'
import { generateCacheKey, getCache, clearCache, clearUrlCache, setCache } from './cache.ts'
import { isNoTokenUrl } from './validators.ts'
import { handleSuccess, handleError, handleNetworkError } from './errorHandler.ts'
import { install } from './interceptor.ts'
import type { ApiResponse, RequestData, HttpMethod, ApiError } from '@/types/api'
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

interface InternalRequestOptions {
  url?: string
  method?: HttpMethod
  data?: RequestData | string
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  cache?: boolean
  cacheTime?: number
  timeout?: number
  sslVerify?: boolean
  silent?: boolean
  signal?: AbortSignal
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

export const request = <T = void>(options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      cache = false,
      cacheTime = API.DEFAULT_CACHE_TIME
    } = options

    if (method === 'GET' && cache) {
      const cacheKey = generateCacheKey(url ?? '', typeof data === 'string' ? {} : data as Record<string, unknown>)
      const cachedData = getCache(cacheKey)
      if (cachedData) {
        console.log('使用缓存数据:', url)
        resolve(cachedData as ApiResponse<T>)
        return
      }
    }

    if (options.showLoading) {
      uni.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      })
    }

    let requestUrl = buildUrl(url ?? '', BASE_URL)

    if (method === 'GET' && data && Object.keys(data).length > 0) {
      requestUrl = appendQueryParams(requestUrl, typeof data === 'string' ? {} : data)
    }

    if (!isValidUrl(requestUrl)) {
      console.error('无效的请求 URL:', requestUrl)
      if (options.showLoading) {
        uni.hideLoading()
      }
      reject(new Error('无效的请求 URL'))
      return
    }

    const needToken = !isNoTokenUrl(requestUrl)
    const token = getToken(needToken)

    if (needToken && !token) {
      console.warn('检测到未登录，已拦截强制授权接口:', requestUrl)
      if (options.showLoading) {
        uni.hideLoading()
      }
      resolve({ code: 401, msg: '未登录' })
      return
    }

    const headers = mergeHeaders(token, options.header)
    const contentType = (headers['Content-Type'] || '').toLowerCase()
    const requestDataType = (typeof data === 'string' ? {} : (data ?? {})) as RequestData
    let requestData = prepareRequestData(method, requestDataType, contentType)

    const _timerKey = logRequest(method, requestUrl, data)

    const requestConfig = {
      url: requestUrl,
      method,
      data: requestData,
      header: headers,
      timeout: options.timeout || API.TIMEOUT,
      sslVerify: options.sslVerify !== false,
      signal: options.signal,
      requestId: options.signal ? undefined : generateRequestId(url ?? '', method),
      onAbort: (id: string) => {
        pendingRequests.delete(id)
      }
    }

    requestWithRetry(requestConfig, 0, pendingRequests)
      .then(res => {
        logResponse(_timerKey, res.statusCode, res.data)

        const successData = handleSuccess(res, options, url ?? '', typeof data === 'string' ? {} : data, cache, cacheTime)
        if (successData !== null) {
          resolve(successData as ApiResponse<T>)
          return
        }

        const isHandled = handleError(res, options, requestUrl)
        if (isHandled) {
          reject(res)
          return
        }

        reject(res)
      })
      .catch((err: ApiError) => {
        if (err.message === 'Request aborted') {
          console.log('请求已取消:', requestUrl)
          return
        }
        logRequestError(_timerKey, err)
        handleNetworkError(err, options, requestUrl)
        reject(err)
      })
  })
}

export const get = <T = void>(url: string, params: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

export const post = <T = void>(url: string, data: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...options
  })
}

export const postWithQuery = <T = void>(url: string, data: RequestData = {}, queryParams: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
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
    ...options
  })
}

export const put = <T = void>(url: string, data: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

export const putWithQuery = <T = void>(url: string, data: RequestData = {}, queryParams: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }
  return request<T>({
    url: finalUrl,
    method: 'PUT',
    data,
    ...options
  })
}

export const del = <T = void>(url: string, data: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export const delWithQuery = <T = void>(url: string, data: RequestData = {}, queryParams: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    finalUrl = appendQueryParams(url, queryParams)
  }
  return request<T>({
    url: finalUrl,
    method: 'DELETE',
    data,
    ...options
  })
}

export const postForm = <T = void>(url: string, data: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  const formData = objectToFormUrlencoded(data)

  return request<T>({
    url,
    method: 'POST',
    data: formData,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.header
    },
    ...options
  })
}

export const postFormWithQuery = <T = void>(url: string, data: RequestData = {}, queryParams: RequestData = {}, options: InternalRequestOptions = {}): Promise<ApiResponse<T>> => {
  const formData = objectToFormUrlencoded(data)

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
    ...options
  })
}

interface UploadOptions extends InternalRequestOptions {
  name?: string
  formData?: RequestData
}

export const uploadFile = <T = void>(url: string, filePath: string, options: UploadOptions = {}): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const { name = 'file', formData = {}, header = {} } = options

    let requestUrl = buildUrl(url, BASE_URL)
    const needToken = !isNoTokenUrl(requestUrl)
    const token = getToken(needToken)

    const headers: Record<string, string> = {
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

    const timerKey = logRequest('UPLOAD', requestUrl, { filePath, formData })

    uni.uploadFile({
      url: requestUrl,
      filePath: filePath,
      name: name,
      formData: formData as Record<string, string>,
      header: headers,
      timeout: 30000,
      success: (res: UniApp.UploadFileSuccessCallbackResult) => {
        logResponse(timerKey, res.statusCode, res.data)

        if (options.showLoading) {
          uni.hideLoading()
        }

        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            const isHandled = handleError(res as unknown as { statusCode: number; data: unknown }, options, requestUrl)
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
      fail: (err: UniApp.GeneralCallbackResult) => {
        logRequestError(timerKey, err as ApiError)
        handleNetworkError(err as ApiError, options, requestUrl)
        if (options.showLoading) {
          uni.hideLoading()
        }
        reject({
          code: (err as unknown as { errCode?: number }).errCode || -1,
          msg: err.errMsg || '上传请求失败',
          error: err
        })
      }
    })
  })
}

export { install, clearCache, clearUrlCache }
