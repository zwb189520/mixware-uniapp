# 项目优化方案 - 第一部分

## 📊 优化优先级

### 🔴 高优先级（立即优化）
1. **request.js 文件拆分** - 823行，职责混乱
2. **Store 中的重复逻辑** - saveToStorage/initFromStorage 重复
3. **缓存策略优化** - 缺少智能失效机制
4. **错误处理统一** - 没有统一的错误处理规范

### 🟡 中优先级（近期优化）
5. **API 接口参数验证** - 缺少参数校验
6. **性能监控** - 缺少请求性能统计
7. **内存泄漏风险** - Store 中的大数据缓存
8. **网络状态管理** - 缺少离线处理

### 🟢 低优先级（后期优化）
9. **代码复用** - 提取通用工具函数
10. **TypeScript 迁移** - 增强类型安全

---

## 🔧 具体优化方案

### 1️⃣ request.js 文件拆分（823行 → 多个小文件）

**问题：**
- 混合了缓存、拦截器、请求逻辑、错误处理
- 难以维护和测试
- 职责不清晰

**优化方案：**

```
api/
├── request.js          # 核心请求函数（保留）
├── interceptor.js      # 请求拦截器
├── cache.js            # 缓存管理
├── errorHandler.js     # 错误处理
└── constants.js        # 常量定义
```

**创建 api/cache.js：**

```javascript
// 缓存配置
const CACHE_PREFIX = 'api_cache_'
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5分钟

class CacheManager {
  constructor() {
    this.memoryCache = new Map() // 内存缓存，更快
  }

  generateKey(url, params = {}) {
    const paramStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&')
    return `${CACHE_PREFIX}${url}_${paramStr}`
  }

  get(key) {
    // 先查内存缓存
    if (this.memoryCache.has(key)) {
      const { data, expireTime } = this.memoryCache.get(key)
      if (Date.now() < expireTime) {
        return data
      }
      this.memoryCache.delete(key)
    }

    // 再查本地存储
    try {
      const cacheData = uni.getStorageSync(key)
      if (!cacheData) return null
      
      const { data, timestamp, expireTime } = JSON.parse(cacheData)
      if (Date.now() - timestamp > expireTime) {
        uni.removeStorageSync(key)
        return null
      }
      
      // 回写到内存缓存
      this.memoryCache.set(key, { data, expireTime: Date.now() + expireTime })
      return data
    } catch (e) {
      console.error('获取缓存失败:', e)
      return null
    }
  }

  set(key, data, expireTime = DEFAULT_CACHE_TIME) {
    try {
      // 写入内存缓存
      this.memoryCache.set(key, { 
        data, 
        expireTime: Date.now() + expireTime 
      })

      // 写入本地存储
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

  clear(key) {
    if (key) {
      this.memoryCache.delete(key)
      uni.removeStorageSync(key)
    } else {
      this.memoryCache.clear()
      const storage = uni.getStorageInfoSync()
      storage.keys.forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          uni.removeStorageSync(k)
        }
      })
    }
  }

  clearByUrl(url, params = {}) {
    const key = this.generateKey(url, params)
    this.clear(key)
  }
}

export default new CacheManager()
```

**创建 api/errorHandler.js：**

```javascript
class ErrorHandler {
  constructor() {
    this.errorCallbacks = []
  }

  // 注册错误回调
  onError(callback) {
    this.errorCallbacks.push(callback)
  }

  // 处理错误
  handle(error, context = {}) {
    const { url, data, statusCode } = context

    // 分类处理错误
    if (statusCode === 401 || statusCode === 403) {
      this.handleAuthError(error, context)
    } else if (statusCode === 404) {
      this.handleNotFoundError(error, context)
    } else if (statusCode >= 500) {
      this.handleServerError(error, context)
    } else if (statusCode === 0) {
      this.handleNetworkError(error, context)
    } else {
      this.handleBusinessError(error, context)
    }

    // 触发所有回调
    this.errorCallbacks.forEach(cb => cb(error, context))
  }

  handleAuthError(error, context) {
    console.error('认证失败:', error)
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    // 跳转到登录页
    uni.navigateTo({ url: '/pagesMember/auth/login/login' })
  }

  handleNotFoundError(error, context) {
    console.error('资源不存在:', error)
    uni.showToast({ title: '资源不存在', icon: 'none' })
  }

  handleServerError(error, context) {
    console.error('服务器错误:', error)
    uni.showToast({ title: '服务器错误，请稍后重试', icon: 'none' })
  }

  handleNetworkError(error, context) {
    console.error('网络错误:', error)
    uni.showToast({ title: '网络连接失败', icon: 'none' })
  }

  handleBusinessError(error, context) {
    console.error('业务错误:', error)
    const message = error.message || '操作失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

export default new ErrorHandler()
```

---

### 2️⃣ Store 中的重复逻辑提取

**问题：**
- `explore.js` 和 `chat.js` 都有 `saveToStorage/initFromStorage`
- 代码重复，难以维护

**优化方案：**

创建 `composables/useStorageSync.js`：

