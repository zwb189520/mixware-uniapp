import { API } from '../constants/index.js'
import { useUserStore } from '../stores/modules/user.ts'

interface RequestConfig {
	url: string
	method?: string
	data?: unknown
	header?: Record<string, string>
	timeout?: number
	sslVerify?: boolean
}

interface UniResponse {
	statusCode: number
	data: unknown
	header: Record<string, string>
}

interface UniError {
	errMsg?: string
	message?: string
	[key: string]: unknown
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

/**
 * 延迟函数
 * @param ms 延迟时间（毫秒）
 */
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 将对象转换为 application/x-www-form-urlencoded 格式的字符串
 * @param obj 要转换的对象
 */
export const objectToFormUrlencoded = (obj: Record<string, unknown>): string => {
	return Object.keys(obj)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key] ?? ''))}`)
		.join('&')
}

/**
 * 处理URL
 * @param url 请求URL
 * @param baseUrl 基础URL
 */
export const buildUrl = (url: string, baseUrl: string): string => {
	if (!url) return ''
	
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}
	
	const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
	const cleanPath = url.startsWith('/') ? url : '/' + url
	return cleanBaseUrl + cleanPath
}

/**
 * 拼接GET请求参数到URL
 * @param url 请求URL
 * @param data 请求参数
 */
export const appendQueryParams = (url: string, data: Record<string, unknown> = {}): string => {
	if (!data || Object.keys(data).length === 0) {
		return url
	}
	
	const queryString = Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`)
		.join('&')
	const separator = url.includes('?') ? '&' : '?'
	return `${url}${separator}${queryString}`
}

/**
 * 验证URL格式
 * @param url 请求URL
 */
export const isValidUrl = (url: string): boolean => {
	if (!url) return false
	return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * 获取token
 * ✅ 改进：从内存（Pinia store）获取 Token，而不是本地存储
 * 这样可以防止 XSS 攻击
 * @param needToken 是否需要token
 */
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

/**
 * 合并请求头
 * @param token token值
 * @param customHeaders 自定义请求头
 */
export const mergeHeaders = (token: string, customHeaders: Record<string, string> = {}): Record<string, string> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...customHeaders
	}
	
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	
	return headers
}

/**
 * 准备请求数据
 * @param method 请求方法
 * @param data 请求数据
 * @param contentType Content-Type
 */
export const prepareRequestData = (method: string, data: unknown = {}, contentType = 'application/json'): unknown => {
	const upperMethod = (method || 'GET').toUpperCase()
	
	// GET请求参数已拼接在URL中，data置空
	if (upperMethod === 'GET') {
		return {}
	}
	
	// POST/PUT请求处理
	if (contentType.includes('application/json')) {
		return typeof data === 'string' ? data : JSON.stringify(data || {})
	}
	
	// form-urlencoded格式
	return data
}

/**
 * 带重试的请求执行
 * @param requestConfig 请求配置
 * @param retryCount 当前重试次数
 */
export const requestWithRetry = (requestConfig: RequestConfig, retryCount = 0): Promise<UniResponse> => {
	return new Promise((resolve, reject) => {
		uni.request({
			...requestConfig,
			success: (res: UniResponse) => {
				resolve(res as UniResponse)
			},
			fail: async (err: UniError) => {
				// 只对网络错误重试，不重试业务错误
				const shouldRetry = shouldRetryError(err as UniError)
				
				if (shouldRetry && retryCount < API.MAX_RETRY_COUNT) {
					console.log(`请求失败，第${retryCount + 1}次重试，URL: ${requestConfig.url}`)
					await delay(API.RETRY_DELAY * (retryCount + 1))
					try {
						const result = await requestWithRetry(requestConfig, retryCount + 1)
						resolve(result)
					} catch (retryErr) {
						reject(retryErr)
					}
				} else {
					reject(err)
				}
			}
		})
	})
}

/**
 * 判断是否应该重试
 * @param err 错误对象
 */
const shouldRetryError = (err: UniError): boolean => {
	if (!err) return false
	
	const errMsg = (err.errMsg || err.message || '').toLowerCase()
	
	// 网络超时、连接失败、DNS 失败等才重试
	const retryableErrors = [
		'timeout',
		'connect',
		'network',
		'econnrefused',
		'enotfound',
		'enetunreach'
	]
	
	// 用户主动取消、请求被拦截等不重试
	const nonRetryableErrors = [
		'abort',
		'cancel',
		'intercepted'
	]
	
	if (nonRetryableErrors.some(keyword => errMsg.includes(keyword))) {
		return false
	}
	
	return retryableErrors.some(keyword => errMsg.includes(keyword))
}

// 请求耗时记录 Map，key 为 url+method
const _requestTimers = new Map<string, number>()

/**
 * 日志级别
 */
const LOG_LEVEL: Record<LogLevel, number> = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
}

// 当前最低输出级别：dev 输出 DEBUG 及以上，prod 只输出 WARN 及以上
const CURRENT_LEVEL = process.env.NODE_ENV === 'development' ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN

/**
 * 带级别的日志输出
 * @param level 日志级别
 * @param tag 标签
 * @param data 数据
 */
const _log = (level: LogLevel, tag: string, data: unknown): void => {
	if (LOG_LEVEL[level] < CURRENT_LEVEL) return
	const ts = new Date().toISOString().slice(11, 23) // HH:mm:ss.mmm
	const prefix = `[${ts}][${level}][${tag}]`
	switch (level) {
		case 'ERROR': console.error(prefix, data); break
		case 'WARN':  console.warn(prefix, data);  break
		default:      console.log(prefix, data)
	}
}

/**
 * 调试日志（兼容旧调用）
 * @param type 日志类型
 * @param data 日志数据
 */
export const debugLog = (type: string, data: unknown): void => {
	_log('DEBUG', type, data)
}

/**
 * 记录请求开始，返回 timerKey（传给 logResponse 计算耗时）
 * @param method 请求方法
 * @param url 请求URL
 * @param data 请求数据
 * @returns timerKey
 */
export const logRequest = (method: string, url: string, data: unknown): string => {
	const key = `${method}:${url}:${Date.now()}`
	_requestTimers.set(key, Date.now())
	return key
}

/**
 * 记录请求响应，自动计算耗时
 * @param timerKey logRequest 返回的 key
 * @param statusCode HTTP 状态码
 * @param data 响应数据
 */
export const logResponse = (timerKey: string, statusCode: number, data: unknown): void => {
	_requestTimers.delete(timerKey)
}

/**
 * 记录请求失败
 * @param timerKey logRequest 返回的 key
 * @param err 错误对象
 */
export const logRequestError = (timerKey: string, err: unknown): void => {
	const startTime = _requestTimers.get(timerKey)
	const duration = startTime ? `${Date.now() - startTime}ms` : 'N/A'
	_requestTimers.delete(timerKey)
	_log('ERROR', 'REQ_FAIL', { duration, err })
}
