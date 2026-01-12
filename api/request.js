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
export const BASE_URL = 'http://app.mixwarebot.cn:8080/api'  // 默认80端口
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
		// 显示加载提示
		if (options.showLoading) {
			uni.showLoading({
				title: options.loadingText || '加载中...',
				mask: true
			})
		}

		// 处理 URL
		let url = options.url
		if (url && !url.startsWith('http')) {
			// 确保 BASE_URL 和 url 正确拼接
			const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
			const requestPath = url.startsWith('/') ? url : '/' + url
			url = baseUrl + requestPath
		}
		
		// 验证 URL 格式
		if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
			console.error('无效的请求 URL:', url)
			reject(new Error('无效的请求 URL'))
			return
		}

		// 检查是否为不需要token的接口
		const needToken = !isNoTokenUrl(url)
		
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
		let requestData = options.data || {}
		const contentType = (headers['Content-Type'] || '').toLowerCase()
		if (options.method && options.method.toUpperCase() !== 'GET') {
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
		console.log('请求URL:', url || options.url)
		console.log('请求方法:', options.method || 'GET')
		console.log('请求头:', headers)
		console.log('请求原始数据(options.data):', options.data || {})
		console.log('请求实际发送数据(requestData):', requestData)
		console.log('BASE_URL:', BASE_URL)
		console.log('================')
		
		uni.request({
			url: url || options.url,
			method: options.method || 'GET',
			data: requestData,
			header: headers,
			timeout: options.timeout || 10000, // 默认10秒超时
			sslVerify: options.sslVerify !== false, // 默认验证SSL证书
			success: (res) => {
				// 隐藏加载提示
				if (options.showLoading) {
					uni.hideLoading()
				}

				// 判断请求是否成功（状态码 200-299）
				if (res.statusCode >= 200 && res.statusCode < 300) {
					// 检查响应数据是否表示用户不存在
					if (isUserNotFound(res.data)) {
						// 用户不存在，立即清除缓存并显示未登录
						handleLogout(true)
						reject(res)
						return
					}
					
					resolve(res.data)
				} else {
					// 检查是否是token失效
					if (isTokenInvalid(res)) {
						// 执行登出逻辑
						handleLogout()
						reject(res)
						return
					}
					
					// 检查错误响应是否表示用户不存在
					if (isUserNotFound(res.data)) {
						// 用户不存在，立即清除缓存并显示未登录
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
			},
			fail: (err) => {
				// 隐藏加载提示
				if (options.showLoading) {
					uni.hideLoading()
				}

				// 输出详细的错误信息
				console.error('Request fail:', {
					err,
					url: url || options.url,
					method: options.method || 'GET',
					errMsg: err.errMsg || err.message || '未知错误',
					errorCode: err.errCode || err.code,
					statusCode: err.statusCode
				})
				
				// 根据错误类型提供更具体的提示
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
			}
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
	postForm
}