import { isPublicPage, isTokenInvalid, isUserNotFound } from './validators.js'
import { setCache, generateCacheKey } from './cache.js'

/**
 * 执行登出逻辑
 * 清除本地存储的token和用户信息
 * @param {Boolean} isUserNotFoundFlag 是否为用户不存在的情况
 */
export const handleLogout = (isUserNotFoundFlag = false) => {
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
		const toastTitle = isUserNotFoundFlag ? '未登录' : '登录已过期，请重新登录'
		uni.showToast({
			title: toastTitle,
			icon: 'none',
			duration: 2000
		})
		
		// 延迟跳转到登录页面，避免在请求回调中直接跳转
		setTimeout(() => {
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
 * 处理请求成功响应
 * @param {Object} res 响应对象
 * @param {Object} options 配置选项
 * @param {String} url 请求URL
 * @param {Object} data 请求数据
 * @param {Boolean} cache 是否缓存
 * @param {Number} cacheTime 缓存时间
 * @returns {Object|null} 处理后的数据或null
 */
export const handleSuccess = (res, options, url, data, cache, cacheTime) => {
	if (options.showLoading) {
		uni.hideLoading()
	}

	if (res.statusCode >= 200 && res.statusCode < 300) {
		// 缓存GET请求
		if (options.method?.toUpperCase() === 'GET' && cache) {
			const cacheKey = generateCacheKey(url, data)
			setCache(cacheKey, res.data, cacheTime)
		}
		
		// 检查用户是否存在
		if (isUserNotFound(res.data)) {
			handleLogout(true)
			return null
		}
		
		return res.data
	}

	return null
}

/**
 * 处理请求错误响应
 * @param {Object} res 响应对象
 * @param {Object} options 配置选项
 * @param {String} url 请求URL
 * @returns {Boolean} 是否已处理
 */
export const handleError = (res, options, url) => {
	if (options.showLoading) {
		uni.hideLoading()
	}

	// 检查token是否失效
	if (isTokenInvalid(res)) {
		handleLogout()
		return true
	}
	
	// 检查用户是否存在
	if (isUserNotFound(res.data)) {
		handleLogout(true)
		return true
	}
	
	// 如果是公共页面且返回 401，直接返回
	if (res.statusCode === 401 && isPublicPage()) {
		return true
	}

	// 针对后端 500 报错（Token 缺失）在公共页面的特殊处理
	const errorMsg = res.data?.msg || res.data?.message || res.data?.error || ''
	if (res.statusCode === 200 && res.data?.code === 500 && errorMsg.includes('token') && isPublicPage()) {
		console.warn('公共页面未登录访问受限接口，已静默处理:', url)
		return true
	}

	// 显示错误提示
	if (!options.silent) {
		uni.showToast({
			title: errorMsg || '请求失败',
			icon: 'none'
		})
	}

	return false
}

/**
 * 处理网络错误
 * @param {Object} err 错误对象
 * @param {Object} options 配置选项
 * @param {String} url 请求URL
 */
export const handleNetworkError = (err, options, url) => {
	if (options.showLoading) {
		uni.hideLoading()
	}

	console.error('Request fail:', {
		err,
		url,
		method: options.method || 'GET',
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
}
