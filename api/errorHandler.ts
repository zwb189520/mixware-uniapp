import { isPublicPage, isTokenInvalid, isUserNotFound } from './validators.ts'
import { setCache, generateCacheKey } from './cache.ts'
import { useUserStore } from '../stores/modules/user.ts'

interface ApiResponse {
  statusCode: number
  data: {
    code?: number | string
    msg?: string
    message?: string
    error?: string
    [key: string]: unknown
  }
}

interface RequestOptions {
  showLoading?: boolean
  method?: string
  silent?: boolean
  [key: string]: unknown
}

export const handleLogout = (isUserNotFoundFlag = false): void => {
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
  res: ApiResponse,
  options: RequestOptions,
  url: string,
  data: Record<string, unknown>,
  cache: boolean,
  cacheTime: number
): unknown => {
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

export const handleError = (res: ApiResponse, options: RequestOptions, url: string): boolean => {
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
  if (
    res.statusCode === 200 &&
    res.data?.code === 500 &&
    errorMsg.includes('token') &&
    isPublicPage()
  ) {
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

export const handleNetworkError = (err: Record<string, unknown>, options: RequestOptions, url: string): void => {
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
  const errMsg = String(err.errMsg || err.message || '')
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
