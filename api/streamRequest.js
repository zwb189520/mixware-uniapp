import { BASE_URL } from './request.js'

const buildFullUrl = (url = '') => {
	if (!url) return ''
	if (url.startsWith('http')) return url
	const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
	const path = url.startsWith('/') ? url : `/${url}`
	return `${base}${path}`
}

const toQueryString = (params = {}) => {
	return Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
		.join('&')
}

const createSSEParser = (onMessage) => {
	let buffer = ''
	return (chunk) => {
		if (!chunk) return
		buffer += chunk
		const parts = buffer.split(/\r?\n\r?\n/)
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
		const errorMessage = err?.message || err?.toString() || ''
		const isAbortError = 
			errorMessage.includes('aborted') || 
			errorMessage.includes('AbortError') ||
			err?.name === 'AbortError' ||
			(err instanceof DOMException && err.name === 'AbortError')
		
		if (isAbortError) {
			console.log('请求已中止')
			return
		}
		
		console.error('streamRequest error:', err)
		onError(err instanceof Error ? err : new Error(err?.message || '请求失败'))
	}

	const parseChunk = createSSEParser(onMessage)

	if (typeof plus !== 'undefined' && plus?.net?.XMLHttpRequest) {
		const xhr = new plus.net.XMLHttpRequest()
		let lastLength = 0

		xhr.onreadystatechange = () => {
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
				const text = await res.text()
				parseChunk(text)
			}
			onComplete()
		}).catch((err) => {
			const isAbortError = 
				err?.name === 'AbortError' ||
				err?.message?.includes('aborted') ||
				(err instanceof DOMException && err.name === 'AbortError')
			
			if (isAbortError) {
				console.log('请求已中止')
				return
			}
			
			emitError(err)
		})

		return {
			abort: () => controller.abort()
		}
	}

	uni.request({
		url: finalUrl,
		method: upperMethod,
		header: requestHeaders,
		data,
		success: (res) => {
			try {
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
