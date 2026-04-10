// @ts-nocheck
import { put, post, get, del, putWithQuery } from './request'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

// 为_syncLoginToStore函数添加类型定义
function _syncLoginToStore(userInfo: UserInfo, token: string) {
  const userStore = useUserStore()
  userStore.setToken(token)
  userStore.setUserInfo(userInfo)

  if (userInfo.userId) uni.setStorageSync('userId', userInfo.userId)
  if (userInfo.id) uni.setStorageSync('id', userInfo.id)
  if (userInfo.username) uni.setStorageSync('username', userInfo.username)
  if (userInfo.email) uni.setStorageSync('email', userInfo.email)
  if (userInfo.accountStatus !== undefined)
    uni.setStorageSync('accountStatus', userInfo.accountStatus)
  uni.setStorageSync('isLoggedIn', true)

  uni.$emit('userLogin', userInfo)
}

// 定义userInfoDTO的类型
export interface UserInfoDTO {
  userId?: number
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  accountStatus?: number
  birthday?: string
}

export function updateUserInfo(userInfoDTO: UserInfoDTO) {
  return put('/users/updateUserInfo', userInfoDTO)
}

export function updateUserStatus(userId: number, accountStatus: number) {
  return putWithQuery(`/users/status/${userId}`, {}, { accountStatus })
}

// 定义thirdPartyLoginDTO的类型
export interface ThirdPartyLoginDTO {
  email?: string
  password?: string
  verificationCode?: string
  thirdPartyType?: number
}

export function thirdPartyLogin(thirdPartyLoginDTO: ThirdPartyLoginDTO) {
  return post('/users/thirdPartyLogin', thirdPartyLoginDTO)
}

export function sendVerificationCode(sendVerificationCodeDTO: SendVerificationCodeDTO) {
  return post('/users/sendVerificationCode', sendVerificationCodeDTO)
}

export function register(registerDTO: RegisterDTO) {
  return post('/users/register', registerDTO)
}

export function login(loginDTO: LoginDTO) {
  return post('/users/login', loginDTO)
}

export function logout() {
  return post('/users/logout', {})
}

export function getUserInfo(userId: number) {
  return get(`/users/getUserInfo/${userId}`, {}, { cache: true, cacheTime: 10 * 60 * 1000 })
}

export function loginByCode(loginByCodeDTO: LoginByCodeDTO) {
  return post('/users/loginByCode', loginByCodeDTO)
}

export function loginByCodeWithHandler(email: string, verificationCode: string) {
  return post('/users/loginByCode', { email, verificationCode }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '????')
    }
    const { token, userId, username, avatarUrl, id, accountStatus, birthday } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = {
      userId,
      id,
      username,
      nickname: username,
      avatar: finalAvatarUrl,
      email,
      accountStatus,
      birthday
    }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

export function createUser(userCreateDTO: UserCreateDTO) {
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

export function resetPassword(resetPasswordDTO: ResetPasswordDTO) {
  return post('/users/resetPassword/reset', resetPasswordDTO)
}

export function sendResetPasswordCode(email: string) {
  return post('/users/resetPassword/sendCode', { email })
}

export function changePassword(changePasswordDTO: ChangePasswordDTO) {
  return post('/users/changePassword', changePasswordDTO)
}

// 为sendVerificationCodeWithHandler函数参数添加类型注解
export function sendVerificationCodeWithHandler(email: string) {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  return post('/users/sendVerificationCode', { email }).then(res => {
    if (res.code !== 1 && res.code !== 200) {
      throw new Error(res.msg || texts.sendCodeFailed || '???????')
    }
    return res
  })
}

export function loginWithPassword(email: string, password: string) {
  return post('/users/login', { email, password }).then(res => {
    if (!res.data) {
      throw new Error(res.msg || '?????')
    }
    const { token, userId, username, avatarUrl, birthday } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = {
      userId,
      username,
      nickname: username,
      avatar: finalAvatarUrl,
      email,
      birthday
    }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

export function registerWithHandler(registerData: RegisterDTO) {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  const errorCodeMap = {
    100209: texts.emailExists || '?????',
    100210: texts.codeError || '?????',
    100211: texts.codeExpired || '??????'
  }

  return post('/users/register', registerData).then(res => {
    if (res.code !== 1 && res.code !== 200) {
      const errorMsg = errorCodeMap[res.code] || res.msg || texts.registerFailed || '????'
      throw new Error(errorMsg)
    }
    const { token, userId, username, avatarUrl } = res.data

    let finalAvatarUrl = avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = {
      userId,
      username,
      nickname: registerData.username || username,
      avatar: finalAvatarUrl
    }
    _syncLoginToStore(userInfo, token)
    return res
  })
}

export function deleteUser(userId: number) {
  return del(`/users/deleteUser/${userId}`)
}

export function thirdPartyLoginWithHandler(platform: string, code: string, extraData = {}) {
  return post('/users/thirdPartyLogin', { platform, code, ...extraData }).then(res => {
    const { token, userId, username, avatarUrl } = res.data

    let finalAvatarUrl = avatarUrl || extraData.avatarUrl || '/static/images/Default avatar.png'
    if (finalAvatarUrl.startsWith('blob:')) finalAvatarUrl = '/static/images/Default avatar.png'

    const userInfo = {
      userId,
      username,
      nickname: username || extraData.nickname,
      avatar: finalAvatarUrl
    }
    _syncLoginToStore(userInfo, token)
    return res
  })
}
