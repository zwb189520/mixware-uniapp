import { put, post, get, del } from './request'

export function updateUserInfo(userInfoDTO) {
  return put('/users/updateUserInfo', userInfoDTO)
}

export function updateUserStatus(userId, accountStatus) {
  return put(`/users/status/${userId}`, { accountStatus })
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
  return get(`/users/${userId}`, {}, { cache: true, cacheTime: 10 * 60 * 1000 })
}

export function getCurrentUserInfo() {
  return get('/users/me', {}, { cache: true, cacheTime: 5 * 60 * 1000 })
}

export function resetPassword(resetPasswordDTO) {
  return post('/users/resetPassword', resetPasswordDTO)
}

export function changePassword(changePasswordDTO) {
  return post('/users/changePassword', changePasswordDTO)
}

export function sendVerificationCodeWithHandler(email) {
  return post('/users/sendVerificationCode', { email })
}

export function loginWithPassword(email, password) {
  return post('/users/login', { email, password }).then(res => {
    const { token, userId, username, nickname, avatar } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    
    let avatarUrl = avatar || '/static/default-avatar.png'
    if (avatarUrl.startsWith('blob:')) avatarUrl = '/static/default-avatar.png'
    
    const userInfo = { userId, username, nickname: nickname || username, avatar: avatarUrl }
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('isLoggedIn', true)
    uni.$emit('userLogin', userInfo)
    return res
  })
}

export function registerWithHandler(registerData) {
  return post('/users/register', registerData).then(res => {
    const { token, userId, username } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    return res
  })
}

export function deleteUser(userId) {
  return del(`/users/deleteUser/${userId}`)
}

export function thirdPartyLoginWithHandler(platform, code, extraData = {}) {
  return post('/users/thirdPartyLogin', { platform, code, ...extraData }).then(res => {
    const { token, userId, username } = res.data
    if (token) uni.setStorageSync('token', token)
    if (userId) uni.setStorageSync('userId', userId)
    if (username) uni.setStorageSync('username', username)
    return res
  })
}
