import { get, post } from './request'

export const googleCallback = (code, state) => {
	return get('/auth/oauth/callback/google', { code, state })
}

export const appleCallback = (params) => {
	// Apple登录使用POST，传递完整的用户信息
	return post('/auth/oauth/callback/apple', params)
}

export const getGoogleOAuthConfig = () => {
	return get('/auth/google/config')
}

export const getAppleConfig = () => {
	return get('/auth/apple/config')
}

export default {
	googleCallback,
	appleCallback,
	getGoogleOAuthConfig,
	getAppleConfig
}