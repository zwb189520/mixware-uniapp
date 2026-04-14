import { isPublicPage, isTokenInvalid, isUserNotFound } from './validators.ts'
import { setCache, generateCacheKey } from './cache.ts'
import { useUserStore } from '../stores/modules/user.ts'
import type { ApiResponse, RequestData, ApiError } from '@/types/api'

interface SuccessResponse {
  statusCode: number
  data: ApiResponse | unknown
  header?: Record<string, string>
}

interface RequestOptions {
  showLoading?: boolean
  method?: string
  silent?: boolean
}

export const handleLogout = (isUserNotFoundFlag = false): void => {
  try {
    const userStore = useUserStore()
    userStore.logout()

    if (isPublicPage()) {
      return
    }

    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage ? currentPage.route : ''

    const toastTitle = isUserNotFoundFlag ? '未登录' : '登录已过期，请重新登录'
    uni.showToast({
      title: toastTitle,
      icon: 'none',
      duration: 2000
    })

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

const isSelfUserUrl = (url: string): boolean => {
  if (!url) return false
  const selfPaths = [
    '/users/me',
    '/users/updateUserInfo',
    '/users/changePassword',
    '/users/deleteUser',
    '/users/status/'
  ]
  return selfPaths.some(path => url.includes(path))
}

export const handleSuccess = (
  res: SuccessResponse,
  options: RequestOptions,
  url: string,
  data: RequestData,
  cache: boolean,
  cacheTime: number
): ApiResponse | null => {
  if (options.showLoading) {
    uni.hideLoading()
  }

  if (res.statusCode >= 200 && res.statusCode < 300) {
    if (options.method?.toUpperCase() === 'GET' && cache) {
      const cacheKey = generateCacheKey(url, data)
      setCache(cacheKey, res.data, cacheTime)
    }

    if (isUserNotFound(res.data as { code?: string | number; message?: string; msg?: string; error?: string } | null) && isSelfUserUrl(url)) {
      handleLogout(true)
      return null
    }

    return res.data as ApiResponse<void> | null
  }

  return null
}

const handleRateLimit = (url: string): void => {
  console.warn('请求频率超限 (429):', url)
  uni.showToast({
    title: '操作太频繁，请稍后再试',
    icon: 'none',
    duration: 3000
  })
}

const handleServerError = (statusCode: number, url: string): void => {
  console.error(`服务端错误 (${statusCode}):`, url)
  const msgMap: Record<number, string> = {
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

export const handleError = (res: SuccessResponse, options: RequestOptions, url: string): boolean => {
  if (options.showLoading) {
    uni.hideLoading()
  }

  if (isTokenInvalid(res as { statusCode?: number; data?: { message?: string; error?: string } })) {
    handleLogout()
    return true
  }

  if (isUserNotFound(res.data as { code?: string | number; message?: string; msg?: string; error?: string } | null)) {
    handleLogout(true)
    return true
  }

  if (res.statusCode === 401 && isPublicPage()) {
    return true
  }

  if (res.statusCode === 429) {
    handleRateLimit(url)
    return true
  }

  if (res.statusCode >= 500 && res.statusCode < 600) {
    if (!options.silent) {
      handleServerError(res.statusCode, url)
    }
    return true
  }

  const data = res.data as Record<string, unknown> | undefined
  const errorMsg = String(data?.msg || data?.message || '')
  if (
    res.statusCode === 200 &&
    data?.code === 500 &&
    errorMsg.includes('token') &&
    isPublicPage()
  ) {
    console.warn('公共页面未登录访问受限接口，已静默处理:', url)
    return true
  }

  if (!options.silent) {
    uni.showToast({
      title: errorMsg || '请求失败',
      icon: 'none'
    })
  }

  return false
}

export const handleNetworkError = (err: ApiError, options: RequestOptions, url: string): void => {
  if (options.showLoading) {
    uni.hideLoading()
  }

  console.error('Request fail:', {
    err,
    url,
    method: options.method || 'GET',
    errMsg: err.errMsg || err.msg || '未知错误',
    errorCode: err.errCode || err.code,
    statusCode: err.statusCode
  })

  let errorMessage = '网络错误，请稍后重试'
  const errMsg = String(err.errMsg || err.msg || '')
  if (errMsg) {
    if (errMsg.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接'
    } else if (errMsg.includes('abort')) {
      errorMessage = '请求已取消'
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
