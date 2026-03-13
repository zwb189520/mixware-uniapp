import { isPublicPage, isTokenInvalid, isUserNotFound } from './validators.js'
import { setCache, generateCacheKey } from './cache.js'
import { useUserStore } from '../stores/modules/user.js'

/**
 * 执行登出逻辑
 * 清除本地存储的token和用户信息
 * @param {Boolean} isUserNotFoundFlag 是否为用户不存在的情况
 */
export const handleLogout = (isUserNotFoundFlag = false) => {
	try {
		// 通过 Store 统一清除登录信息，确保状态一致
		const userStore = useUserStore()
		userStore.logout()
		
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
			if (currentRoute !== '/pagesMember/auth/login/login') {
				uni.reLaunch({
					url: '/pagesMember/auth/login/login'
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
/**
 * 判断当前请求是否为当前登录用户自身的接口
 * 只有操作自身账户的接口返回"用户不存在"才应触发登出
 * 查看他人主页等接口返回"用户不存在"不应影响当前用户的登录态
 * @param {String} url 请求URL
 * @returns {Boolean}
 */
const isSelfUserUrl = (url) => {
	if (!url) return false
	// 明确属于当前用户自身操作的接口
	const selfPaths = [
		'/users/me',
		'/users/updateUserInfo',
		'/users/changePassword',
		'/users/deleteUser',
		'/users/status/'
	]
	return selfPaths.some(path => url.includes(path))
}

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
		
		// 仅在操作自身账户的接口返回"用户不存在"时才触发登出
		// 查看他人主页、搜索用户等接口的"用户不存在"不影响当前登录态
		if (isUserNotFound(res.data) && isSelfUserUrl(url)) {
			handleLogout(true)
			return null
		}
		
		return res.data
	}

	return null
}

/**
 * 处理 429 限流
 * @param {String} url 请求URL
 */
const handleRateLimit = (url) => {
	console.warn('请求频率超限 (429):', url)
	uni.showToast({
		title: '操作太频繁，请稍后再试',
		icon: 'none',
		duration: 3000
	})
}

/**
 * 处理服务端 5xx 错误
 * @param {Number} statusCode HTTP状态码
 * @param {String} url 请求URL
 */
const handleServerError = (statusCode, url) => {
	console.error(`服务端错误 (${statusCode}):`, url)
	const msgMap = {
		500: '服务器内部错误，请稍后重试',
		502: '网关错误，请稍后重试',
		503: '服务暂时不可用，请稍后重试',
		504: '网关超时，请检查网络'
	}
	uni.showToast({
		title: msgMap[statusCode] || `服务异常 (${statusCode})`,
		icon: 'none',
		duration: 3000
	})
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

	// 处理 429 限流
	if (res.statusCode === 429) {
		handleRateLimit(url)
		return true
	}

	// 处理 5xx 服务端错误
	if (res.statusCode >= 500 && res.statusCode < 600) {
		if (!options.silent) {
			handleServerError(res.statusCode, url)
		}
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
	const errMsg = err.errMsg || err.message || ''
	if (errMsg) {
		if (errMsg.includes('timeout')) {
			errorMessage = '请求超时，请检查网络连接'
		} else if (errMsg.includes('abort')) {
			errorMessage = '请求已取消'
			// 请求被主动取消时不弹提示
			return
		} else if (errMsg.includes('ssl') || errMsg.includes('certificate')) {
			errorMessage = '证书验证失败，请检查网络环境'
		} else if (errMsg.includes('fail') && (errMsg.includes('http') || errMsg.includes('connect'))) {
			errorMessage = '无法连接到服务器，请检查网络'
		} else {
			errorMessage = `网络错误: ${errMsg}`
		}
	}

	if (!options.silent) {
		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 3000
		})
	}
}
