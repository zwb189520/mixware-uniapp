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
	// 基础免登录路径
	const noTokenPaths = [
		'/users/login', 
		'/users/register', 
		'/users/signup',
		'/users/sendVerificationCode',
		'/models/page',
		'/models/list',
		'/session/hot',
		'/session/hot-examples',
		'/community/list',
		'/community/posts'
	]
	
	// 特殊处理：/models/{id} 等详情接口
	if (url.includes('/models/') && 
		!url.includes('/models/page') && 
		!url.includes('/models/list') &&
		!url.includes('/models/add') && 
		!url.includes('/models/delete') && 
		!url.includes('/models/update') && 
		!url.includes('/models/my')) {
		// 检查路径是否是以 ID 结尾的详情接口 (如 /models/123)
		const parts = url.split('/')
		const lastPart = parts[parts.length - 1]
		if (lastPart && lastPart.length > 10) { // 简单判断是否为 ID
			return true // 尝试作为免登录处理，但后端如果依然报 500，前端也无能为力
		}
	}
	
	return noTokenPaths.some(path => url.includes(path))
}

// 请求拦截器
const install = () => {
	uni.addInterceptor('request', {
		invoke(args) {
			// 屏蔽含有 NaN 的请求，防止 500 错误
			const hasNaN = (obj) => {
				if (!obj) return false;
				return Object.values(obj).some(val => 
					(typeof val === 'number' && isNaN(val)) || 
					val === 'NaN' || 
					(typeof val === 'string' && val.includes('targetId=NaN'))
				);
			};

			if (hasNaN(args.data) || (args.url && args.url.includes('NaN'))) {
				console.warn('已拦截含有 NaN 的无效请求:', args.url, args.data);
				return false; // 拦截请求
			}

			// 拦截器不再处理 Token，统一交给 request 函数处理，避免冲突
			args.header = args.header || {}
			args.header['Content-Type'] = 'application/json'
			
			// 只有在开发环境下且不是 undefined 时才打印，并增加堆栈追踪
			if (typeof args !== 'undefined' && args !== null) {
				// console.log('interceptor-invoke', args)
			} else {
				console.warn('检测到拦截器 invoke 参数为 undefined/null');
				console.trace();
			}
		},
		success(args) {
			if (typeof args !== 'undefined' && args !== null) {
				// console.log('interceptor-success', args)
			}
		},
		fail(err) {
			if (typeof err !== 'undefined' && err !== null) {
				// console.error('interceptor-fail', err)
			}
		},
		complete(res) {
			if (typeof res !== 'undefined' && res !== null) {
				// console.log('interceptor-complete', res)
			}
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
 * 检查当前页面是否为公共页面
 * @returns {Boolean}
 */
const isPublicPage = () => {
	try {
		const pages = getCurrentPages()
		if (pages.length === 0) return false
		const currentPage = pages[pages.length - 1]
		const currentRoute = currentPage ? currentPage.route : ''
		
		const publicPages = [
			'pages/explore/explore/explore',
			'pages/explore/search/search',
			'pages/explore/modelDetail/modelDetail',
			'pages/explore/3Dpreviewdetail/preview3DDetail',
			'pages/explore/workDetail/workDetail',
			'pages/explore/showcaseWorksDetail/showcaseWorksDetail'
		]
		
		return publicPages.some(page => currentRoute.includes(page))
	} catch (e) {
		return false
	}
}

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
		
		// 如果是公共页面，不论是 token 失效还是用户不存在，都只清除 token 不强制跳转登录
		if (isPublicPage()) {
			return
		}

		// 获取当前页面栈
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const currentRoute = currentPage ? currentPage.route : ''

		// 根据情况显示不同的提示
		const toastTitle = isUserNotFound ? '未登录' : '登录已过期，请重新登录'
		uni.showToast({
			title: toastTitle,
			icon: 'none',
			duration: 2000
		})
		
		// 延迟跳转到登录页面，避免在请求回调中直接跳转
		setTimeout(() => {
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
	
	if (data.code === 100201) {
		return true
	}
	
	const errorMsg = (data.message || data.msg || data.error || '').toLowerCase()
	const userNotFoundKeywords = [
		'用户不存在',
		'用户id不存在',
		'没有该用户',
		'找不到用户',
		'user not found',
		'用户未找到',
		'该用户不存在'
	]
	
	if (userNotFoundKeywords.some(keyword => errorMsg.includes(keyword.toLowerCase()))) {
		return true
	}
	
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
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
			const requestPath = requestUrl.startsWith('/') ? requestUrl : '/' + requestUrl
			requestUrl = baseUrl + requestPath
		}
		
		// GET 请求参数拼接到 URL
		if (method && method.toUpperCase() === 'GET' && data && Object.keys(data).length > 0) {
			const queryString = Object.keys(data)
				.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
				.join('&')
			const separator = requestUrl.includes('?') ? '&' : '?'
			requestUrl = `${requestUrl}${separator}${queryString}`
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
		try {
			token = uni.getStorageSync('token') || ''
		} catch (e) {}

		// 卫兵逻辑：如果接口需要 Token 但本地没有，且已知该接口后端会报 500
		if (needToken && !token) {
			console.warn('检测到未登录，已拦截强制授权接口:', requestUrl)
			// 返回一个模拟的失败响应，避免触发后续的 500 逻辑
			resolve({ code: 401, msg: '未登录', data: null })
			return
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
		} else {
			// GET 请求参数已拼接在 URL 中，data 置空
			requestData = {}
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
					
					// 如果是公共页面且返回 401，直接 reject 不处理
					if (res.statusCode === 401 && isPublicPage()) {
						reject(res)
						return
					}

					// 针对后端 500 报错（Token 缺失）在公共页面的特殊处理
					const errorMsg = res.data?.msg || res.data?.message || res.data?.error || ''
					if (res.statusCode === 200 && res.data?.code === 500 && errorMsg.includes('token') && isPublicPage()) {
						console.warn('公共页面未登录访问受限接口，已静默处理:', requestUrl)
						resolve({ code: 1, data: null, msg: 'unauthorized' }) // 返回模拟成功
						return
					}

					if (!options.silent) {
						uni.showToast({
							title: errorMsg || '请求失败',
							icon: 'none'
						})
					}
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

export const postWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	if (queryParams && Object.keys(queryParams).length > 0) {
		const queryString = Object.keys(queryParams)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
			.join('&')
		const separator = url.includes('?') ? '&' : '?'
		url = `${url}${separator}${queryString}`
	}
	return request({
		url,
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

export const postFormWithQuery = (url, data = {}, queryParams = {}, options = {}) => {
	// 将数据转换为 form-urlencoded 格式
	const formData = objectToFormUrlencoded(data)
	
	// 拼接 query 参数
	if (queryParams && Object.keys(queryParams).length > 0) {
		const queryString = Object.keys(queryParams)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
			.join('&')
		const separator = url.includes('?') ? '&' : '?'
		url = `${url}${separator}${queryString}`
	}
	
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

export const uploadFile = (url, filePath, options = {}) => {
	return new Promise((resolve, reject) => {
		const {
			name = 'file',
			formData = {},
			header = {}
		} = options

		let requestUrl = url
		if (requestUrl && !requestUrl.startsWith('http')) {
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
			const requestPath = requestUrl.startsWith('/') ? requestUrl : '/' + requestUrl
			requestUrl = baseUrl + requestPath
		}

		// 添加token认证
		const needToken = !isNoTokenUrl(requestUrl)
		let token = ''
		if (needToken) {
			try {
				token = uni.getStorageSync('token') || ''
			} catch (e) {
				console.error('获取 token 失败:', e)
			}
		}

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

		uni.uploadFile({
			url: requestUrl,
			filePath: filePath,
			name: name,
			formData: formData,
			header: headers,
			success: (res) => {
				if (options.showLoading) {
					uni.hideLoading()
				}

				try {
					const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(data)
					} else {
						reject(data)
					}
				} catch (e) {
					reject(res)
				}
			},
			fail: (err) => {
				if (options.showLoading) {
					uni.hideLoading()
				}
				reject(err)
			}
		})
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
	uploadFile,
	clearCache,
	clearUrlCache
}