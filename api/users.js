import { put, post, get, del } from './request'

export function updateUserInfo(userInfoDTO) {
  return put('/users/updateUserInfo', userInfoDTO)
}

export function updateUserStatus(userId, accountStatus) {
  return put(`/users/status/${userId}?accountStatus=${accountStatus}`)
}

export function thirdPartyLogin(thirdPartyLoginDTO) {
  return post('/users/thirdPartyLogin', thirdPartyLoginDTO)
}

export function sendVerificationCode(sendVerificationCodeDTO) {
  return post('/users/sendVerificationCode', sendVerificationCodeDTO)
}

export function register(registerDTO) {
  return post('/users/register', registerDTO)
}

export function login(loginDTO) {
  return post('/users/login', loginDTO)
}

export function logout() {
  return post('/users/logout', {})
}

export function getUserInfo(userId) {
  return get(`/users/getUserInfo/${userId}`, {}, { cache: true, cacheTime: 10 * 60 * 1000 })
}

export function loginByCode(loginByCodeDTO) {
  return post('/users/loginByCode', loginByCodeDTO)
}

export function loginByCodeWithHandler(email, verificationCode) {
  return post('/users/loginByCode', { email, verificationCode }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '登录失败')
    }
    const { token, userId, username, avatarUrl, id, accountStatus } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (id) uni.setStorageSync('id', id)
    if (username) uni.setStorageSync('username', username)
    if (email) uni.setStorageSync('email', email)
    if (accountStatus !== undefined) uni.setStorageSync('accountStatus', accountStatus)
    
    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'
    
    const userInfo = { userId, id, username, nickname: username, avatar: finalAvatarUrl, email, accountStatus }
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    uni.$emit('userLogin', userInfo)
    return res
  })
}

export function createUser(userCreateDTO) {
  return post('/users/create', userCreateDTO)
}

export function getUserPage(params = {}) {
  return get('/users/page', params)
}

export function adminTest() {
  return get('/users/admin/test')
}

export function superAdminTest() {
  return get('/users/super/admin/test')
}

export function getCurrentUserInfo() {
  return get('/users/me', {}, { cache: true, cacheTime: 5 * 60 * 1000 })
}

export function resetPassword(resetPasswordDTO) {
  return post('/users/resetPassword/reset', resetPasswordDTO)
}

export function sendResetPasswordCode(email) {
  return post('/users/resetPassword/sendCode', { email })
}

export function changePassword(changePasswordDTO) {
  return post('/users/changePassword', changePasswordDTO)
}

export function sendVerificationCodeWithHandler(email) {
  return post('/users/sendVerificationCode', { email })
}

export function loginWithPassword(email, password) {
  return post('/users/login', { email, password }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '用户不存在')
    }
    const { token, userId, username, avatarUrl } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    if (email) uni.setStorageSync('email', email)
    
    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'
    
    const userInfo = { userId, username, nickname: username, avatar: finalAvatarUrl, email }
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    uni.$emit('userLogin', userInfo)
    return res
  })
}

export function registerWithHandler(registerData) {
  return post('/users/register', registerData).then(res => {
    const { token, userId, username, avatarUrl } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    
    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'
    
    const userInfo = { userId, username, nickname: registerData.username || username, avatar: finalAvatarUrl }
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    uni.$emit('userLogin', userInfo)
    return res
  })
}

export function deleteUser(userId) {
  return del(`/users/deleteUser/${userId}`)
}

export function thirdPartyLoginWithHandler(platform, code, extraData = {}) {
  return post('/users/thirdPartyLogin', { platform, code, ...extraData }).then(res => {
    const { token, userId, username, avatarUrl } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    
    let finalAvatarUrl = avatarUrl || extraData.avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'
    
    const userInfo = { userId, username, nickname: username || extraData.nickname, avatar: finalAvatarUrl }
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    uni.$emit('userLogin', userInfo)
    return res
  })
}
