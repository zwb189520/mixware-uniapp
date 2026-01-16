import { API } from '../constants/index.js'

// 缓存配置
const CACHE_PREFIX = 'api_cache_'
const DEFAULT_CACHE_TIME = API.DEFAULT_CACHE_TIME

/**
 * 生成缓存key
 * @param {String} url 请求URL
 * @param {Object} params 请求参数
 * @returns {String} 缓存key
 */
const generateCacheKey = (url, params = {}) => {
	const paramStr = Object.keys(params)
		.sort()
		.map(key => `${key}=${JSON.stringify(params[key])}`)
		.join('&')
	return `${CACHE_PREFIX}${url}_${paramStr}`
}

/**
 * 获取缓存数据
 * @param {String} key 缓存key
 * @returns {Object|null} 缓存数据
 */
const getCache = (key) => {
	try {
		const cacheData = uni.getStorageSync(key)
		if (!cacheData) return null
		
		const { data, timestamp, expireTime } = JSON.parse(cacheData)
		const now = Date.now()
		
		if (now - timestamp > expireTime) {
			uni.removeStorageSync(key)
			return null
		}
		
		return data
	} catch (e) {
		console.error('获取缓存失败:', e)
		return null
	}
}

/**
 * 设置缓存数据
 * @param {String} key 缓存key
 * @param {Object} data 缓存数据
 * @param {Number} expireTime 过期时间（毫秒）
 */
const setCache = (key, data, expireTime = DEFAULT_CACHE_TIME) => {
	try {
		const cacheData = {
			data,
			timestamp: Date.now(),
			expireTime
		}
		uni.setStorageSync(key, JSON.stringify(cacheData))
	} catch (e) {
		console.error('设置缓存失败:', e)
	}
}

/**
 * 清除缓存
 * @param {String} key 缓存key，不传则清除所有缓存
 */
const clearCache = (key) => {
	try {
		if (key) {
			uni.removeStorageSync(key)
		} else {
			const storage = uni.getStorageInfoSync()
			storage.keys.forEach(k => {
				if (k.startsWith(CACHE_PREFIX)) {
					uni.removeStorageSync(k)
				}
			})
		}
	} catch (e) {
		console.error('清除缓存失败:', e)
	}
}

/**
 * 清除指定URL的缓存
 * @param {String} url 请求URL
 * @param {Object} params 请求参数
 */
const clearUrlCache = (url, params = {}) => {
	const key = generateCacheKey(url, params)
	clearCache(key)
}

// 检查URL是否为不需要token的接口
const isNoTokenUrl = (url) => {
	if (!url) return false
	const noTokenPaths = ['/users/login', '/users/register', '/users/signup']
	return noTokenPaths.some(path => url.includes(path))
}

// 请求拦截器
const install = () => {
	uni.addInterceptor('request', {
		invoke(args) {
			// 检查是否为不需要token的接口
			const url = args.url || ''
			const needToken = !isNoTokenUrl(url)
			
			// 从本地存储获取 token
			let token = ''
			if (needToken) {
				try {
					token = uni.getStorageSync('token') || ''
				} catch (e) {
					console.error('获取 token 失败:', e)
				}
			}
			
			args.header = {
				...args.header,
				'Authorization': token ? `Bearer ${token}` : '',
				'Content-Type':'application/json'
			}
			console.log('interceptor-invoke', args)
		},
		success(args) {
			console.log('interceptor-success', args)
		},
		fail(err) {
			console.log('interceptor-fail', err)
		},
		complete(res) {
			console.log('interceptor-complete', res)
		}
	})
}

// 基础请求配置
// 注意：如果服务器使用8080端口，需要配置为 'http://47.102.212.37:8080/api'
// export const BASE_URL = 'http://localhost/api'
// export const BASE_URL = 'https://app.mixwarebot.cn/api'
export const BASE_URL = API.BASE_URL
// export const BASE_URL = 'http://47.102.212.37:8080/api'  // 使用8080端口

/**
 * 执行登出逻辑
 * 清除本地存储的token和用户信息
 * @param {Boolean} isUserNotFound 是否为用户不存在的情况
 */
