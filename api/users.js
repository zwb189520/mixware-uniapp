import { BASE_URL } from './config'

export function updateUserInfo(userInfoDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/updateUserInfo`,
      method: 'PUT',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: userInfoDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function updateUserStatus(userId, accountStatus) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/status/${userId}`,
      method: 'PUT',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        accountStatus: accountStatus
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function thirdPartyLogin(thirdPartyLoginDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/thirdPartyLogin`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: thirdPartyLoginDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function sendVerificationCode(sendVerificationCodeDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/sendVerificationCode`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: sendVerificationCodeDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function register(registerDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/register`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: registerDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function login(loginDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/login`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: loginDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function logout() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/logout`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '退出登录失败'))
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

export function getUserInfo(userId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/${userId}`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function getCurrentUserInfo() {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/me`,
      method: 'GET',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '获取当前用户信息失败'))
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

export function resetPassword(resetPasswordDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/resetPassword`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: resetPasswordDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '重置密码失败'))
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

export function changePassword(changePasswordDTO) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/changePassword`,
      method: 'POST',
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: changePasswordDTO,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.msg || '修改密码失败'))
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

export function sendVerificationCodeWithHandler(email) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/sendVerificationCode`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: { email },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function loginWithPassword(email, password) {
  return new Promise((resolve, reject) => {
    console.log('登录请求参数:', { email, password: '***' })
    console.log('请求URL:', `${BASE_URL}/api/users/login`)
    
    uni.request({
      url: `${BASE_URL}/api/users/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: { email, password },
      success: (res) => {
        console.log('登录API响应:', res)
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            const { token, userId, username, nickname, avatar } = res.data.data
            if (token) {
              uni.setStorageSync('token', token)
            }
            if (userId) {
              uni.setStorageSync('userId', userId)
            }
            if (username) {
              uni.setStorageSync('username', username)
            }
            
            const userInfo = {
              userId,
              username,
              nickname: nickname || username,
              avatar: avatar || '/static/default-avatar.png'
            }
            uni.setStorageSync('userInfo', userInfo)
            uni.setStorageSync('isLoggedIn', true)
            
            uni.$emit('userLogin', userInfo)
            
            resolve(res.data)
          } else {
            console.log('登录API错误:', res.data)
            reject(new Error(res.data.msg || '登录失败'))
          }
        } else {
          console.log('登录HTTP错误:', res.statusCode)
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.log('登录网络错误:', err)
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

export function registerWithHandler(registerData) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/register`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: registerData,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            const { token, userId, username } = res.data.data
            if (token) {
              uni.setStorageSync('token', token)
            }
            if (userId) {
              uni.setStorageSync('userId', userId)
            }
            if (username) {
              uni.setStorageSync('username', username)
            }
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

export function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.request({
      url: `${BASE_URL}/api/users/deleteUser/${userId}`,
      method: 'DELETE',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
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

export function thirdPartyLoginWithHandler(platform, code, extraData = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/users/thirdPartyLogin`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        platform,
        code,
        ...extraData
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            const { token, userId, username } = res.data.data
            if (token) {
              uni.setStorageSync('token', token)
            }
            if (userId) {
              uni.setStorageSync('userId', userId)
            }
            if (username) {
              uni.setStorageSync('username', username)
            }
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