import { API } from '../constants/index.ts'

const CACHE_PREFIX = 'api_cache_'
const DEFAULT_CACHE_TIME = API.DEFAULT_CACHE_TIME

interface CacheData {
	data: unknown
	timestamp: number
	expireTime: number
}

/**
 * 生成缓存key
 * @param url 请求URL
 * @param params 请求参数
 */
export const generateCacheKey = (url: string, params: Record<string, unknown> = {}): string => {
	const paramStr = Object.keys(params)
		.sort()
		.map(key => `${key}=${JSON.stringify(params[key])}`)
		.join('&')
	return `${CACHE_PREFIX}${url}_${paramStr}`
}

/**
 * 获取缓存数据
 * @param key 缓存key
 */
export const getCache = (key: string): unknown | null => {
	try {
		const cacheData = uni.getStorageSync(key) as string | undefined
		if (!cacheData) return null
		
		const { data, timestamp, expireTime } = JSON.parse(cacheData) as CacheData
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
 * @param key 缓存key
 * @param data 缓存数据
 * @param expireTime 过期时间（毫秒）
 */
export const setCache = (key: string, data: unknown, expireTime = DEFAULT_CACHE_TIME): void => {
	try {
		const cacheData: CacheData = {
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
 * @param key 缓存key，不传则清除所有缓存
 */
export const clearCache = (key?: string): void => {
	try {
		if (key) {
			uni.removeStorageSync(key)
		} else {
			const storage = uni.getStorageInfoSync()
			storage.keys.forEach((k: string) => {
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
 * @param url 请求URL
 * @param params 请求参数
 */
export const clearUrlCache = (url: string, params: Record<string, unknown> = {}): void => {
	const key = generateCacheKey(url, params)
	clearCache(key)
}
