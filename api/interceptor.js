import { hasNaN } from './validators.js'

/**
 * 安装请求拦截器
 */
export const install = () => {
	uni.addInterceptor('request', {
		invoke(args) {
			// 屏蔽含有 NaN 的请求，防止 500 错误
			if (hasNaN(args.data) || (args.url && args.url.includes('NaN'))) {
				console.warn('已拦截含有 NaN 的无效请求:', args.url, args.data)
				return false // 拦截请求
			}

			// 设置请求头
			args.header = args.header || {}
			args.header['Content-Type'] = 'application/json'
		},
		success(args) {
			// 可选：记录成功的请求
		},
		fail(err) {
			// 可选：记录失败的请求
		},
		complete(res) {
			// 可选：记录完成的请求
		}
	})
}
