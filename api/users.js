import { put, post, get, del, putWithQuery } from './request'
import { useLanguageStore, useUserStore } from '@/stores/index.js'

/**
 * 登录成功后统一同步状态到 Pinia Store 和本地存储
 * @param {Object} userInfo - 用户信息对象
 * @param {string} token - 登录 token
 */
function _syncLoginToStore(userInfo, token) {
  // 同步到 Pinia Store（唯一数据源）
  const userStore = useUserStore()
  userStore.setToken(token)
  userStore.setUserInfo(userInfo)

  // 保留零散 key 供遗留代码兼容读取
  if (userInfo.userId) uni.setStorageSync('userId', userInfo.userId)
  if (userInfo.id) uni.setStorageSync('id', userInfo.id)
  if (userInfo.username) uni.setStorageSync('username', userInfo.username)
  if (userInfo.email) uni.setStorageSync('email', userInfo.email)
  if (userInfo.accountStatus !== undefined) uni.setStorageSync('accountStatus', userInfo.accountStatus)
  // isLoggedIn 标志位保持兼容（遗留代码仍读取该 key）
  uni.setStorageSync('isLoggedIn', true)

  uni.$emit('userLogin', userInfo)
}

/**
 * 更新用户信息
 * @param {Object} userInfoDTO - 用户信息数据
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateUserInfo(userInfoDTO) {
  return put('/users/updateUserInfo', userInfoDTO)
}

/**
 * 更新用户状态
 * @param {string} userId - 用户 ID
 * @param {string} accountStatus - 账户状态
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateUserStatus(userId, accountStatus) {
  return putWithQuery(`/users/status/${userId}`, {}, { accountStatus })
}

/**
 * 第三方登录
 * @param {Object} thirdPartyLoginDTO - 第三方登录数据
 * @returns {Promise<Object>} 返回登录结果
 */
export function thirdPartyLogin(thirdPartyLoginDTO) {
  return post('/users/thirdPartyLogin', thirdPartyLoginDTO)
}

/**
 * 发送验证码
 * @param {Object} sendVerificationCodeDTO - 验证码请求数据
 * @returns {Promise<Object>} 返回发送结果
 */
export function sendVerificationCode(sendVerificationCodeDTO) {
  return post('/users/sendVerificationCode', sendVerificationCodeDTO)
}

/**
 * 用户注册
 * @param {Object} registerDTO - 注册数据
 * @returns {Promise<Object>} 返回注册结果
 */
export function register(registerDTO) {
  return post('/users/register', registerDTO)
}

/**
 * 用户登录
 * @param {Object} loginDTO - 登录数据
 * @returns {Promise<Object>} 返回登录结果
 */
export function login(loginDTO) {
  return post('/users/login', loginDTO)
}

/**
 * 用户登出
 * @returns {Promise<Object>} 返回登出结果
 */
export function logout() {
  return post('/users/logout', {})
}

/**
 * 获取用户信息
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回用户信息
 */
export function getUserInfo(userId) {
  return get(`/users/getUserInfo/${userId}`, {}, { cache: true, cacheTime: 10 * 60 * 1000 })
}

/**
 * 使用验证码登录
 * @param {Object} loginByCodeDTO - 验证码登录数据
 * @returns {Promise<Object>} 返回登录结果
 */
export function loginByCode(loginByCodeDTO) {
  return post('/users/loginByCode', loginByCodeDTO)
}

/**
 * 使用验证码登录（带处理）
 * @param {string} email - 邮箱
 * @param {string} verificationCode - 验证码
 * @returns {Promise<Object>} 返回登录结果
 */
export function loginByCodeWithHandler(email, verificationCode) {
  return post('/users/loginByCode', { email, verificationCode }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '登录失败')
    }
    const { token, userId, username, avatarUrl, id, accountStatus, birthday } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = { userId, id, username, nickname: username, avatar: finalAvatarUrl, email, accountStatus, birthday }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

