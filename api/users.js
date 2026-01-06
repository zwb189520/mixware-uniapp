const BASE_URL = 'http://app.mixwarebot.cn'

// 用户登录
export function login(email, password) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email,
        password
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '登录失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 验证码登录
export function loginByCode(email, verificationCode) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/loginByCode`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email,
        verificationCode
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '验证码登录失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 用户注册
export function register(userData) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/register`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        username: userData.username || '',
        birthday: userData.birthday || '',
        countryCode: userData.countryCode || '',
        privacyAgreed: userData.privacyAgreed || false,
        marketingOptIn: userData.marketingOptIn || false,
        verificationCode: userData.verificationCode
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '注册失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 发送验证码
export function sendVerificationCode(email) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/sendVerificationCode`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        email
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '发送验证码失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 第三方登录
export function thirdPartyLogin(thirdPartyData) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/thirdPartyLogin`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: thirdPartyData,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '第三方登录失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 获取用户信息
export function getUserInfo(id) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/getUserInfo/${id}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取用户信息失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 更新用户信息
export function updateUserInfo(userInfo) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/updateUserInfo`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: userInfo,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '更新用户信息失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 用户登出
export function logout() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/logout`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '登出失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 发送验证码（带自动处理）
export async function sendVerificationCodeWithHandler(email) {
  try {
    const res = await sendVerificationCode(email)
    return res
  } catch (error) {
    throw error
  }
}

// 密码登录（带自动处理）
export async function loginWithPassword(email, password) {
  try {
    const res = await login(email, password)
    
    // 保存用户信息
    const userInfo = {
      id: res.data.userId,
      nickname: res.data.username,
      email: email,
      avatar: res.data.avatarUrl || '',
      accountStatus: res.data.accountStatus
    }
    
    // 保存token
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    
    return res
  } catch (error) {
    throw error
  }
}

// 验证码登录（带自动处理）
export async function loginWithCode(email, verificationCode) {
  try {
    const res = await loginByCode(email, verificationCode)
    
    // 保存用户信息
    const userInfo = {
      id: res.data.userId,
      nickname: res.data.username,
      email: email,
      avatar: res.data.avatarUrl || '',
      accountStatus: res.data.accountStatus
    }
    
    // 保存token
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    
    return res
  } catch (error) {
    throw error
  }
}

// 注册（带自动处理）
export async function registerWithHandler(userData) {
  try {
    const res = await register(userData)
    
    // 保存用户信息
    const userInfo = {
      id: res.data.userId,
      nickname: res.data.username,
      email: userData.email,
      avatar: res.data.avatarUrl || '',
      accountStatus: res.data.accountStatus
    }
    
    // 保存token
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    
    return res
  } catch (error) {
    throw error
  }
}

// 更新用户状态
export function updateUserStatus(userId, accountStatus) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/status/${userId}`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        accountStatus
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '更新用户状态失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 创建用户
export function createUser(userData) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/create`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        email: userData.email,
        password: userData.password,
        username: userData.username || '',
        avatarUrl: userData.avatarUrl || '',
        birthday: userData.birthday || '',
        countryCode: userData.countryCode || '',
        accountStatus: userData.accountStatus || 1,
        privacyAgreed: userData.privacyAgreed || false,
        marketingOptIn: userData.marketingOptIn || false
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '创建用户失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 获取用户分页列表
export function getUserPage(params) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/page`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        current: params.current || 1,
        size: params.size || 10,
        username: params.username || '',
        email: params.email || '',
        accountStatus: params.accountStatus || '',
        sort: params.sort || '',
        order: params.order || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取用户列表失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 删除用户
export function deleteUser(id) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/deleteUser/${id}`,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '删除用户失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 批量删除用户
export function deleteUsers(ids) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/users/batch`,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: ids,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '批量删除用户失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 添加模型收藏
export function addModelFavorite(modelId, groupId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/user-model-favorite/add`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        modelId,
        groupId: groupId || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '添加收藏失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 取消模型收藏
export function cancelModelFavorite(modelId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${BASE_URL}/api/user-model-favorite/cancel`,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      data: {
        modelId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '取消收藏失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

// 第三方登录（带自动处理）
export async function thirdPartyLoginWithHandler(platform, code, userInfo = {}) {
  try {
    const loginData = {
      platform,
      code,
      nickname: userInfo.nickname || '',
      avatarUrl: userInfo.avatarUrl || '',
      email: userInfo.email || ''
    }
    
    const res = await thirdPartyLogin(loginData)
    
    // 保存用户信息
    const savedUserInfo = {
      id: res.data.userId,
      nickname: res.data.username,
      email: res.data.email || '',
      avatar: res.data.avatarUrl || '',
      accountStatus: res.data.accountStatus
    }
    
    // 保存token
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', savedUserInfo)
    uni.setStorageSync('isLoggedIn', true)
    
    return res
  } catch (error) {
    throw error
  }
}

// 登出（带自动处理）
export function logoutWithHandler() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('isLoggedIn')
}