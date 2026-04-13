import { put, post, get, del, putWithQuery } from './request'
import { useLanguageStore, useUserStore } from '@/stores/index.ts'

interface UserInfo {
  userId?: number
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  accountStatus?: number
  birthday?: string
}

interface SendVerificationCodeDTO {
  email: string
}

interface RegisterDTO {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  verificationCode?: string
  birthday?: string
  privacyAgreed?: boolean
  marketingOptIn?: boolean
}

interface LoginDTO {
  email?: string
  password?: string
  verificationCode?: string
}

interface LoginByCodeDTO {
  email: string
  verificationCode: string
}

interface ResetPasswordDTO {
  email: string
  verificationCode: string
  newPassword: string
}

interface ChangePasswordDTO {
  oldPassword: string
  newPassword: string
}

interface UserCreateDTO {
  username: string
  email: string
  password: string
}

interface ApiRes {
  code?: number
  msg?: string
  data?: Record<string, unknown>
}

function handleLoginSuccess(data: Record<string, unknown> | undefined, email?: string): void {
  if (!data) return
  const { token, userId, username, avatarUrl, id, accountStatus, birthday } = data
  const userStore = useUserStore()
  userStore.login(String(token ?? ''), {
    userId: userId as number | undefined,
    id: id as number | undefined,
    username: username as string | undefined,
    nickname: username as string | undefined,
    avatar: avatarUrl as string | undefined,
    email: email,
    accountStatus: accountStatus as number | undefined,
    birthday: birthday as string | undefined
  })
}

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

export interface ThirdPartyLoginDTO {
  email?: string
  password?: string
  verificationCode?: string
  thirdPartyType?: number
}

export function thirdPartyLogin(thirdPartyLoginDTO: ThirdPartyLoginDTO) {
  return post('/users/thirdPartyLogin', thirdPartyLoginDTO)
}

export function sendVerificationCode(sendVerificationCodeDTO: SendVerificationCodeDTO): Promise<unknown> {
  return post('/users/sendVerificationCode', sendVerificationCodeDTO)
}

export function register(registerDTO: RegisterDTO): Promise<unknown> {
  return post('/users/register', registerDTO)
}

export function login(loginDTO: LoginDTO): Promise<unknown> {
  return post('/users/login', loginDTO)
}

export function logout(): Promise<unknown> {
  return post('/users/logout', {})
}

export function getUserInfo(userId: number): Promise<unknown> {
  return get(`/users/getUserInfo/${userId}`, {}, { cache: true, cacheTime: 10 * 60 * 1000 })
}

export function loginByCode(loginByCodeDTO: LoginByCodeDTO): Promise<unknown> {
  return post('/users/loginByCode', loginByCodeDTO)
}

export function loginByCodeWithHandler(email: string, verificationCode: string): Promise<unknown> {
  return post('/users/loginByCode', { email, verificationCode }).then(res => {
    const r = res as ApiRes
    if (!r.data) {
      throw new Error(r.msg || '登录失败')
    }
    handleLoginSuccess(r.data, email)
    return res
  })
}

export function createUser(userCreateDTO: UserCreateDTO): Promise<unknown> {
  return post('/users/create', userCreateDTO)
}

export function getUserPage(params: Record<string, unknown> = {}): Promise<unknown> {
  return get('/users/page', params)
}

export function adminTest(): Promise<unknown> {
  return get('/users/admin/test')
}

export function superAdminTest(): Promise<unknown> {
  return get('/users/super/admin/test')
}

export function getCurrentUserInfo(): Promise<unknown> {
  return get('/users/me', {}, { cache: true, cacheTime: 5 * 60 * 1000 })
}

export function resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<unknown> {
  return post('/users/resetPassword/reset', resetPasswordDTO)
}

export function sendResetPasswordCode(email: string): Promise<unknown> {
  return post('/users/resetPassword/sendCode', { email })
}

export function changePassword(changePasswordDTO: ChangePasswordDTO): Promise<unknown> {
  return post('/users/changePassword', changePasswordDTO)
}

export function sendVerificationCodeWithHandler(email: string): Promise<unknown> {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  return post('/users/sendVerificationCode', { email }).then(res => {
    const r = res as ApiRes
    if (r.code !== 1 && r.code !== 200) {
      throw new Error(r.msg || texts.sendCodeFailed || '发送验证码失败')
    }
    return res
  })
}

export function loginWithPassword(email: string, password: string): Promise<unknown> {
  return post('/users/login', { email, password }).then(res => {
    const r = res as ApiRes
    if (!r.data) {
      throw new Error(r.msg || '登录失败')
    }
    handleLoginSuccess(r.data, email)
    return res
  })
}

export function registerWithHandler(registerData: RegisterDTO): Promise<unknown> {
  const languageStore = useLanguageStore()
  const texts = languageStore.texts.login || {}

  const errorCodeMap: Record<number, string> = {
    100209: texts.emailExists || '邮箱已存在',
    100210: texts.codeError || '验证码错误',
    100211: texts.codeExpired || '验证码已过期'
  }

  return post('/users/register', registerData).then(res => {
    const r = res as ApiRes
    if (r.code !== 1 && r.code !== 200) {
      const errorMsg = errorCodeMap[r.code ?? 0] || r.msg || texts.registerFailed || '注册失败'
      throw new Error(errorMsg)
    }
    handleLoginSuccess(r.data, registerData.email)
    return res
  })
}

export function deleteUser(userId: number): Promise<unknown> {
  return del(`/users/deleteUser/${userId}`)
}

export function thirdPartyLoginWithHandler(platform: string, code: string, extraData: Record<string, unknown> = {}): Promise<unknown> {
  return post('/users/thirdPartyLogin', { platform, code, ...extraData }).then(res => {
    const r = res as ApiRes
    handleLoginSuccess({
      ...r.data,
      avatarUrl: r.data?.avatarUrl || extraData.avatarUrl,
      username: r.data?.username || extraData.nickname
    })
    return res
  })
}
