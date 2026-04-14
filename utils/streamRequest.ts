import { BASE_URL } from '../api/request.ts'
import { getToken } from '../api/utils.ts'

interface StreamRequestOptions {
  url?: string
  method?: string
  data?: Record<string, unknown>
  headers?: Record<string, string>
  onMessage?: (msg: string) => void
  onError?: (err: unknown) => void
  onComplete?: () => void
}

interface StreamRequestResult {
  abort: () => void
}

const buildFullUrl = (url = ''): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

const toQueryString = (params: Record<string, unknown> = {}): string => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key] ?? ''))}`)
    .join('&')
}

const createSSEParser = (onMessage?: (msg: string) => void): ((chunk: string) => void) => {
  let buffer = ''
  return (chunk: string) => {
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
  onMessage,
  onError,
  onComplete
}: StreamRequestOptions = {}): StreamRequestResult => {
  const finalUrl = buildFullUrl(url)
  if (!finalUrl) {
    onError?.(new Error('无效的请求 URL'))
    return { abort: () => {} }
  }

  const token = getToken(true)
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const upperMethod = method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT'
  const isGet = upperMethod === 'GET'
  const payload = isGet
    ? undefined
    : requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded'
      ? toQueryString(data)
      : JSON.stringify(data)

  const emitError = (err: unknown): void => {
    const errorMessage = (err as { message?: string })?.message || String(err) || ''
    const isAbortError =
      errorMessage.includes('aborted') ||
      errorMessage.includes('AbortError') ||
      (err as { name?: string })?.name === 'AbortError' ||
      (err instanceof DOMException && err.name === 'AbortError')

    if (isAbortError) {
      console.log('请求已中止')
      return
    }

    console.error('streamRequest error:', err)
    onError?.(err instanceof Error ? err : new Error(errorMessage || '请求失败'))
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
          onComplete?.()
        }
      }
    }

    xhr.onerror = (e: unknown) => {
      const isAbortError =
        (e as { message?: string })?.message?.includes('aborted') || String(e).includes('aborted')

      if (isAbortError) {
        console.log('请求已中止')
        return
      }

      emitError(e)
    }

    try {
      xhr.open(upperMethod as 'GET' | 'POST', finalUrl!)
      Object.keys(requestHeaders).forEach(key => {
        const headerValue = requestHeaders[key] as string
        if (headerValue) {
          (xhr as any).setRequestHeader(key, headerValue)
        }
      })
      xhr.send(payload)
    } catch (err) {
      emitError(err)
    }

    return {
      abort: () => {
        try {
          xhr.abort()
        } catch {
          console.warn('XHR abort failed')
        }
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
    })
      .then(async (res: Response) => {
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
        onComplete?.()
      })
      .catch((err: unknown) => {
        const isAbortError =
          (err as { name?: string })?.name === 'AbortError' ||
          (err as { message?: string })?.message?.includes('aborted') ||
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
    success: (res: { data: unknown }) => {
      try {
        if (typeof res.data === 'string') {
          parseChunk(res.data)
        } else if (res.data) {
          onMessage?.(JSON.stringify(res.data))
        }
      } catch (e) {
        emitError(e)
        return
      }
      onComplete?.()
    },
    fail: emitError
  })

  return { abort: () => {} }
}

export default streamRequest
