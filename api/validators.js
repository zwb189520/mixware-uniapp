/**
 * 检查URL是否为不需要token的接口
 * @param {String} url 请求URL
 * @returns {Boolean} 是否需要token
 */
export const isNoTokenUrl = (url) => {
	if (!url) return false
	
	// 基础免登录路径 - 精确匹配或前缀匹配
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
		'/community/list'
	]
	
	// 精确前缀匹配
	const isNoTokenPath = noTokenPaths.some(path => {
		// 对于 /community/posts，需要区分 GET（列表）和 POST（创建）
		if (path === '/community/posts') {
			// 这里无法判断 HTTP 方法，建议在 request.js 中传入 method 参数
			// 暂时允许所有 /community/posts 请求，实际应该在调用处控制
			return url.includes(path)
		}
		return url.includes(path)
	})
	
	if (isNoTokenPath) {
		return true
	}
	
	// 特殊处理：/models/{id} 等详情接口（GET 请求）
	// 只允许 GET 模型详情，不允许 POST/PUT/DELETE
	if (url.includes('/models/') && 
		!url.includes('/models/page') && 
		!url.includes('/models/list') &&
		!url.includes('/models/add') && 
		!url.includes('/models/delete') && 
		!url.includes('/models/update') && 
		!url.includes('/models/my') &&
		!url.includes('/models/scaleAndSlice') &&
		!url.includes('/models/enlarge') &&
		!url.includes('/models/audit')) {
		// 这是一个模型详情接口，允许未登录访问
		return true
	}
	
	return false
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
			'pages/explore/printDetail/printDetail',
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