```javascript
import { ref } from 'vue'

/**
 * 通用的存储同步 Hook
 * @param {String} storageKey - 本地存储的 key
 * @param {Object} initialState - 初始状态
 * @returns {Object} 状态和方法
 */
export function useStorageSync(storageKey, initialState = {}) {
  const state = ref({ ...initialState })

  // 从本地存储初始化
  const initFromStorage = () => {
    try {
      const storedData = uni.getStorageSync(storageKey)
      if (storedData) {
        state.value = { ...state.value, ...storedData }
      }
    } catch (e) {
      console.warn(`从本地存储加载 ${storageKey} 失败:`, e)
    }
  }

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      uni.setStorageSync(storageKey, state.value)
    } catch (e) {
      console.warn(`保存 ${storageKey} 到本地存储失败:`, e)
    }
  }

  // 清除本地存储
  const clearStorage = () => {
    try {
      uni.removeStorageSync(storageKey)
      state.value = { ...initialState }
    } catch (e) {
      console.warn(`清除 ${storageKey} 失败:`, e)
    }
  }

  return {
    state,
    initFromStorage,
    saveToStorage,
    clearStorage
  }
}
```

**优化后的 explore.js：**

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorageSync } from '@/composables/useStorageSync'

export const useExploreStore = defineStore('explore', () => {
  const currentTab = ref('daily')
  const keyword = ref('')
  const showSearch = ref(false)
  const hotTags = ref([])
  const dailyModels = ref([])
  const hotModels = ref([])
  const categoryModels = ref([])
  const loading = ref(false)

  // 使用通用 Hook
  const { state: storageState, initFromStorage, saveToStorage } = useStorageSync('exploreData', {
    dailyModels: [],
    hotModels: [],
    categoryModels: [],
    hotTags: []
  })

  const dailyLeftList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 0))
  const dailyRightList = computed(() => dailyModels.value.filter((_, i) => i % 2 === 1))
  const hotLeftList = computed(() => hotModels.value.filter((_, i) => i % 2 === 0))
  const hotRightList = computed(() => hotModels.value.filter((_, i) => i % 2 === 1))
  const categoryLeftList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 0))
  const categoryRightList = computed(() => categoryModels.value.filter((_, i) => i % 2 === 1))

  function setCurrentTab(tab) {
    currentTab.value = tab
  }

  function setKeyword(value) {
    keyword.value = value
  }

  function setShowSearch(value) {
    showSearch.value = value
  }

  function setHotTags(tags) {
    hotTags.value = tags
  }

  function setDailyModels(models) {
    dailyModels.value = models
    storageState.value.dailyModels = models
    saveToStorage()
  }

  function setHotModels(models) {
    hotModels.value = models
    storageState.value.hotModels = models
    saveToStorage()
  }

  function setCategoryModels(models) {
    categoryModels.value = models
    storageState.value.categoryModels = models
    saveToStorage()
  }

  function setLoading(value) {
    loading.value = value
  }

  return {
    currentTab,
    keyword,
    showSearch,
    hotTags,
    dailyModels,
    hotModels,
    categoryModels,
    loading,
    dailyLeftList,
    dailyRightList,
    hotLeftList,
    hotRightList,
    categoryLeftList,
    categoryRightList,
    setCurrentTab,
    setKeyword,
    setShowSearch,
    setHotTags,
    setDailyModels,
    setHotModels,
    setCategoryModels,
    setLoading,
    initFromStorage
  }
})
```

---

### 3️⃣ 缓存策略优化

**问题：**
- 缓存没有智能失效机制
- 大数据缓存可能导致存储溢出
- 没有缓存预热策略

**优化方案：**

```javascript
// api/cache.js 增强版本

class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.cacheStats = new Map() // 缓存统计
    this.MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
  }

  // 获取缓存大小
  getCacheSize() {
    let size = 0
    this.memoryCache.forEach(({ data }) => {
      size += JSON.stringify(data).length
    })
    return size
  }

  // 智能清理缓存（LRU 算法）
  cleanupCache() {
    if (this.getCacheSize() > this.MAX_CACHE_SIZE) {
      // 按访问时间排序，删除最久未使用的
      const sorted = Array.from(this.cacheStats.entries())
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      
      // 删除前 20% 的缓存
      const toDelete = Math.ceil(sorted.length * 0.2)
      for (let i = 0; i < toDelete; i++) {
        this.memoryCache.delete(sorted[i][0])
        this.cacheStats.delete(sorted[i][0])
      }
    }
  }

  get(key) {
    // 更新访问统计
    if (this.cacheStats.has(key)) {
      this.cacheStats.get(key).lastAccess = Date.now()
      this.cacheStats.get(key).accessCount++
    }

    // ... 原有逻辑
  }

  set(key, data, expireTime = DEFAULT_CACHE_TIME) {
    // 检查缓存大小
    this.cleanupCache()

    // 记录统计信息
    this.cacheStats.set(key, {
      lastAccess: Date.now(),
      accessCount: 0,
      createTime: Date.now()
    })

    // ... 原有逻辑
  }

  // 获取缓存统计
  getStats() {
    return {
      totalSize: this.getCacheSize(),
      cacheCount: this.memoryCache.size,
      stats: Array.from(this.cacheStats.entries()).map(([key, stat]) => ({
        key,
        ...stat
      }))
    }
  }
}
```
