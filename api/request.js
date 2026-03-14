import { API } from '../constants/index.js'
import { generateCacheKey, getCache, clearCache, clearUrlCache, setCache } from './cache.js'
import { isNoTokenUrl } from './validators.js'
import { handleSuccess, handleError, handleNetworkError } from './errorHandler.js'
import { install } from './interceptor.js'
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
} from './utils.js'

export const BASE_URL = API.BASE_URL

/**
 * 统一的请求工具函数
 * @param {Object} options 请求配置
 * @param {String} options.url 请求地址（相对路径，会自动拼接 BASE_URL）
 * @param {String} options.method 请求方法，默认 'GET'
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @param {Boolean} options.showLoading 是否显示加载提示，默认 false
 * @param {String} options.loadingText 加载提示文字，默认 '加载中...'
 * @param {Boolean} options.cache 是否缓存，默认 false
 * @param {Number} options.cacheTime 缓存时间，默认 5分钟
 * @returns {Promise} 返回 Promise
 */
export const request = (options = {}) => {
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
			const cacheKey = generateCacheKey(url, data)
			const cachedData = getCache(cacheKey)
			if (cachedData) {
				console.log('使用缓存数据:', url)
				resolve(cachedData)
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
		let requestUrl = buildUrl(url, BASE_URL)
		
		// GET 请求参数拼接到 URL
		if (method.toUpperCase() === 'GET' && data && Object.keys(data).length > 0) {
			requestUrl = appendQueryParams(requestUrl, data)
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
			resolve({ code: 401, msg: '未登录', data: null })
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
			sslVerify: options.sslVerify !== false
		}
		
		requestWithRetry(requestConfig)
			.then((res) => {
				logResponse(_timerKey, res.statusCode, res.data)
				
				// 处理成功响应
				const successData = handleSuccess(res, options, url, data, cache, cacheTime)
				if (successData !== null) {
					resolve(successData)
					return
				}

				// 处理错误响应
				const isHandled = handleError(res, options, requestUrl)
				if (isHandled) {
					reject(res)
					return
				}

				reject(res)
			})
			.catch((err) => {
				logRequestError(_timerKey, err)
				handleNetworkError(err, options, requestUrl)
				reject(err)
			})
	})
}

/**
 * GET 请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置选项
 */
export const get = (url, params = {}, options = {}) => {
	return request({
		url,
		method: 'GET',
		data: params,
		...options
	})
}

/**
 * POST 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置选项
 */
export const post = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

/**
 * POST 请求（带query参数）
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} queryParams query参数
 * @param {Object} options 其他配置选项
 */
export const postWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	let finalUrl = url
	if (queryParams && Object.keys(queryParams).length > 0) {
		finalUrl = appendQueryParams(url, queryParams)
	}
	return request({
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

/**
 * PUT 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置选项
 */
export const put = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

/**
 * PUT 请求（带query参数）
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} queryParams query参数
 * @param {Object} options 其他配置选项
 */
export const putWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	let finalUrl = url
	if (queryParams && Object.keys(queryParams).length > 0) {
		finalUrl = appendQueryParams(url, queryParams)
	}
	return request({
		url: finalUrl,
		method: 'PUT',
		data,
		...options
	})
}

/**
 * DELETE 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置选项
 */
export const del = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}

export const delWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	let finalUrl = url
	if (queryParams && Object.keys(queryParams).length > 0) {
		finalUrl = appendQueryParams(url, queryParams)
	}
	return request({
		url: finalUrl,
		method: 'DELETE',
		data,
		...options
	})
}

/**
 * POST 请求（form-urlencoded 格式）
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置选项
 */
export const postForm = (url, data = {}, options = {}) => {
	const formData = objectToFormUrlencoded(data)
	
	return request({
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

/**
 * POST 请求（form-urlencoded 格式，带query参数）
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} queryParams query参数
 * @param {Object} options 其他配置选项
 */
export const postFormWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	const formData = objectToFormUrlencoded(data)
	
	let finalUrl = url
	if (queryParams && Object.keys(queryParams).length > 0) {
		finalUrl = appendQueryParams(url, queryParams)
	}
	
	return request({
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

/**
 * 上传文件
 * @param {String} url 请求地址
 * @param {String} filePath 文件路径
 * @param {Object} options 其他配置选项
 */
export const uploadFile = (url, filePath, options = {}) => {
	return new Promise((resolve, reject) => {
		const {
			name = 'file',
			formData = {},
			header = {}
		} = options

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
		const timerKey = logRequest('UPLOAD', requestUrl, { filePath, formData })

		uni.uploadFile({
			url: requestUrl,
			filePath: filePath,
			name: name,
			formData: formData,
			header: headers,
			timeout: 30000,
			success: (res) => {
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
						const isHandled = handleError(res, options, requestUrl)
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
			fail: (err) => {
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
export {
	install,
	clearCache,
	clearUrlCache
}