const handleLogout = (isUserNotFound = false) => {
	try {
		// 清除本地登录信息
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
		
		// 根据情况显示不同的提示
		const toastTitle = isUserNotFound ? '未登录' : '登录已过期，请重新登录'
		uni.showToast({
			title: toastTitle,
			icon: 'none',
			duration: 2000
		})
		
		// 延迟跳转到登录页面，避免在请求回调中直接跳转
		setTimeout(() => {
			// 获取当前页面栈
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			const currentRoute = currentPage ? currentPage.route : ''
			
			// 如果当前不在登录页面，则跳转到登录页面
			if (currentRoute !== 'pages/auth/login') {
				uni.reLaunch({
					url: '/pages/auth/login'
				})
			}
		}, 1500)
	} catch (e) {
		console.error('执行登出逻辑失败:', e)
	}
}

/**
 * 检查响应是否表示token失效
 * @param {Object} res 响应对象
 * @returns {Boolean} 是否表示token失效
 */
const isTokenInvalid = (res) => {
	// 检查状态码：401 表示未授权
	if (res.statusCode === 401) {
		return true
	}
	
	// 检查响应消息中是否包含token相关错误
	const errorMsg = (res.data?.message || res.data?.error || '').toLowerCase()
	const tokenErrorKeywords = [
		'token',
		'缺少token',
		'token过期',
		'token失效',
		'未授权',
		'unauthorized',
		'登录过期',
		'请重新登录'
	]
	
	return tokenErrorKeywords.some(keyword => errorMsg.includes(keyword.toLowerCase()))
}

/**
 * 检查响应数据是否表示用户不存在（没有用户id）
 * @param {Object} data 响应数据
 * @returns {Boolean} 是否表示用户不存在
 */
const isUserNotFound = (data) => {
	if (!data) {
		return false
	}
	
	// 检查响应消息中是否包含用户不存在相关错误
	const errorMsg = (data.message || data.error || '').toLowerCase()
	const userNotFoundKeywords = [
		'用户不存在',
		'用户id不存在',
		'没有该用户',
		'找不到用户',
		'user not found',
		'用户未找到',
		'该用户不存在'
	]
	
	// 如果错误消息中包含用户不存在相关关键词，返回true
	if (userNotFoundKeywords.some(keyword => errorMsg.includes(keyword.toLowerCase()))) {
		return true
	}
	
	// 检查响应数据中是否明确表示用户不存在
	// 例如：data.code === 'USER_NOT_FOUND' 或其他标识
	if (data.code === 'USER_NOT_FOUND' || data.code === 'USER_NOT_EXIST') {
		return true
	}
	
	return false
}


/**
 * 延迟函数
 * @param {Number} ms 延迟时间（毫秒）
 * @returns {Promise}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 带重试的请求执行
 * @param {Object} requestConfig 请求配置
 * @param {Number} retryCount 当前重试次数
 * @returns {Promise}
 */