/**
 * 创建用户
 * @param {Object} userCreateDTO - 用户创建数据
 * @returns {Promise<Object>} 返回创建结果
 */
export function createUser(userCreateDTO) {
  return post('/users/create', userCreateDTO)
}

/**
 * 获取用户分页列表
 * @param {Object} [params={}] - 查询参数
 * @returns {Promise<Object>} 返回用户列表
 */
export function getUserPage(params = {}) {
  return get('/users/page', params)
}

/**
 * 管理员测试接口
 * @returns {Promise<Object>} 返回测试结果
 */
export function adminTest() {
  return get('/users/admin/test')
}

/**
 * 超级管理员测试接口
 * @returns {Promise<Object>} 返回测试结果
 */
export function superAdminTest() {
  return get('/users/super/admin/test')
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 返回当前用户信息
 */
export function getCurrentUserInfo() {
  return get('/users/me', {}, { cache: true, cacheTime: 5 * 60 * 1000 })
}

/**
 * 重置密码
 * @param {Object} resetPasswordDTO - 重置密码数据
 * @returns {Promise<Object>} 返回重置结果
 */
export function resetPassword(resetPasswordDTO) {
  return post('/users/resetPassword/reset', resetPasswordDTO)
}

/**
 * 发送重置密码验证码
 * @param {string} email - 邮箱
 * @returns {Promise<Object>} 返回发送结果
 */
export function sendResetPasswordCode(email) {
  return post('/users/resetPassword/sendCode', { email })
}

/**
 * 修改密码
 * @param {Object} changePasswordDTO - 修改密码数据
 * @returns {Promise<Object>} 返回修改结果
 */
export function changePassword(changePasswordDTO) {
  return post('/users/changePassword', changePasswordDTO)
}

/**
 * 发送验证码（带处理）
 * @param {string} email - 邮箱
 * @returns {Promise<Object>} 返回发送结果
 */
export function sendVerificationCodeWithHandler(email) {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  return post('/users/sendVerificationCode', { email }).then(res => {
    if (res.code !== 1 && res.code !== 200) {
      throw new Error(res.msg || texts.sendCodeFailed || '发送验证码失败')
    }
    return res
  })
}

/**
 * 使用密码登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<Object>} 返回登录结果
 */
export function loginWithPassword(email, password) {
  return post('/users/login', { email, password }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '用户不存在')
    }
    const { token, userId, username, avatarUrl, birthday } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = { userId, username, nickname: username, avatar: finalAvatarUrl, email, birthday }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

/**
 * 注册（带处理）
 * @param {Object} registerData - 注册数据
 * @returns {Promise<Object>} 返回注册结果
 */
export function registerWithHandler(registerData) {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  const errorCodeMap = {
    100209: texts.emailExists || '邮箱已存在',
    100210: texts.codeError || '验证码错误',
    100211: texts.codeExpired || '验证码已过期'
  }

  return post('/users/register', registerData).then(res => {
    if (res.code !== 1 && res.code !== 200) {
      const errorMsg = errorCodeMap[res.code] || res.msg || texts.registerFailed || '注册失败'
      throw new Error(errorMsg)
    }
    const { token, userId, username, avatarUrl } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = { userId, username, nickname: registerData.username || username, avatar: finalAvatarUrl }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

/**
 * 删除用户
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteUser(userId) {
  return del(`/users/deleteUser/${userId}`)
}

/**
 * 第三方登录（带处理）
 * @param {string} platform - 平台名称
 * @param {string} code - 授权码
 * @param {Object} [extraData={}] - 额外数据
 * @returns {Promise<Object>} 返回登录结果
 */
export function thirdPartyLoginWithHandler(platform, code, extraData = {}) {
  return post('/users/thirdPartyLogin', { platform, code, ...extraData }).then(res => {
    const { token, userId, username, avatarUrl } = res.data

    let finalAvatarUrl = avatarUrl || extraData.avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = { userId, username, nickname: username || extraData.nickname, avatar: finalAvatarUrl }
    _syncLoginToStore(userInfo, token)
    return res
  })
}
