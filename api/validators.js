/**
 * 检查URL是否为不需要token的接口
 * @param {String} url 请求URL
 * @returns {Boolean} 是否需要token
 */
export const isNoTokenUrl = (url) => {
	if (!url) return false
	
	// 基础免登录路径
	const noTokenPaths = [
		'/users/login', 
		'/users/register', 
		'/users/signup',
		'/users/sendVerificationCode',
		'/users/thirdPartyLogin',
		'/users/resetPassword',
		'/users/loginByCode',
		'/auth/oauth/callback',
		'/auth/google/config',
		'/auth/apple/config',
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
		const parts = url.split('/')
		const lastPart = parts[parts.length - 1]
		if (lastPart && lastPart.length > 10) {
			return true
		}
	}
	
	return noTokenPaths.some(path => url.includes(path))
}

/**
 * 检查当前页面是否为公共页面
 * @returns {Boolean}
 */
export const isPublicPage = () => {
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
 * 检查响应是否表示token失效
 * @param {Object} res 响应对象
 * @returns {Boolean} 是否表示token失效
 */
export const isTokenInvalid = (res) => {
	if (res.statusCode === 401) {
		return true
	}
	
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
 * 检查响应数据是否表示用户不存在
 * @param {Object} data 响应数据
 * @returns {Boolean} 是否表示用户不存在
 */
export const isUserNotFound = (data) => {
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
 * 检查请求数据是否包含NaN
 * @param {Object} obj 对象
 * @returns {Boolean} 是否包含NaN
 */
export const hasNaN = (obj) => {
	if (!obj) return false
	return Object.values(obj).some(val => 
		(typeof val === 'number' && isNaN(val)) || 
		val === 'NaN' || 
		(typeof val === 'string' && val.includes('targetId=NaN'))
	)
}
