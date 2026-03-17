// @ts-nocheck
import { hasNaN } from './validators.ts'

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

			// 仅在未设置 Content-Type 时才补默认值，避免覆盖 form-urlencoded 等显式设置
			args.header = args.header || {}
			if (!args.header['Content-Type'] && !args.header['content-type']) {
				args.header['Content-Type'] = 'application/json'
			}
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

