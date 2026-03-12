import { API } from '../constants/index.js'

const CACHE_PREFIX = 'api_cache_'
const DEFAULT_CACHE_TIME = API.DEFAULT_CACHE_TIME

/**
 * 生成缓存key
 * @param {String} url 请求URL
 * @param {Object} params 请求参数
 * @returns {String} 缓存key
 */
export const generateCacheKey = (url, params = {}) => {
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
export const getCache = (key) => {
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
export const setCache = (key, data, expireTime = DEFAULT_CACHE_TIME) => {
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
export const clearCache = (key) => {
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
export const clearUrlCache = (url, params = {}) => {
	const key = generateCacheKey(url, params)
	clearCache(key)
}
