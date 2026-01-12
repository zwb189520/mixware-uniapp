import { BASE_URL } from './request.js'

/**
 * 将 url 与 BASE_URL 拼接为完整地址
 */
const buildFullUrl = (url = '') => {
	if (!url) return ''
	if (url.startsWith('http')) return url
	const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
	const path = url.startsWith('/') ? url : `/${url}`
	return `${base}${path}`
}

/**
 * 将对象转为 querystring
 */
const toQueryString = (params = {}) => {
	return Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
		.join('&')
}

/**
 * 解析 SSE 文本块，逐条触发 onMessage
 */
const createSSEParser = (onMessage) => {
	let buffer = ''
	return (chunk) => {
		if (!chunk) return
		buffer += chunk
		// 以空行分割事件（\n\n 或 \r\n\r\n）
		const parts = buffer.split(/\r?\n\r?\n/)
		// 最后一个可能是不完整的，留在 buffer
		buffer = parts.pop() || ''
		parts.forEach(part => {
			const lines = part.split(/\r?\n/)
			lines.forEach(line => {
				if (line.startsWith('data:')) {
					const data = line.replace(/^data:\s*/, '')
					if (data === '[DONE]') return
					onMessage?.(data)
				}
			})
		})
	}
}

/**
 * 通用流式请求（SSE/分块）工具
 * 支持：App 原生（plus.net.XMLHttpRequest）与 H5(fetch)
 * @returns {Object} controller { abort }
 */
export const streamRequest = ({
	url = '',
	method = 'POST',
	data = {},
	headers = {},
	onMessage = () => {},
	onError = () => {},
	onComplete = () => {}
} = {}) => {
	const finalUrl = buildFullUrl(url)
	if (!finalUrl) {
		onError(new Error('无效的请求 URL'))
		return {}
	}

	// 处理 header & token
	const token = (() => {
		try { return uni.getStorageSync('token') || '' } catch (e) { return '' }
	})()
	const requestHeaders = {
		'Content-Type': 'application/json',
		...headers
	}
	if (token) {
		requestHeaders['Authorization'] = `Bearer ${token}`
	}

	const upperMethod = method.toUpperCase()
	const isGet = upperMethod === 'GET'
	const payload = isGet ? null : (
		requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded'
			? toQueryString(data)
			: JSON.stringify(data)
	)

	const emitError = (err) => {
		// 忽略用户主动中止请求的错误（这是正常行为）
		const errorMessage = err?.message || err?.toString() || ''
		const isAbortError = 
			errorMessage.includes('aborted') || 
			errorMessage.includes('AbortError') ||
			err?.name === 'AbortError' ||
			(err instanceof DOMException && err.name === 'AbortError')
		
		if (isAbortError) {
			// 用户主动中止，不触发错误回调，只记录日志
			console.log('请求已中止')
			return
		}
		
		console.error('streamRequest error:', err)
		onError(err instanceof Error ? err : new Error(err?.message || '请求失败'))
	}

	const parseChunk = createSSEParser(onMessage)

	// App 端（plus）优先：具备 onprogress 能接收流
	if (typeof plus !== 'undefined' && plus?.net?.XMLHttpRequest) {
		const xhr = new plus.net.XMLHttpRequest()
		let lastLength = 0

		xhr.onreadystatechange = () => {
			// readyState 3(LOADING) 和 4(DONE) 读取增量
			if (xhr.readyState === 3 || xhr.readyState === 4) {
				const text = xhr.responseText || ''
				const chunk = text.substring(lastLength)
				lastLength = text.length
				parseChunk(chunk)
				if (xhr.readyState === 4) {
					onComplete()
				}
			}
		}

		xhr.onerror = (e) => {
			// App 端中止请求时也可能触发错误，需要检查
			const isAbortError = 
				e?.message?.includes('aborted') ||
				e?.toString()?.includes('aborted')
			
			if (isAbortError) {
				console.log('请求已中止')
				return
			}
			
			emitError(e)
		}

		try {
			xhr.open(upperMethod, finalUrl)
			Object.keys(requestHeaders).forEach(key => {
				if (requestHeaders[key] !== undefined && requestHeaders[key] !== null) {
					xhr.setRequestHeader(key, requestHeaders[key])
				}
			})
			xhr.send(payload)
		} catch (err) {
			emitError(err)
		}

		return {
			abort: () => {
				try { xhr.abort() } catch (e) {}
			}
		}
	}

	// H5 环境：使用 fetch + readable stream
	if (typeof fetch === 'function') {
		const controller = new AbortController()
		fetch(finalUrl, {
			method: upperMethod,
			headers: requestHeaders,
			body: isGet ? null : payload,
			signal: controller.signal
		}).then(async (res) => {
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`)
			}
			// 可读流处理
			const reader = res.body?.getReader()
			if (reader) {
				const decoder = new TextDecoder('utf-8')
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					const chunk = decoder.decode(value, { stream: true })
					parseChunk(chunk)
				}
			} else {
				// 不支持流，直接一次性读取文本
				const text = await res.text()
				parseChunk(text)
			}
			onComplete()
		}).catch((err) => {
			// 检查是否是用户主动中止的错误
			const isAbortError = 
				err?.name === 'AbortError' ||
				err?.message?.includes('aborted') ||
				(err instanceof DOMException && err.name === 'AbortError')
			
			if (isAbortError) {
				// 用户主动中止，不触发错误回调
				console.log('请求已中止')
				return
			}
			
			emitError(err)
		})

		return {
			abort: () => controller.abort()
		}
	}

	// 兜底：使用 uni.request（不支持流，作为兼容）
	uni.request({
		url: finalUrl,
		method: upperMethod,
		header: requestHeaders,
		data,
		success: (res) => {
			try {
				// 尝试解析 data 字段
				if (typeof res.data === 'string') {
					parseChunk(res.data)
				} else if (res.data) {
					onMessage(JSON.stringify(res.data))
				}
			} catch (e) {
				emitError(e)
				return
			}
			onComplete()
		},
		fail: emitError
	})

	return {}
}

export default streamRequest