const requestWithRetry = (requestConfig, retryCount = 0) => {
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

/**
 * 统一的请求工具函数
 * @param {Object} options 请求配置
 * @param {String} options.url 请求地址（相对路径，会自动拼接 BASE_URL）
 * @param {String} options.method 请求方法，默认 'GET'
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @param {Boolean} options.showLoading 是否显示加载提示，默认 false
 * @param {String} options.loadingText 加载提示文字，默认 '加载中...'
 * @returns {Promise} 返回 Promise
 */
export const request = (options = {}) => {
	return new Promise((resolve, reject) => {
		const {
			url,
			method = 'GET',
			data = {},
			cache = false,
			cacheTime = DEFAULT_CACHE_TIME
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
		let requestUrl = url
		if (requestUrl && !requestUrl.startsWith('http')) {
			// 确保 BASE_URL 和 url 正确拼接
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
			const requestPath = requestUrl.startsWith('/') ? requestUrl : '/' + requestUrl
			requestUrl = baseUrl + requestPath
		}
		
		// 验证 URL 格式
		if (!requestUrl || (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://'))) {
			console.error('无效的请求 URL:', requestUrl)
			reject(new Error('无效的请求 URL'))
			return
		}

		// 检查是否为不需要token的接口
		const needToken = !isNoTokenUrl(requestUrl)
		
		// 从本地存储获取 token（仅当需要token时）
		let token = ''
		if (needToken) {
			try {
				token = uni.getStorageSync('token') || ''
			} catch (e) {
				console.error('获取 token 失败:', e)
			}
		}
		
		// 合并请求头
		const headers = {
			'Content-Type': 'application/json',
			...options.header
		}
		
		// 如果有 token，添加到请求头
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}
		
		// 根据 Content-Type 决定如何序列化请求体
		let requestData = data
		const contentType = (headers['Content-Type'] || '').toLowerCase()
		if (method && method.toUpperCase() !== 'GET') {
			if (contentType.includes('application/json')) {
				// 统一使用 JSON 字符串，避免后端误解析为表单
				requestData = typeof requestData === 'string'
					? requestData
					: JSON.stringify(requestData || {})
				// 确保带 charset
				headers['Content-Type'] = 'application/json;charset=UTF-8'
			}
			// 对于 form-urlencoded，由 postForm 传入字符串和自定义 Content-Type，这里不做处理
		}
		
		// 调试：输出完整URL和配置信息
		console.log('=== 请求信息 ===')
		console.log('请求URL:', requestUrl || url)
		console.log('请求方法:', method || 'GET')
		console.log('请求头:', headers)
		console.log('请求原始数据(options.data):', data || {})
		console.log('请求实际发送数据(requestData):', requestData)
		console.log('BASE_URL:', BASE_URL)
		console.log('================')
		
		const requestConfig = {
			url: requestUrl || url,
			method: method || 'GET',
			data: requestData,
			header: headers,
			timeout: options.timeout || API.TIMEOUT,
			sslVerify: options.sslVerify !== false
		}
		
		requestWithRetry(requestConfig)
			.then((res) => {
				console.log('=== 响应信息 ===')
				console.log('响应状态码:', res.statusCode)
				console.log('响应数据:', res.data)
				console.log('================')
				
				if (options.showLoading) {
					uni.hideLoading()
				}

				if (res.statusCode >= 200 && res.statusCode < 300) {
					if (method.toUpperCase() === 'GET' && cache) {
						const cacheKey = generateCacheKey(url, data)
						setCache(cacheKey, res.data, cacheTime)
					}
					
					if (isUserNotFound(res.data)) {
						handleLogout(true)
						reject(res)
						return
					}
					
					resolve(res.data)
				} else {
					if (isTokenInvalid(res)) {
						handleLogout()
						reject(res)
						return
					}
					
					if (isUserNotFound(res.data)) {
						handleLogout(true)
						reject(res)
						return
					}
					
					const errorMsg = res.data?.message || res.data?.error || '请求失败'
					uni.showToast({
						title: errorMsg,
						icon: 'none'
					})
					reject(res)
				}
			})
			.catch((err) => {
				if (options.showLoading) {
					uni.hideLoading()
				}

				console.error('Request fail:', {
					err,
					url: requestUrl || url,
					method: method || 'GET',
					errMsg: err.errMsg || err.message || '未知错误',
					errorCode: err.errCode || err.code,
					statusCode: err.statusCode
				})
				
				let errorMessage = '网络错误，请稍后重试'
				if (err.errMsg) {
					if (err.errMsg.includes('timeout')) {
						errorMessage = '请求超时，请检查网络连接'
					} else if (err.errMsg.includes('fail') && err.errMsg.includes('http')) {
						errorMessage = '网络连接失败，请检查服务器地址和端口'
					} else if (err.errMsg.includes('abort')) {
						errorMessage = '请求已取消'
					} else {
						errorMessage = `网络错误: ${err.errMsg}`
					}
				}
				
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				})
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

/**
 * 将对象转换为 application/x-www-form-urlencoded 格式的字符串
 * @param {Object} obj 要转换的对象
 * @returns {String} form-urlencoded 格式的字符串
 */
const objectToFormUrlencoded = (obj) => {
	return Object.keys(obj)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key] || '')}`)
		.join('&')
}

/**
 * POST 请求（form-urlencoded 格式）
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置选项
 */
export const postForm = (url, data = {}, options = {}) => {
	// 将数据转换为 form-urlencoded 格式
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

export default {
	install,
	request,
	get,
	post,
	put,
	delete: del,
	postForm,
	clearCache,
	clearUrlCache
}