import { API } from '../constants/index.js'

/**
 * 延迟函数
 * @param {Number} ms 延迟时间（毫秒）
 * @returns {Promise}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 将对象转换为 application/x-www-form-urlencoded 格式的字符串
 * @param {Object} obj 要转换的对象
 * @returns {String} form-urlencoded 格式的字符串
 */
export const objectToFormUrlencoded = (obj) => {
	return Object.keys(obj)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key] || '')}`)
		.join('&')
}

/**
 * 处理URL
 * @param {String} url 请求URL
 * @param {String} baseUrl 基础URL
 * @returns {String} 完整URL
 */
export const buildUrl = (url, baseUrl) => {
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
 * @param {String} url 请求URL
 * @param {Object} data 请求参数
 * @returns {String} 拼接后的URL
 */
export const appendQueryParams = (url, data = {}) => {
	if (!data || Object.keys(data).length === 0) {
		return url
	}
	
	const queryString = Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&')
	const separator = url.includes('?') ? '&' : '?'
	return `${url}${separator}${queryString}`
}

/**
 * 验证URL格式
 * @param {String} url 请求URL
 * @returns {Boolean} 是否有效
 */
export const isValidUrl = (url) => {
	if (!url) return false
	return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * 获取token
 * @param {Boolean} needToken 是否需要token
 * @returns {String} token值
 */
export const getToken = (needToken = true) => {
	if (!needToken) return ''
	
	try {
		return uni.getStorageSync('token') || ''
	} catch (e) {
		console.error('获取 token 失败:', e)
		return ''
	}
}

/**
 * 合并请求头
 * @param {String} token token值
 * @param {Object} customHeaders 自定义请求头
 * @returns {Object} 合并后的请求头
 */
export const mergeHeaders = (token, customHeaders = {}) => {
	const headers = {
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
 * @param {String} method 请求方法
 * @param {Object} data 请求数据
 * @param {String} contentType Content-Type
 * @returns {Object} 处理后的数据
 */
export const prepareRequestData = (method, data = {}, contentType = 'application/json') => {
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
 * @param {Object} requestConfig 请求配置
 * @param {Number} retryCount 当前重试次数
 * @returns {Promise}
 */
export const requestWithRetry = (requestConfig, retryCount = 0) => {
	return new Promise((resolve, reject) => {
		uni.request({
			...requestConfig,
			success: (res) => {
				resolve(res)
			},
			fail: async (err) => {
				if (retryCount < API.MAX_RETRY_COUNT) {
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

// 请求耗时记录 Map，key 为 url+method
const _requestTimers = new Map()

/**
 * 日志级别
 */
const LOG_LEVEL = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
}

// 当前最低输出级别：dev 输出 DEBUG 及以上，prod 只输出 WARN 及以上
const CURRENT_LEVEL = process.env.NODE_ENV === 'development' ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN

/**
 * 带级别的日志输出
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level 日志级别
 * @param {String} tag 标签
 * @param {any} data 数据
 */
const _log = (level, tag, data) => {
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
 * @param {String} type 日志类型
 * @param {Object} data 日志数据
 */
export const debugLog = (type, data) => {
	_log('DEBUG', type, data)
}

/**
 * 记录请求开始，返回 timerKey（传给 logResponse 计算耗时）
 * @param {String} method 请求方法
 * @param {String} url 请求URL
 * @param {Object} data 请求数据
 * @returns {String} timerKey
 */
export const logRequest = (method, url, data) => {
	const key = `${method}:${url}:${Date.now()}`
	_requestTimers.set(key, Date.now())
	_log('INFO', 'REQ', { method, url, data })
	return key
}

/**
 * 记录请求响应，自动计算耗时
 * @param {String} timerKey logRequest 返回的 key
 * @param {Number} statusCode HTTP 状态码
 * @param {any} data 响应数据
 */
export const logResponse = (timerKey, statusCode, data) => {
	const startTime = _requestTimers.get(timerKey)
	const duration = startTime ? `${Date.now() - startTime}ms` : 'N/A'
	_requestTimers.delete(timerKey)
	const level = statusCode >= 400 ? 'WARN' : 'INFO'
	_log(level, 'RES', { statusCode, duration, data })
}

/**
 * 记录请求失败
 * @param {String} timerKey logRequest 返回的 key
 * @param {Object} err 错误对象
 */
export const logRequestError = (timerKey, err) => {
	const startTime = _requestTimers.get(timerKey)
	const duration = startTime ? `${Date.now() - startTime}ms` : 'N/A'
	_requestTimers.delete(timerKey)
	_log('ERROR', 'REQ_FAIL', { duration, err })
}
